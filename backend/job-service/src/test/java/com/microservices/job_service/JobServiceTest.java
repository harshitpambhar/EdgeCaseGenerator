package com.microservices.job_service;

import com.microservices.job_service.docker.DockerWorkerService;
import com.microservices.job_service.dto.CreateJobRequest;
import com.microservices.job_service.dto.JobResponse;
import com.microservices.job_service.entity.Job;
import com.microservices.job_service.entity.JobStatus;
import com.microservices.job_service.exception.JobNotFoundException;
import com.microservices.job_service.repository.JobRepository;
import com.microservices.job_service.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private DockerWorkerService dockerWorkerService;

    @Mock
    private ApplicationContext applicationContext;

    // Constructed manually so we can spy without needing a no-arg constructor
    private JobService jobService;

    private Job sampleJob;

    @BeforeEach
    void setUp() {
        jobService = spy(new JobService(jobRepository, dockerWorkerService, applicationContext));

        sampleJob = Job.builder()
                .id(UUID.randomUUID())
                .repoUrl("https://github.com/user/repo")
                .status(JobStatus.QUEUED)
                .build();
    }

    @Test
    void createJob_persistsAndReturnsQueued() {
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);
        when(applicationContext.getBean(JobService.class)).thenReturn(jobService);
        doNothing().when(jobService).launchWorkerAsync(any(UUID.class));

        CreateJobRequest request = new CreateJobRequest("https://github.com/user/repo");
        JobResponse response = jobService.createJob(request);

        assertThat(response.getStatus()).isEqualTo(JobStatus.QUEUED);
        assertThat(response.getRepoUrl()).isEqualTo("https://github.com/user/repo");
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void getJob_returnsJobWhenFound() {
        when(jobRepository.findById(sampleJob.getId())).thenReturn(Optional.of(sampleJob));

        JobResponse response = jobService.getJob(sampleJob.getId());

        assertThat(response.getId()).isEqualTo(sampleJob.getId());
    }

    @Test
    void getJob_throwsWhenNotFound() {
        UUID unknown = UUID.randomUUID();
        when(jobRepository.findById(unknown)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.getJob(unknown))
                .isInstanceOf(JobNotFoundException.class)
                .hasMessageContaining(unknown.toString());
    }

    @Test
    void getAllJobs_returnsMappedList() {
        when(jobRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(sampleJob));

        List<JobResponse> jobs = jobService.getAllJobs();

        assertThat(jobs).hasSize(1);
        assertThat(jobs.get(0).getRepoUrl()).isEqualTo(sampleJob.getRepoUrl());
    }

    @Test
    void deleteJob_removesEntity() {
        when(jobRepository.findById(sampleJob.getId())).thenReturn(Optional.of(sampleJob));

        jobService.deleteJob(sampleJob.getId());

        verify(jobRepository).delete(sampleJob);
    }

    @Test
    void launchWorkerAsync_marksCompletedOnSuccess() {
        when(jobRepository.findById(sampleJob.getId())).thenReturn(Optional.of(sampleJob));
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);
        when(dockerWorkerService.runWorker(any(), any()))
                .thenReturn(new DockerWorkerService.WorkerResult("cid-123", 0, "=== SCAN END ==="));

        jobService.launchWorkerAsync(sampleJob.getId());

        assertThat(sampleJob.getStatus()).isEqualTo(JobStatus.COMPLETED);
        assertThat(sampleJob.getContainerId()).isEqualTo("cid-123");
    }

    @Test
    void launchWorkerAsync_marksFailedOnNonZeroExit() {
        when(jobRepository.findById(sampleJob.getId())).thenReturn(Optional.of(sampleJob));
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);
        when(dockerWorkerService.runWorker(any(), any()))
                .thenReturn(new DockerWorkerService.WorkerResult("cid-456", 128, "fatal: repo not found"));

        jobService.launchWorkerAsync(sampleJob.getId());

        assertThat(sampleJob.getStatus()).isEqualTo(JobStatus.FAILED);
    }
}
