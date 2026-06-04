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

        // NOTE: OkDockerHttpClient.Builder takes timeouts in MILLISECONDS (docker-java 3.3.x).
        // The old values (10, 30) meant 10 ms connect / 30 ms read — far too short,
        // causing every inspectImageCmd() call to fail with "Error while executing Request".
        DockerHttpClient httpClient = new OkDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .connectTimeout(30_000)   // 30 seconds
                .readTimeout(120_000)     // 120 seconds (image inspect / log streaming)
                .build();

        return DockerClientImpl.getInstance(config, httpClient);
    }
}

