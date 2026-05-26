package com.microservices.api_gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.redis.DataRedisTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.test.StepVerifier;

import java.time.Duration;

/**
 * Tests for Rate Limiting Filter Tests Redis-based rate limiting functionality
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.redis.host=localhost",
    "spring.redis.port=6379"
})
class RateLimitingFilterTests {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private ReactiveRedisTemplate<String, String> redisTemplate;

    @Test
    void testRateLimitKeyStorage() {
        String key = "rate_limit:user:test-user";

        redisTemplate.opsForValue()
                .set(key, "5")
                .then(redisTemplate.expire(key, Duration.ofMinutes(1)))
                .as(StepVerifier::create)
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    void testRateLimitIncrement() {
        String key = "rate_limit:test:counter";

        redisTemplate.opsForValue()
                .increment(key)
                .then(redisTemplate.opsForValue().increment(key))
                .then(redisTemplate.opsForValue().get(key))
                .as(StepVerifier::create)
                .expectNext("2")
                .verifyComplete();
    }

    @Test
    void testRedisHealthCheck() {
        redisTemplate.opsForValue()
                .set("health-check", "ok")
                .then(redisTemplate.opsForValue().get("health-check"))
                .as(StepVerifier::create)
                .expectNext("ok")
                .verifyComplete();
    }

    @Test
    void testRateLimitResponseHeaders() {
        // This test assumes valid authentication
        webTestClient
                .get()
                .uri("/api/users/profile")
                .header("Authorization", "Bearer valid-token")
                .exchange()
                .expectHeader().exists("X-RateLimit-Remaining");
    }
}
