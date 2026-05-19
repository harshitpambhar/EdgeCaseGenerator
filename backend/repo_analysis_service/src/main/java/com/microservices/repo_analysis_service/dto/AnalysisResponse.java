package com.microservices.repo_analysis_service.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResponse {

    private String repository;
    private String owner;
    private String description;
    private String url;

    private List<String> languages;
    private List<String> frameworks;
    private String buildTool;
    private String testFramework;
    private String packageManager;

    private Integer fileCount;
    private Integer directoryCount;
    private Double estimatedSize; // in MB

    private List<String> directories;
    private Map<String, Integer> fileTypeDistribution;

    private List<String> riskAreas;
    private List<String> recommendations;

    private Long analysisTimeMs;
    private String analysisStatus; // SUCCESS, PARTIAL, FAILED

}
