package com.microservices.auth_service.exception;

public class BadCredentialsException extends RuntimeException {

    public BadCredentialsException(String message) {
        super(message);
    }
}
