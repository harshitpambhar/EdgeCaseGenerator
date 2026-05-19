package com.microservices.auth_service.controller;

import com.microservices.auth_service.dto.AuthRequest;
import com.microservices.auth_service.dto.AuthResponse;
import com.microservices.auth_service.dto.SignupRequest;
import com.microservices.auth_service.dto.SignupResponse;
import com.microservices.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    public record MapMessage(String message) {}

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(authService.login(authRequest));
    }

    @GetMapping("/validate")
    public ResponseEntity<MapMessage> validateToken(@RequestParam("token") String token) {
        authService.validateToken(token);
        return ResponseEntity.ok(new MapMessage("Token is valid"));
    }
}
