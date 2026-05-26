package com.microservices.api_gateway.filter;

import com.microservices.api_gateway.util.CorrelationIdHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.UUID;

/**
 * Request ID Filter Generates or propagates request ID for correlation tracking
 * Adds request ID to MDC for logging and response headers
 */
@Slf4j
@Component
public class RequestIdFilter extends AbstractGatewayFilterFactory<RequestIdFilter.Config> {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    public RequestIdFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {

        return (exchange, chain) -> {

            // Generate or get request ID
            String requestId = exchange.getRequest()
                    .getHeaders()
                    .getFirst(REQUEST_ID_HEADER);

            if (requestId == null || requestId.isEmpty()) {
                requestId = UUID.randomUUID().toString();
            }

            // Generate or get correlation ID
            String correlationId = exchange.getRequest()
                    .getHeaders()
                    .getFirst(CORRELATION_ID_HEADER);

            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = UUID.randomUUID().toString();
            }

            final String finalRequestId = requestId;
            final String finalCorrelationId = correlationId;

            // Store IDs
            CorrelationIdHolder.setRequestId(finalRequestId);
            CorrelationIdHolder.setCorrelationId(finalCorrelationId);

            log.debug(
                    "Request ID: {}, Correlation ID: {}",
                    finalRequestId,
                    finalCorrelationId
            );

            // Mutate request with headers
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(
                            exchange.getRequest()
                                    .mutate()
                                    .header(REQUEST_ID_HEADER, finalRequestId)
                                    .header(CORRELATION_ID_HEADER, finalCorrelationId)
                                    .build()
                    )
                    .build();

            // Continue filter chain
            return chain.filter(mutatedExchange)

                    .then(Mono.fromRunnable(() -> {

                        // Add headers to response
                        mutatedExchange.getResponse()
                                .getHeaders()
                                .add(REQUEST_ID_HEADER, finalRequestId);

                        mutatedExchange.getResponse()
                                .getHeaders()
                                .add(CORRELATION_ID_HEADER, finalCorrelationId);

                    }))

                    .doFinally(signalType -> {

                        // Cleanup ThreadLocal
                        CorrelationIdHolder.clear();

                    }).then();
        };
    }

    public static class Config {
        // Configuration properties can be added here
    }
}
