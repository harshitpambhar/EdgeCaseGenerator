package com.microservices.repo_analysis_service.exception;

public class RepositoryAnalysisException extends RuntimeException {

    public RepositoryAnalysisException(String message) {
        super(message);
    }

    public RepositoryAnalysisException(String message, Throwable cause) {
        super(message, cause);
    }

}
