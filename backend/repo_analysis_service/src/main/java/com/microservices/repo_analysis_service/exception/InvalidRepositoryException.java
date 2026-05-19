package com.microservices.repo_analysis_service.exception;

public class InvalidRepositoryException extends RuntimeException {

    public InvalidRepositoryException(String message) {
        super(message);
    }

    public InvalidRepositoryException(String message, Throwable cause) {
        super(message, cause);
    }

}
