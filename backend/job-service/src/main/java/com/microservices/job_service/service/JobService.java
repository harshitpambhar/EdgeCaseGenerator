package com.microservices.job_service.service;

import com.microservices.job_service.docker.DockerWorkerService;
import com.microservices.job_service.dto.CreateJobRequest;
import com.microservices.job_service.dto.JobResponse;
import com.microservices.job_service.entity.Job;
import com.microservices.job_service.entity.JobStatus;
import com.microservices.job_service.exception.JobNotFoundException;
import com.microservices.job_service.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

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

        try {
            DockerWorkerService.WorkerResult result
                    = dockerWorkerService.runWorker(job.getRepoUrl(), job.getId().toString());

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
    public void markCompleted(Job job, String containerId, String logs) {
        Job managed = jobRepository.findById(job.getId()).orElse(job);
        managed.setStatus(JobStatus.COMPLETED);
        managed.setContainerId(containerId);
        managed.setContainerStatus("EXITED");
        managed.setLogs(logs);
        managed.setResultJson(buildResultJson(logs));
        managed.setCompletedAt(Instant.now());
        jobRepository.save(managed);
        log.info("Job {} → COMPLETED (container={})", managed.getId(), containerId);
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
        String escaped = logs == null ? "" : logs
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
        return "{\"logs\":\"" + escaped + "\"}";
    }
}
