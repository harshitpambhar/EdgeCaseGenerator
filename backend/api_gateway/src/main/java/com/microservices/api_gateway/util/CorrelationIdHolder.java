package com.microservices.api_gateway.util;

import org.slf4j.MDC;

/**
 * Utility class for managing correlation IDs across requests. Uses SLF4J MDC
 * (Mapped Diagnostic Context) for thread-safe storage.
 */
public class CorrelationIdHolder {

    private static final String CORRELATION_ID_KEY = "correlationId";
    private static final String REQUEST_ID_KEY = "requestId";

    private CorrelationIdHolder() {
        // Private constructor for utility class
    }

    /**
     * Sets the correlation ID in MDC
     */
    public static void setCorrelationId(String correlationId) {
        if (correlationId != null && !correlationId.isEmpty()) {
            MDC.put(CORRELATION_ID_KEY, correlationId);
        }
    }

    /**
     * Gets the correlation ID from MDC
     */
    public static String getCorrelationId() {
        return MDC.get(CORRELATION_ID_KEY);
    }

    /**
     * Sets the request ID in MDC
     */
    public static void setRequestId(String requestId) {
        if (requestId != null && !requestId.isEmpty()) {
            MDC.put(REQUEST_ID_KEY, requestId);
        }
    }

    /**
     * Gets the request ID from MDC
     */
    public static String getRequestId() {
        return MDC.get(REQUEST_ID_KEY);
    }

    /**
     * Clears both correlation ID and request ID from MDC
     */
    public static void clear() {
        MDC.remove(CORRELATION_ID_KEY);
        MDC.remove(REQUEST_ID_KEY);
    }
}
