package com.microservices.auth_service.client;

import com.microservices.auth_service.client.dto.CreateProfileFeignRequest;
import com.microservices.auth_service.client.dto.UserProfileFeignResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", contextId = "userServiceClient", configuration = UserServiceFeignConfig.class)
public interface UserServiceClient {

    @PostMapping("/api/users")
    UserProfileFeignResponse createProfile(@RequestBody CreateProfileFeignRequest body);

    @GetMapping("/api/users/by-email")
    UserProfileFeignResponse getByEmail(@RequestParam("email") String email);
}
