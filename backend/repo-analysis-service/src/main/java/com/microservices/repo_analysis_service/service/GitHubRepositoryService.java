package com.microservices.repo_analysis_service.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.stereotype.Service;

import com.microservices.repo_analysis_service.exception.RepositoryAnalysisException;
import com.microservices.repo_analysis_service.util.GitHubValidator;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GitHubRepositoryService {

    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir");
    private static final long MAX_REPO_SIZE_MB = 500; // 500 MB limit

    public Path cloneRepository(String repoUrl) throws RepositoryAnalysisException {
        try {
            GitHubValidator.validateGitHubUrl(repoUrl);
            String normalizedUrl = GitHubValidator.normalizeGitHubUrl(repoUrl);
            String repoName = GitHubValidator.extractRepository(repoUrl);

            Path tempDirPath = Files.createTempDirectory("repo-analysis-" + repoName + "-");
            log.info("Created temp directory: {}", tempDirPath);

            log.info("Cloning repository from: {}", normalizedUrl);
            Git.cloneRepository()
                    .setURI(normalizedUrl)
                    .setDirectory(tempDirPath.toFile())
                    .setTimeout(60)
                    .call();

            log.info("Repository cloned successfully to: {}", tempDirPath);

            checkRepositorySize(tempDirPath);

            return tempDirPath;

        } catch (GitAPIException e) {
            throw new RepositoryAnalysisException("Failed to clone repository: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RepositoryAnalysisException("Repository operation failed: " + e.getMessage(), e);
        }
    }

    public void cleanupRepository(Path repoPath) {
        try {
            if (repoPath != null && Files.exists(repoPath)) {
                Files.walk(repoPath)
                        .sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.deleteIfExists(path);
                            } catch (Exception e) {
                                log.warn("Could not delete: {}", path, e);
                            }
                        });
                log.info("Cleaned up repository at: {}", repoPath);
            }
        } catch (Exception e) {
            log.error("Error during cleanup: {}", e.getMessage(), e);
        }
    }

    private void checkRepositorySize(Path repoPath) throws Exception {
        double sizeInMB = calculateDirectorySize(repoPath) / (1024.0 * 1024.0);
        if (sizeInMB > MAX_REPO_SIZE_MB) {
            cleanupRepository(repoPath);
            throw new RepositoryAnalysisException(
                    "Repository size (" + String.format("%.2f", sizeInMB) + " MB) exceeds maximum limit of "
                    + MAX_REPO_SIZE_MB + " MB"
            );
        }
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
