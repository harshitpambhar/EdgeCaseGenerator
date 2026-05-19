package com.microservices.repo_analysis_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {

    @NotBlank(message = "Repository URL is required")
    @Pattern(
            regexp = "^(https?://)?github\\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+/?$",
            message = "Invalid GitHub repository URL format"
    )
    private String repoUrl;

}
