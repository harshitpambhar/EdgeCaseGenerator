package com.microservices.api_gateway;

import com.microservices.api_gateway.util.JwtUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Unit tests for JWT Authentication Filter
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class JwtAuthenticationFilterTests {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private JwtUtils jwtUtils;

    private String validToken;
    private String invalidToken;

    @BeforeEach
    void setUp() {
        // Generate a valid token
        validToken = generateToken("user123", "user@example.com", "ADMIN");
        invalidToken = "invalid.token.here";
    }

    @Test
    void testValidJwtToken() {
        webTestClient
                .get()
                .uri("/api/users/profile")
                .header("Authorization", "Bearer " + validToken)
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void testInvalidJwtToken() {
        webTestClient
                .get()
                .uri("/api/users/profile")
                .header("Authorization", "Bearer " + invalidToken)
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void testMissingAuthorizationHeader() {
        webTestClient
                .get()
                .uri("/api/users/profile")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void testInvalidAuthorizationHeaderFormat() {
        webTestClient
                .get()
                .uri("/api/users/profile")
                .header("Authorization", "InvalidToken123")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void testJwtTokenExtraction() {
        String token = jwtUtils.generateToken("user123", "user@example.com", "ADMIN");
        String extracted = jwtUtils.extractTokenFromHeader("Bearer " + token);
        assert extracted != null;
        assert extracted.equals(token);
    }

    @Test
    void testJwtClaims() {
        String userId = "user456";
        String email = "test@example.com";
        String role = "USER";

        String token = jwtUtils.generateToken(userId, email, role);

        assert jwtUtils.getUserIdFromToken(token).equals(userId);
        assert jwtUtils.getEmailFromToken(token).equals(email);
        assert jwtUtils.getRoleFromToken(token).equals(role);
    }

    /**
     * Helper method to generate test JWT token
     */
    private String generateToken(String userId, String email, String role) {
        // This should match the secret in configuration
        String secret = "your-secret-key-change-in-production-very-important";
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400 * 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
