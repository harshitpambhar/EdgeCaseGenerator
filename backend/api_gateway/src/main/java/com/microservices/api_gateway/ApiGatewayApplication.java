package com.microservices.api_gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application entry point for API Gateway
 *
 * Features: - Spring Cloud Gateway for routing - Eureka Client for service
 * discovery - Config Server client for centralized configuration - JWT
 * Authentication - Rate Limiting with Redis - Request logging and correlation -
 * Prometheus metrics
 */
@Slf4j
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ApiGatewayApplication {

    public static void main(String[] args) {
        log.info("Starting API Gateway Application...");
        SpringApplication.run(ApiGatewayApplication.class, args);
        log.info("API Gateway Application started successfully");
    }

}
