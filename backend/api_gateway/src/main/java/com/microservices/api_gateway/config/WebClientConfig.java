package com.microservices.api_gateway.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * WebClient Configuration
 *
 * Used for:
 * - Inter-service communication
 * - JWT validation
 * - Reactive downstream API calls
 * - External service calls
 */
@Slf4j
@Configuration
public class WebClientConfig {

    // Connection Pool Config
    private static final int MAX_CONNECTIONS = 500;
    private static final int MAX_PENDING_REQUESTS = 1000;

    // Timeout Config
    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 10000;
    private static final int WRITE_TIMEOUT_MS = 10000;

    /**
     * Shared Connection Pool
     */
    @Bean
    public ConnectionProvider connectionProvider() {

        return ConnectionProvider.builder("gateway-connection-pool")

                .maxConnections(MAX_CONNECTIONS)

                .pendingAcquireMaxCount(MAX_PENDING_REQUESTS)

                .pendingAcquireTimeout(Duration.ofSeconds(60))

                .maxIdleTime(Duration.ofSeconds(20))

                .maxLifeTime(Duration.ofMinutes(5))

                .evictInBackground(Duration.ofSeconds(120))

                .build();
    }

    /**
     * Reactive HTTP Client
     */
    @Bean
    public HttpClient httpClient(ConnectionProvider connectionProvider) {

        return HttpClient.create(connectionProvider)

                // Connection timeout
                .option(
                        ChannelOption.CONNECT_TIMEOUT_MILLIS,
                        CONNECT_TIMEOUT_MS
                )

                // Keep alive
                .option(ChannelOption.SO_KEEPALIVE, true)

                // Response timeout
                .responseTimeout(Duration.ofMillis(READ_TIMEOUT_MS))

                // Connection handlers
                .doOnConnected(connection ->
                        connection

                                .addHandlerLast(
                                        new ReadTimeoutHandler(
                                                READ_TIMEOUT_MS,
                                                TimeUnit.MILLISECONDS
                                        )
                                )

                                .addHandlerLast(
                                        new WriteTimeoutHandler(
                                                WRITE_TIMEOUT_MS,
                                                TimeUnit.MILLISECONDS
                                        )
                                )
                );
    }

    /**
     * Main WebClient Bean
     */
    @Bean
    public WebClient webClient(HttpClient httpClient) {

        log.info("Creating reactive WebClient");

        return WebClient.builder()

                .clientConnector(
                        new ReactorClientHttpConnector(httpClient)
                )

                .build();
    }

    /**
     * JWT Validation WebClient
     */
    @Bean(name = "jwtValidationWebClient")
    public WebClient jwtValidationWebClient(HttpClient httpClient) {

        return WebClient.builder()

                .clientConnector(
                        new ReactorClientHttpConnector(httpClient)
                )

                .build();
    }
}