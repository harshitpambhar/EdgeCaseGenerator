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
        self().launchWorkerAsync(job.getId());

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

    @Async
    public void launchWorkerAsync(UUID jobId) {
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) {
            log.error("launchWorkerAsync: job {} not found", jobId);
            return;
        }

        markRunning(job);

        try {
            DockerWorkerService.WorkerResult result =
                    dockerWorkerService.runWorker(job.getRepoUrl(), jobId.toString());

            if (result.succeeded()) {
                markCompleted(job, result.containerId(), result.logs());
            } else {
                markFailed(job, result.containerId(),
                        "Container exited with code " + result.exitCode() + "\n" + result.logs());
            }
        } catch (Exception ex) {
            log.error("Worker failed for job {}: {}", jobId, ex.getMessage(), ex);
            markFailed(job, null, ex.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Status transitions
    // -------------------------------------------------------------------------

    private void markRunning(Job job) {
        job.setStatus(JobStatus.RUNNING);
        jobRepository.save(job);
        log.info("Job {} → RUNNING", job.getId());
    }

    private void markCompleted(Job job, String containerId, String logs) {
        job.setStatus(JobStatus.COMPLETED);
        job.setContainerId(containerId);
        job.setResultJson(buildResultJson(logs));
        job.setCompletedAt(Instant.now());
        jobRepository.save(job);
        log.info("Job {} → COMPLETED", job.getId());
    }

    private void markFailed(Job job, String containerId, String errorMessage) {
        job.setStatus(JobStatus.FAILED);
        if (containerId != null) job.setContainerId(containerId);
        job.setErrorMessage(errorMessage);
        job.setCompletedAt(Instant.now());
        jobRepository.save(job);
        log.warn("Job {} → FAILED: {}", job.getId(), errorMessage);
    }

    private Job findOrThrow(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job not found: " + id));
    }

    /** Returns the Spring-proxied instance of this bean so @Async is applied. */
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
