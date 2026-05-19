package com.microservices.auth_service.client.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProfileFeignRequest {

    private Long id;

    @JsonProperty("fullName")
    @JsonAlias("name")
    private String fullName;

    private String email;
}
