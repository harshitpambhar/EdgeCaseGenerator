package com.microservices.api_gateway.filter;

import com.microservices.api_gateway.util.JwtUtils;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * JWT Authentication Filter Intercepts all protected routes and validates JWT
 * tokens Extracts user information and adds to request headers for downstream
 * services
 *
 * Skip patterns: - /api/auth/** (Public authentication endpoints) -
 * /actuator/** (Health checks) - /eureka/** (Service discovery)
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String USER_EMAIL_HEADER = "X-User-Email";
    private static final String USER_ROLE_HEADER = "X-User-Role";

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            // Skip authentication for public paths
            if (isPublicPath(path)) {
                log.debug("Public path, skipping JWT validation: {}", path);
                return chain.filter(exchange);
            }

            try {
                // Extract Authorization header
                String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

                if (authHeader == null || authHeader.isEmpty()) {
                    log.warn("Missing Authorization header for protected route: {}", path);
                    return respondWithError(exchange, "Missing Authorization header");
                }

                // Extract Bearer token
                String token = jwtUtils.extractTokenFromHeader(authHeader);
                if (token == null) {
                    log.warn("Invalid Authorization header format for protected route: {}", path);
                    return respondWithError(exchange, "Invalid Authorization header format");
                }

                // Validate token
                if (!jwtUtils.isTokenValid(token)) {
                    log.warn("Invalid JWT token for protected route: {}", path);
                    return respondWithError(exchange, "Invalid JWT token");
                }

                // Extract claims
                Claims claims = jwtUtils.validateToken(token);
                String email = claims.getSubject();
                Object uidClaim = claims.get("uid");
                String userId = uidClaim != null ? String.valueOf(uidClaim) : email;
                String role = claims.get("role", String.class);

                log.debug("JWT validation successful for user: {} with role: {}", userId, role);

                // Add user information to request headers and continue with the mutated exchange
                var mutatedRequest = exchange.getRequest().mutate()
                        .header(USER_ID_HEADER, userId)
                        .header(USER_EMAIL_HEADER, email != null ? email : "")
                        .header(USER_ROLE_HEADER, role != null ? role : "")
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                log.error("JWT authentication error: {}", e.getMessage());
                return respondWithError(exchange, "JWT authentication failed");
            }
        };
    }

    /**
     * Checks if the path is a public path that doesn't require authentication
     */
    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth/")
                || path.startsWith("/actuator")
                || path.startsWith("/eureka")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    /**
     * Responds with error when authentication fails
     */
    private Mono<Void> respondWithError(
            ServerWebExchange exchange, String message) {

        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        String errorBody = "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}";

        return exchange.getResponse().writeWith(
                reactor.core.publisher.Mono.just(
                        exchange.getResponse().bufferFactory().wrap(errorBody.getBytes())
                )
        );
    }

    public static class Config {
        // Configuration properties can be added here
    }
}
