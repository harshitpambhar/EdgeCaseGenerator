package com.microservices.auth_service.controller;

import com.microservices.auth_service.dto.AuthRequest;
import com.microservices.auth_service.dto.AuthResponse;
import com.microservices.auth_service.entity.UserCredential;
import com.microservices.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String addNewUser(@RequestBody UserCredential user) {
        return service.saveUser(user);
    }

    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody AuthRequest authRequest) {
        // In a real app, you'd validate credentials here
        String token = service.generateToken(authRequest.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .name("Test User")
                        .email(authRequest.getEmail())
                        .role("Developer")
                        .build())
                .build();
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }
}
