package com.microservices.api_gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.api_gateway.exception.JwtValidationException;
import com.microservices.api_gateway.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Global Error Handling Filter Handles exceptions from all filters and provides
 * standardized error responses Implements GlobalFilter for filter ordering
 */
@Slf4j
@Component
public class ErrorHandlingFilter implements GlobalFilter, Ordered {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
                .onErrorResume(throwable -> handleException(exchange, throwable));
    }

    /**
     * Handles different types of exceptions
     */
    private Mono<Void> handleException(ServerWebExchange exchange, Throwable throwable) {
        log.error("Error in gateway: {}", throwable.getMessage(), throwable);

        if (throwable instanceof JwtValidationException) {
            return respondWithError(exchange, HttpStatus.UNAUTHORIZED,
                    "Unauthorized", "JWT validation failed: " + throwable.getMessage());
        } else if (throwable instanceof RateLimitExceededException) {
            return respondWithError(exchange, HttpStatus.TOO_MANY_REQUESTS,
                    "Too Many Requests", "Rate limit exceeded");
        } else {
            return respondWithError(exchange, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal Server Error", "An error occurred: " + throwable.getMessage());
        }
    }

    /**
     * Responds with standardized error format
     */
    private Mono<Void> respondWithError(ServerWebExchange exchange, HttpStatus status,
            String error, String message) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String errorResponse = buildErrorResponse(status.value(), error, message,
                exchange.getRequest().getPath().value());

        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(errorResponse.getBytes()))
        );
    }

    /**
     * Builds standardized error JSON response
     */
    private String buildErrorResponse(int status, String error, String message, String path) {
        return "{\n"
                + "  \"timestamp\": \"" + LocalDateTime.now().format(dateFormatter) + "\",\n"
                + "  \"status\": " + status + ",\n"
                + "  \"error\": \"" + error + "\",\n"
                + "  \"message\": \"" + message + "\",\n"
                + "  \"path\": \"" + path + "\"\n"
                + "}";
    }

    @Override
    public int getOrder() {
        // Ensure this filter runs early in the filter chain
        return -1;
    }
}
