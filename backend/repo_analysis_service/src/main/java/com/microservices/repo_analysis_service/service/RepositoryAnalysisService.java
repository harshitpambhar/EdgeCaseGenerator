package com.microservices.repo_analysis_service.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.microservices.repo_analysis_service.dto.AnalysisResponse;
import com.microservices.repo_analysis_service.exception.RepositoryAnalysisException;
import com.microservices.repo_analysis_service.util.FileScanner;
import com.microservices.repo_analysis_service.util.GitHubValidator;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RepositoryAnalysisService {

    private final GitHubRepositoryService gitHubRepositoryService;

    public RepositoryAnalysisService(GitHubRepositoryService gitHubRepositoryService) {
        this.gitHubRepositoryService = gitHubRepositoryService;
    }

    public AnalysisResponse analyzeRepository(String repoUrl) throws RepositoryAnalysisException {
        long startTime = System.currentTimeMillis();
        Path clonedRepoPath = null;

        try {
            log.info("Starting repository analysis for: {}", repoUrl);

            // Clone repository
            clonedRepoPath = gitHubRepositoryService.cloneRepository(repoUrl);

            // Extract metadata
            String owner = GitHubValidator.extractOwner(repoUrl);
            String repository = GitHubValidator.extractRepository(repoUrl);

            // Scan files
            Map<String, Object> scanResults = FileScanner.scanRepository(clonedRepoPath);

            @SuppressWarnings("unchecked")
            List<String> allFiles = (List<String>) scanResults.get("allFiles");
            @SuppressWarnings("unchecked")
            List<String> directories = (List<String>) scanResults.get("directories");
            @SuppressWarnings("unchecked")
            Map<String, Integer> fileTypeDistribution = (Map<String, Integer>) scanResults.get("fileTypeDistribution");
            @SuppressWarnings("unchecked")
            Set<String> detectedLanguages = (Set<String>) scanResults.get("detectedLanguages");

            int fileCount = (int) scanResults.get("fileCount");
            int directoryCount = (int) scanResults.get("directoryCount");

            // Detect frameworks
            Set<String> frameworks = FileScanner.detectFrameworks(clonedRepoPath, allFiles);
            String buildTool = FileScanner.detectBuildTool(allFiles);
            String testFramework = FileScanner.detectTestFramework(allFiles);

            // Calculate size
            double sizeInMB = calculateDirectorySize(clonedRepoPath) / (1024.0 * 1024.0);

            // Detect risks and recommendations
            List<String> riskAreas = FileScanner.detectRiskAreas(clonedRepoPath, detectedLanguages, allFiles);
            List<String> recommendations = FileScanner.generateRecommendations(detectedLanguages, buildTool, riskAreas);

            long analysisTime = System.currentTimeMillis() - startTime;

            // Build response
            return AnalysisResponse.builder()
                    .repository(repository)
                    .owner(owner)
                    .url(repoUrl)
                    .languages(new ArrayList<>(detectedLanguages))
                    .frameworks(new ArrayList<>(frameworks))
                    .buildTool(buildTool)
                    .testFramework(testFramework)
                    .packageManager(detectPackageManager(allFiles))
                    .fileCount(fileCount)
                    .directoryCount(directoryCount)
                    .estimatedSize(sizeInMB)
                    .directories(directories)
                    .fileTypeDistribution(fileTypeDistribution)
                    .riskAreas(riskAreas)
                    .recommendations(recommendations)
                    .analysisTimeMs(analysisTime)
                    .analysisStatus("SUCCESS")
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing repository: {}", e.getMessage(), e);
            throw new RepositoryAnalysisException("Analysis failed: " + e.getMessage(), e);

        } finally {
            // Cleanup
            if (clonedRepoPath != null) {
                gitHubRepositoryService.cleanupRepository(clonedRepoPath);
            }
        }
    }

    private String detectPackageManager(List<String> files) {
        for (String file : files) {
            String name = file.toLowerCase();
            if (name.contains("package.json")) {
                return "npm";
            }
            if (name.contains("yarn.lock")) {
                return "yarn";
            }
            if (name.contains("pnpm-lock")) {
                return "pnpm";
            }
            if (name.contains("requirements.txt")) {
                return "pip";
            }
            if (name.contains("gemfile")) {
                return "bundler";
            }
            if (name.contains("composer.json")) {
                return "composer";
            }
            if (name.contains("go.mod")) {
                return "go modules";
            }
            if (name.contains("cargo.lock")) {
                return "cargo";
            }
        }
        return "Unknown";
    }

    private long calculateDirectorySize(Path path) throws Exception {
        return Files.walk(path)
                .filter(Files::isRegularFile)
                .mapToLong(p -> {
                    try {
                        return Files.size(p);
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .sum();
    }

}
