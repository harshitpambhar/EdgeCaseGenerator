package com.microservices.job_service.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.microservices.job_service.docker.DockerWorkerService;
import com.microservices.job_service.dto.CreateJobRequest;
import com.microservices.job_service.dto.JobResponse;
import com.microservices.job_service.entity.Job;
import com.microservices.job_service.entity.JobStatus;
import com.microservices.job_service.exception.JobNotFoundException;
import com.microservices.job_service.repository.JobRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final DockerWorkerService dockerWorkerService;
    private final ApplicationContext applicationContext;

    @Transactional
    public JobResponse createJob(CreateJobRequest request) {
        Job job = Job.builder()
                .repoUrl(request.getRepoUrl())
                .status(JobStatus.QUEUED)
                .userName(request.getUserName())
                .userEmail(request.getUserEmail())
                .build();

        job = jobRepository.save(job);
        log.info("Job created: id={} repoUrl={}", job.getId(), job.getRepoUrl());

        // Invoke through the Spring proxy so @Async is honoured
        // Pass the saved Job entity directly to avoid async visibility race
        // (async thread runs before the creating transaction may be visible to other transactions)
        self().launchWorkerAsync(job);

        return JobResponse.from(job);
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(UUID id) {
        return JobResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(JobResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByUser(String userEmail) {
        return jobRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(JobResponse::from)
                .toList();
    }

    @Transactional
    public void deleteJob(UUID id) {
        Job job = findOrThrow(id);
        jobRepository.delete(job);
        log.info("Job deleted: id={}", id);
    }

    // -------------------------------------------------------------------------
    // Async worker execution — must be called via proxy (self()) to honour @Async
    // -------------------------------------------------------------------------
    // NOTE: No @Transactional here! Each status transition is its own transaction.
    // This is critical: it allows the frontend polling to see RUNNING status
    // while the Docker container is still executing.
    @Async
    public void launchWorkerAsync(Job job) {
        if (job == null || job.getId() == null) {
            log.error("launchWorkerAsync: invalid job provided: {}", job);
            return;
        }

        log.info("launchWorkerAsync: starting async worker for job id={}", job.getId());

        // Persist RUNNING state in its own transaction — immediately visible to frontend
        markRunning(job);

        // A thread-safe buffer for streaming logs
        StringBuffer logBuffer = new StringBuffer();
        long[] lastFlushTime = {System.currentTimeMillis()};

        java.util.function.Consumer<String> logConsumer = chunk -> {
            logBuffer.append(chunk);
            long now = System.currentTimeMillis();
            if (now - lastFlushTime[0] > 1000) { // flush every 1 second
                String toFlush;
                synchronized (logBuffer) {
                    toFlush = logBuffer.toString();
                    logBuffer.setLength(0);
                }
                if (!toFlush.isEmpty()) {
                    self().appendLogs(job.getId(), toFlush);
                }
                lastFlushTime[0] = now;
            }
        };

        try {
            DockerWorkerService.WorkerResult result
                    = dockerWorkerService.runWorker(job.getRepoUrl(), job.getId().toString(), logConsumer);

            // Flush remaining logs before completion
            String remainingLogs;
            synchronized (logBuffer) {
                remainingLogs = logBuffer.toString();
                logBuffer.setLength(0);
            }
            if (!remainingLogs.isEmpty()) {
                self().appendLogs(job.getId(), remainingLogs);
            }

            if (result.succeeded()) {
                markCompleted(job, result.containerId(), result.logs());
            } else {
                markFailed(job, result.containerId(),
                        "Container exited with code " + result.exitCode() + "\n" + result.logs());
            }
        } catch (Exception ex) {
            log.error("Worker failed for job {}: {}", job.getId(), ex.getMessage(), ex);
            markFailed(job, null, ex.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Status transitions — each is a separate transaction so status changes
    // are immediately visible to frontend polling.
    // -------------------------------------------------------------------------
    @Transactional
    public void markRunning(Job job) {
        // Re-fetch from DB to get a managed entity in this transaction
        Job managed = jobRepository.findById(job.getId()).orElse(job);
        managed.setStatus(JobStatus.RUNNING);
        managed.setStartedAt(Instant.now());
        managed.setContainerStatus("STARTING");
        jobRepository.save(managed);
        log.info("Job {} → RUNNING", managed.getId());
    }

    @Transactional
    public void markCompleted(Job job, String containerId, String finalLogs) {
        Job managed = jobRepository.findById(job.getId()).orElse(job);
        managed.setStatus(JobStatus.COMPLETED);
        managed.setContainerId(containerId);
        managed.setContainerStatus("EXITED");
        managed.setCompletedAt(Instant.now());

        // Append any remaining bytes not yet flushed by the streaming consumer
        String existingLogs = managed.getLogs() == null ? "" : managed.getLogs();
        String fullLogs;
        if (finalLogs != null && !finalLogs.isEmpty() && !existingLogs.endsWith(finalLogs)) {
            // Only append if it's genuinely new content (avoid duplicate if already streamed)
            // A simple heuristic: if the final logs contain the JSON markers, prefer them;
            // otherwise keep what we already have from streaming.
            if (finalLogs.contains("---RESULT_JSON_START---")) {
                fullLogs = existingLogs.isEmpty() ? finalLogs
                        : existingLogs.contains("---RESULT_JSON_START---") ? existingLogs
                        : existingLogs + finalLogs;
            } else {
                fullLogs = existingLogs.isEmpty() ? finalLogs : existingLogs;
            }
        } else {
            fullLogs = existingLogs.isEmpty() ? (finalLogs == null ? "" : finalLogs) : existingLogs;
        }

        managed.setLogs(fullLogs);
        managed.setResultJson(buildResultJson(fullLogs));
        jobRepository.save(managed);
        log.info("Job {} → COMPLETED (container={}, resultJson captured={})",
                managed.getId(), containerId,
                managed.getResultJson() != null && managed.getResultJson().contains("generated_tests"));
    }

    @Transactional
    public void markFailed(Job job, String containerId, String errorMessage) {
        Job managed = jobRepository.findById(job.getId()).orElse(job);
        managed.setStatus(JobStatus.FAILED);
        if (containerId != null) {
            managed.setContainerId(containerId);
        }
        managed.setContainerStatus("FAILED");
        managed.setErrorMessage(errorMessage);
        managed.setCompletedAt(Instant.now());
        jobRepository.save(managed);
        log.warn("Job {} → FAILED: {}", managed.getId(), errorMessage);
    }

    @Transactional
    public void appendLogs(UUID jobId, String newLogs) {
        if (newLogs == null || newLogs.isEmpty()) {
            return;
        }
        jobRepository.findById(jobId).ifPresent(job -> {
            String currentLogs = job.getLogs();
            if (currentLogs == null) {
                currentLogs = "";
            }
            job.setLogs(currentLogs + newLogs);
            jobRepository.save(job);
        });
    }

    private Job findOrThrow(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job not found: " + id));
    }

    /**
     * Returns the Spring-proxied instance of this bean so @Async is applied.
     */
    private JobService self() {
        return applicationContext.getBean(JobService.class);
    }

    private String buildResultJson(String logs) {
        if (logs == null) {
            return "{\"logs\":\"\"}";
        }

        String startMarker = "---RESULT_JSON_START---";
        String endMarker = "---RESULT_JSON_END---";

        int startIndex = logs.indexOf(startMarker);
        int endIndex = logs.indexOf(endMarker);

        if (startIndex != -1) {
            // Extract the actual structured JSON
            String jsonStr = endIndex != -1 && endIndex > startIndex
                    ? logs.substring(startIndex + startMarker.length(), endIndex).trim()
                    : logs.substring(startIndex + startMarker.length()).trim();
            if (!jsonStr.isEmpty()) {
                return jsonStr;
            }
        }

        // Fallback to old wrapping if no markers found
        String escaped = logs
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
        return "{\"logs\":\"" + escaped + "\"}";
    }
}
