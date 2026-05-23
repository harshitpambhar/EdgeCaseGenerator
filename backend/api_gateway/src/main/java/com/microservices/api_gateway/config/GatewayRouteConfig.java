package com.microservices.api_gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.time.Duration;

/**
 * Gateway Route Configuration
 */
@Slf4j
@Configuration
public class GatewayRouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {

        log.info("Configuring API Gateway Routes");

        return builder.routes()

                /*
                 * AUTH SERVICE
                 */
                .route("auth-service-route", r -> r
                        .path("/api/auth/**")

                        .filters(f -> f

                                .addRequestHeader(
                                        "X-Gateway",
                                        "true"
                                )

                                .addResponseHeader(
                                        "X-Service",
                                        "AUTH-SERVICE"
                                )

                                .retry(retry -> retry
                                        .setRetries(1)

                                        .setMethods(
                                                HttpMethod.GET,
                                                HttpMethod.POST
                                        )

                                        .setBackoff(
                                                Duration.ofMillis(100),
                                                Duration.ofSeconds(1),
                                                2,
                                                false
                                        )
                                )
                        )

                        .uri("lb://AUTH-SERVICE")
                )

                /*
                 * USER SERVICE
                 */
                .route("user-service-route", r -> r
                        .path("/api/users/**")

                        .filters(f -> f

                                .addRequestHeader(
                                        "X-Gateway",
                                        "true"
                                )

                                .addResponseHeader(
                                        "X-Service",
                                        "USER-SERVICE"
                                )

                                .retry(retry -> retry
                                        .setRetries(1)

                                        .setMethods(HttpMethod.GET)

                                        .setBackoff(
                                                Duration.ofMillis(100),
                                                Duration.ofSeconds(1),
                                                2,
                                                false
                                        )
                                )
                        )

                        .uri("lb://USER-SERVICE")
                )

                /*
                 * JOB SERVICE
                 */
                .route("job-service-route", r -> r
                        .path("/api/jobs/**")

                        .filters(f -> f

                                .addRequestHeader(
                                        "X-Gateway",
                                        "true"
                                )

                                .addResponseHeader(
                                        "X-Service",
                                        "JOB-SERVICE"
                                )

                                .retry(retry -> retry
                                        .setRetries(1)

                                        .setMethods(HttpMethod.GET)

                                        .setBackoff(
                                                Duration.ofMillis(100),
                                                Duration.ofSeconds(1),
                                                2,
                                                false
                                        )
                                )
                        )

                        .uri("lb://JOB-SERVICE")
                )

                /*
                 * PROJECT SERVICE
                 */
                .route("project-service-route", r -> r
                        .path("/api/projects/**")

                        .filters(f -> f

                                .addRequestHeader(
                                        "X-Gateway",
                                        "true"
                                )

                                .addResponseHeader(
                                        "X-Service",
                                        "PROJECT-SERVICE"
                                )

                                .retry(retry -> retry
                                        .setRetries(1)

                                        .setMethods(HttpMethod.GET)

                                        .setBackoff(
                                                Duration.ofMillis(100),
                                                Duration.ofSeconds(1),
                                                2,
                                                false
                                        )
                                )
                        )

                        .uri("lb://PROJECT-SERVICE")
                )

                .build();
    }
}