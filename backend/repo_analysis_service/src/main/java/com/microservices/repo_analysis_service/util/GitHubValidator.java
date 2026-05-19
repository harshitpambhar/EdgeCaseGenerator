package com.microservices.repo_analysis_service.util;

import java.util.regex.Pattern;

import com.microservices.repo_analysis_service.exception.InvalidRepositoryException;

public class GitHubValidator {

    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile(
            "^(https?://)?github\\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+/?$"
    );

    private static final Pattern GITHUB_OWNER_REPO_PATTERN = Pattern.compile(
            "github\\.com/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_.-]+)"
    );

    public static void validateGitHubUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new InvalidRepositoryException("Repository URL cannot be empty");
        }

        if (!GITHUB_URL_PATTERN.matcher(url).matches()) {
            throw new InvalidRepositoryException(
                    "Invalid GitHub repository URL format. Expected: https://github.com/owner/repo"
            );
        }
    }

    public static String normalizeGitHubUrl(String url) {
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }
        if (!url.endsWith(".git")) {
            url = url + ".git";
        }
        return url;
    }

    public static String extractOwner(String url) {
        var matcher = GITHUB_OWNER_REPO_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new InvalidRepositoryException("Could not extract owner from URL: " + url);
    }

    public static String extractRepository(String url) {
        var matcher = GITHUB_OWNER_REPO_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(2).replaceAll("\\.git$", "");
        }
        throw new InvalidRepositoryException("Could not extract repository name from URL: " + url);
    }

}
