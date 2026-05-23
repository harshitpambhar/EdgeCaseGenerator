package com.microservices.api_gateway.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

/**
 * Security configuration for Spring Cloud Gateway. Configures stateless
 * JWT-based authentication without sessions. CORS, CSRF, and basic security
 * settings are configured here.
 */
@Slf4j
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    /**
     * Public paths that don't require authentication
     */
    private static final String[] PUBLIC_PATHS = {
        "/api/auth/**",
        "/actuator/health/**",
        "/actuator/health",
        "/eureka/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/webjars/**"
    };

    /**
     * Configures the security filter chain for reactive web applications
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        log.info("Configuring security filter chain");

        http
                // Disable CSRF for stateless API
                .csrf().disable()
                // Configure CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Configure authorization
                .authorizeExchange()
                .pathMatchers(PUBLIC_PATHS).permitAll()
                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                .anyExchange().authenticated()
                .and()
                // Configure HTTP basic as fallback (not used in normal flow)
                .httpBasic().disable()
                // Disable logout
                .logout().disable();

        return http.build();
    }

    /**
     * CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Configuring CORS");

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:8080"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "X-Request-Id"
        ));
        config.setExposedHeaders(Arrays.asList(
                "Authorization",
                "X-Request-Id",
                "X-RateLimit-Remaining",
                "X-RateLimit-Retry-After"
        ));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
