package com.microservices.job_service.config;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.okhttp.OkDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DockerClientConfig {

    @Bean
    public DockerClient dockerClient(
            @Value("${docker.host:}") String dockerHostProperty) {
        String dockerHost = dockerHostProperty;
        if (dockerHost == null || dockerHost.isBlank()) {
            dockerHost = System.getenv("DOCKER_HOST");
        }
        if (dockerHost == null || dockerHost.isBlank()) {
            dockerHost = "unix:///var/run/docker.sock";
        }

        DefaultDockerClientConfig config = DefaultDockerClientConfig
                .createDefaultConfigBuilder()
                .withDockerHost(dockerHost)
                .build();

        DockerHttpClient httpClient = new OkDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .connectTimeout(10)
                .readTimeout(30)
                .build();

        return DockerClientImpl.getInstance(config, httpClient);
    }
}
