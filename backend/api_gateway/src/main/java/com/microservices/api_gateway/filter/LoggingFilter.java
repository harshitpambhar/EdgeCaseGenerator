package com.microservices.api_gateway.filter;

import com.microservices.api_gateway.util.CorrelationIdHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Logging Filter
 *
 * Logs:
 * - Incoming requests
 * - Outgoing responses
 * - Execution time
 * - Correlation IDs
 * - Errors
 */
@Slf4j
@Component
public class LoggingFilter extends AbstractGatewayFilterFactory<LoggingFilter.Config> {

    private static final String REQUEST_TIME_HEADER = "X-Request-Time";

    public LoggingFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {

        return (exchange, chain) -> {

            // Request details
            String method = exchange.getRequest()
                    .getMethod()
                    .toString();

            String uri = exchange.getRequest()
                    .getURI()
                    .toString();

            String correlationId = CorrelationIdHolder.getCorrelationId();
            String requestId = CorrelationIdHolder.getRequestId();

            long startTime = System.currentTimeMillis();

            // Log incoming request
            log.info(
                    "Incoming Request -> Method: {}, URI: {}, Request-ID: {}, Correlation-ID: {}",
                    method,
                    uri,
                    requestId,
                    correlationId
            );

            // Store start time
            exchange.getAttributes()
                    .put(REQUEST_TIME_HEADER, startTime);

            return chain.filter(exchange)

                    // SUCCESS RESPONSE
                    .then(Mono.fromRunnable(() ->
                            logResponse(exchange, startTime, method, uri)
                    ))

                    // ERROR HANDLING
                    .onErrorResume(ex -> {

                        log.error(
                                "Gateway Error -> Method: {}, URI: {}, Error: {}",
                                method,
                                uri,
                                ex.getMessage(),
                                ex
                        );

                        exchange.getResponse()
                                .setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);

                        return exchange.getResponse().setComplete();
                    }).then();
        };
    }

    /**
     * Logs response details
     */
    private void logResponse(
            ServerWebExchange exchange,
            long startTime,
            String method,
            String uri
    ) {

        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        int statusCode = exchange.getResponse()
                .getStatusCode() != null
                ? exchange.getResponse().getStatusCode().value()
                : 0;

        String correlationId = CorrelationIdHolder.getCorrelationId();
        String requestId = CorrelationIdHolder.getRequestId();

        log.info(
                "Outgoing Response -> Method: {}, URI: {}, Status: {}, Execution Time: {} ms, Request-ID: {}, Correlation-ID: {}",
                method,
                uri,
                statusCode,
                executionTime,
                requestId,
                correlationId
        );

        // Slow request detection
        if (executionTime > 5000) {

            log.warn(
                    "Slow Request Detected -> Method: {}, URI: {}, Execution Time: {} ms",
                    method,
                    uri,
                    executionTime
            );
        }
    }

    /**
     * Filter Configuration
     */
    public static class Config {
        // Future configuration properties
    }
}