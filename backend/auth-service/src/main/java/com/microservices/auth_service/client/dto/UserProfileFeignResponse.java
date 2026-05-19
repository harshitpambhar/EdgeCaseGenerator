package com.microservices.auth_service.client.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileFeignResponse {

    private Long id;

    @JsonAlias("name")
    private String fullName;

    private String email;
    private Instant createdAt;
    private Instant updatedAt;
}
