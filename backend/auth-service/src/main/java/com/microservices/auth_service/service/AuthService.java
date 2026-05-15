package com.microservices.auth_service.service;

import com.microservices.auth_service.client.UserServiceClient;
import com.microservices.auth_service.client.dto.CreateProfileFeignRequest;
import com.microservices.auth_service.client.dto.UserProfileFeignResponse;
import com.microservices.auth_service.dto.AuthRequest;
import com.microservices.auth_service.dto.AuthResponse;
import com.microservices.auth_service.dto.SignupRequest;
import com.microservices.auth_service.dto.SignupResponse;
import com.microservices.auth_service.entity.UserCredential;
import com.microservices.auth_service.exception.BadCredentialsException;
import com.microservices.auth_service.exception.DuplicateEmailException;
import com.microservices.auth_service.repository.UserCredentialRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserCredentialRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final UserServiceClient userServiceClient;
    private final JwtService jwtService;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email is already registered");
        }

        UserCredential credential = UserCredential.builder()
                .name(request.getFullName().trim())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .enabled(true)
                .build();

        repository.save(credential);
        repository.flush();

        Long id = credential.getId();
        try {
            userServiceClient.createProfile(CreateProfileFeignRequest.builder()
                    .id(id)
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .build());
        } catch (FeignException e) {
            if (e.status() == 409) {
                throw new DuplicateEmailException("Unable to complete registration. Please try a different email.");
            }
            throw new IllegalStateException("Could not create user profile. " + feignUserServiceHint(e), e);
        }

        return SignupResponse.builder()
                .userId(id)
                .message("Registration successful")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest authRequest) {
        UserCredential user = repository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled");
        }

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        UserProfileFeignResponse profile;
        try {
            profile = userServiceClient.getByEmail(user.getEmail());
        } catch (FeignException e) {
            if (e.status() == 404) {
                throw new IllegalStateException("User profile is missing. Please contact support.");
            }
            throw new IllegalStateException("Could not load user profile. " + feignUserServiceHint(e), e);
        }

        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(profile.getId())
                .fullName(profile.getFullName() != null ? profile.getFullName() : "")
                .email(profile.getEmail())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    public void validateToken(String token) {
        jwtService.parseAndValidate(token);
    }

    private static String feignUserServiceHint(FeignException e) {
        int status = e.status();
        String snippet = "";
        try {
            String utf = e.contentUTF8();
            if (utf != null && !utf.isBlank()) {
                snippet = utf.length() > 240 ? utf.substring(0, 240) + "…" : utf;
            }
        } catch (RuntimeException ignored) {
            // ignore malformed body
        }
        if (status == 401) {
            return "User service returned 401. Set the same INTERNAL_API_KEY in auth-service and user-service (and restart both)."
                    + (snippet.isEmpty() ? "" : " Body: " + snippet);
        }
        if (status <= 0) {
            return "Cannot reach user-service via service discovery. Start Eureka, register user-service, and ensure spring.application.name is user-service."
                    + (e.getMessage() != null ? " (" + e.getMessage() + ")" : "");
        }
        return "HTTP " + status + (snippet.isEmpty() ? ". Please try again later." : ": " + snippet);
    }
}
