package com.microservices.api_gateway.filter;

import com.microservices.api_gateway.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Rate Limiting Filter Implements Redis-based rate limiting for API Gateway
 * Supports per-user and per-IP rate limiting
 *
 * Rate Limits: - Per User: 1000 requests/minute - Per IP: 10000 requests/minute
 */
@Slf4j
@Component
public class RateLimitingFilter extends AbstractGatewayFilterFactory<RateLimitingFilter.Config> {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String RATE_LIMIT_REMAINING_HEADER = "X-RateLimit-Remaining";
    private static final String RATE_LIMIT_RETRY_AFTER_HEADER = "X-RateLimit-Retry-After";

    @Value("${rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${rate-limit.per-user-limit:1000}")
    private long perUserLimit;

    @Value("${rate-limit.per-ip-limit:10000}")
    private long perIpLimit;

    @Value("${rate-limit.window-duration-minutes:1}")
    private long windowDurationMinutes;

    private final ReactiveRedisTemplate<String, String> redisTemplate;

    public RateLimitingFilter(@Qualifier("reactiveStringRedisTemplate") ReactiveRedisTemplate<String, String> redisTemplate) {
        super(Config.class);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (!rateLimitEnabled) {
                return chain.filter(exchange);
            }

            String userId = exchange.getRequest().getHeaders().getFirst(USER_ID_HEADER);
            String clientIp = getClientIp(exchange.getRequest());

            // Check rate limits
            return checkUserRateLimit(userId)
                    .zipWith(checkIpRateLimit(clientIp), (userAllowed, ipAllowed) -> {
                        if (!userAllowed.isAllowed) {
                            log.warn("User rate limit exceeded for user: {}", userId);
                            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                            exchange.getResponse().getHeaders()
                                    .add(RATE_LIMIT_RETRY_AFTER_HEADER,
                                            String.valueOf(userAllowed.retryAfter));
                            throw new RateLimitExceededException("User rate limit exceeded");
                        }

                        if (!ipAllowed.isAllowed) {
                            log.warn("IP rate limit exceeded for IP: {}", clientIp);
                            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                            exchange.getResponse().getHeaders()
                                    .add(RATE_LIMIT_RETRY_AFTER_HEADER,
                                            String.valueOf(ipAllowed.retryAfter));
                            throw new RateLimitExceededException("IP rate limit exceeded");
                        }

                        // Add remaining limit headers to response
                        exchange.getResponse().getHeaders()
                                .add(RATE_LIMIT_REMAINING_HEADER,
                                        String.valueOf(userAllowed.remaining));

                        return userAllowed;
                    })
                    .then(chain.filter(exchange))
                    .onErrorResume(RateLimitExceededException.class, ex
                            -> respondWithRateLimitError(exchange));
        };
    }

    /**
     * Checks user rate limit
     */
    private Mono<RateLimitResult> checkUserRateLimit(String userId) {
        if (userId == null || userId.isEmpty()) {
            return Mono.just(new RateLimitResult(true, perUserLimit, 0));
        }

        String key = "rate_limit:user:" + userId;
        Duration windowDuration = Duration.ofMinutes(windowDurationMinutes);

        return redisTemplate.opsForValue()
                .increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate.expire(key, windowDuration)
                                .thenReturn(count);
                    }
                    return Mono.just(count);
                })
                .map(count -> {
                    boolean allowed = count <= perUserLimit;
                    long remaining = Math.max(0, perUserLimit - count);
                    long retryAfter = windowDurationMinutes * 60;

                    log.debug("User {} rate limit check - Count: {}, Allowed: {}, Remaining: {}",
                            userId, count, allowed, remaining);

                    return new RateLimitResult(allowed, remaining, retryAfter);
                })
                .onErrorReturn(new RateLimitResult(true, perUserLimit, 0));
    }

    /**
     * Checks IP rate limit
     */
    private Mono<RateLimitResult> checkIpRateLimit(String clientIp) {
        if (clientIp == null || clientIp.isEmpty()) {
            return Mono.just(new RateLimitResult(true, perIpLimit, 0));
        }

        String key = "rate_limit:ip:" + clientIp;
        Duration windowDuration = Duration.ofMinutes(windowDurationMinutes);

        return redisTemplate.opsForValue()
                .increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate.expire(key, windowDuration)
                                .thenReturn(count);
                    }
                    return Mono.just(count);
                })
                .map(count -> {
                    boolean allowed = count <= perIpLimit;
                    long remaining = Math.max(0, perIpLimit - count);
                    long retryAfter = windowDurationMinutes * 60;

                    log.debug("IP {} rate limit check - Count: {}, Allowed: {}, Remaining: {}",
                            clientIp, count, allowed, remaining);

                    return new RateLimitResult(allowed, remaining, retryAfter);
                })
                .onErrorReturn(new RateLimitResult(true, perIpLimit, 0));
    }

    /**
     * Gets client IP address from request
     */
    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        if (request.getRemoteAddress() != null) {
            return request.getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }

    /**
     * Responds with rate limit error
     */
    private Mono<Void> respondWithRateLimitError(
            ServerWebExchange exchange) {

        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders()
                .setContentType(MediaType.APPLICATION_JSON);

        String errorBody = "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded\"}";

        return exchange.getResponse().writeWith(
                Mono.just(
                        exchange.getResponse().bufferFactory().wrap(errorBody.getBytes())
                )
        );
    }

    /**
     * Rate limit result DTO
     */
    private static class RateLimitResult {

        boolean isAllowed;
        long remaining;
        long retryAfter;

        RateLimitResult(boolean isAllowed, long remaining, long retryAfter) {
            this.isAllowed = isAllowed;
            this.remaining = remaining;
            this.retryAfter = retryAfter;
        }
    }

    public static class Config {
        // Configuration properties can be added here
    }
}
