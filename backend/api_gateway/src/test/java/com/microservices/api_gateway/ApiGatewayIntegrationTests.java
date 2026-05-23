package com.microservices.api_gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for API Gateway Tests the complete routing, filtering, and
 * error handling
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWireMock(port = 8888)
class ApiGatewayIntegrationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void testAuthServiceRouting() {
        webTestClient
                .get()
                .uri("/api/auth/health")
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void testRequestIdHeaderGeneration() {
        webTestClient
                .get()
                .uri("/api/auth/health")
                .exchange()
                .expectHeader().exists("X-Request-Id");
    }

    @Test
    void testCorsHeaders() {
        webTestClient
                .options()
                .uri("/api/users/profile")
                .header("Origin", "http://localhost:5173")
                .exchange()
                .expectStatus().isOk()
                .expectHeader().exists("Access-Control-Allow-Origin");
    }

    @Test
    void testProtectedRouteWithoutToken() {
        webTestClient
                .get()
                .uri("/api/users/profile")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void testActuatorEndpointAccess() {
        webTestClient
                .get()
                .uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }
}
