package com.microservices.job_service.dto;

import com.microservices.job_service.entity.Job;
import com.microservices.job_service.entity.JobStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class JobResponse {

    private UUID id;
    private String repoUrl;
    private JobStatus status;
    private String containerId;
    private String workspacePath;
    private String resultJson;
    private String errorMessage;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant completedAt;

    public static JobResponse from(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .repoUrl(job.getRepoUrl())
                .status(job.getStatus())
                .containerId(job.getContainerId())
                .workspacePath(job.getWorkspacePath())
                .resultJson(job.getResultJson())
                .errorMessage(job.getErrorMessage())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }
}
