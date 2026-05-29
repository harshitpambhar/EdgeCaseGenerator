package com.microservices.job_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateJobRequest {

    @NotBlank(message = "Repository URL is required")
    @Pattern(
        regexp = "^https://github\\.com/[\\w.-]+/[\\w.-]+(\\.git)?$",
        message = "Must be a valid GitHub HTTPS URL"
    )
    private String repoUrl;

    private String userName;

    private String userEmail;
}
