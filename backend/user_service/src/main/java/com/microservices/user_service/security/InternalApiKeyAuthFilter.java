package com.microservices.user_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class InternalApiKeyAuthFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-Internal-Api-Key";

    @Value("${app.internal-api-key}")
    private String expectedKey;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (!path.startsWith("/api/users")) {
            filterChain.doFilter(request, response);
            return;
        }

        String provided = request.getHeader(HEADER_NAME);
        if (expectedKey == null || expectedKey.isBlank() || !expectedKey.equals(provided)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
            return;
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "internal-service",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
