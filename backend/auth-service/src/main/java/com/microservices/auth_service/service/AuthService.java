package com.microservices.auth_service.service;

import com.microservices.auth_service.entity.UserCredential;
import com.microservices.auth_service.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public String saveUser(UserCredential credential) {
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "user added to the system";
    }

    public String generateToken(String username) {
        // Mock token generation for now
        return "eyJhbGciOiJIUzI1NiJ9.mock_token_" + username;
    }

    public void validateToken(String token) {
        // Mock validation
    }
}
