package com.microservices.job_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "docker.worker")
@Getter
@Setter
public class DockerWorkerProperties {

    /** Docker image used for the worker container (default: alpine/git) */
    private String image = "alpine/git:latest";

    /** Docker network the worker container joins */
    private String network = "bridge";

    /** Max seconds to wait for container to finish before marking FAILED */
    private int timeoutSeconds = 300;

    /** Whether to auto-remove the container after it exits */
    private boolean autoRemove = true;
}
