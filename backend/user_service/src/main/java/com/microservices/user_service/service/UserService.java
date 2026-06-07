package com.microservices.user_service.service;

import com.microservices.user_service.dto.CreateUserRequest;
import com.microservices.user_service.dto.UserResponse;
import com.microservices.user_service.entity.User;
import com.microservices.user_service.exception.ConflictException;
import com.microservices.user_service.exception.DuplicateEmailException;
import com.microservices.user_service.exception.ResourceNotFoundException;
import com.microservices.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email is already registered");
        }
        if (userRepository.existsById(request.getId())) {
            throw new ConflictException("User id already exists");
        }

        User user = User.builder()
                .id(request.getId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .build();

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for email: " + email));
    }
}
