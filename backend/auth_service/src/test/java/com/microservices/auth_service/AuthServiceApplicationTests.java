package com.microservices.auth_service;

import com.microservices.auth_service.client.UserServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class AuthServiceApplicationTests {

    @MockBean
    private UserServiceClient userServiceClient;

    @Test
    void contextLoads() {
    }
}
