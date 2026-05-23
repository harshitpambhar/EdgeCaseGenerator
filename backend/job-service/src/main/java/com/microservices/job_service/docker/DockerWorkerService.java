package com.microservices.job_service.docker;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.HostConfig;
import com.microservices.job_service.config.DockerWorkerProperties;
import com.microservices.job_service.exception.DockerOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Launches a short-lived Docker container that clones a GitHub repository
 * into an ephemeral /workspace directory, scans it, and returns the logs.
 *
 * The host machine NEVER clones the repository.
 * Spring Boot is purely an orchestrator: it creates the container,
 * waits for it to finish, collects stdout/stderr, then removes it.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DockerWorkerService {

    private final DockerClient dockerClient;
    private final DockerWorkerProperties props;

    /**
     * Runs the full worker lifecycle for a given repo URL.
     *
     * @param repoUrl  GitHub HTTPS URL to clone
     * @param jobId    used only for log correlation
     * @return WorkerResult containing exit code and captured logs
     */
    public WorkerResult runWorker(String repoUrl, String jobId) {
        log.info("[job={}] Launching worker container for repo: {}", jobId, repoUrl);

        String containerId = createContainer(repoUrl, jobId);
        log.info("[job={}] Container created: {}", jobId, containerId);

        try {
            dockerClient.startContainerCmd(containerId).exec();
            log.info("[job={}] Container started", jobId);

            int exitCode = waitForContainer(containerId, jobId);
            String logs = collectLogs(containerId, jobId);

            log.info("[job={}] Container finished with exit code {}", jobId, exitCode);
            return new WorkerResult(containerId, exitCode, logs);

        } catch (Exception ex) {
            log.error("[job={}] Container execution failed: {}", jobId, ex.getMessage(), ex);
            throw new DockerOperationException("Worker container failed for job " + jobId, ex);
        } finally {
            removeContainer(containerId, jobId);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private String createContainer(String repoUrl, String jobId) {
        /*
         * The worker command:
         *   sh -c "git clone <repoUrl> /workspace/repo && find /workspace/repo -type f | head -100"
         *
         * This runs entirely inside the container.
         * /workspace is a tmpfs-style directory that exists only for the container's lifetime.
         */
        List<String> cmd = List.of(
                "sh", "-c",
                "git clone --depth 1 " + repoUrl + " /workspace/repo 2>&1 && "
                + "echo '=== SCAN START ===' && "
                + "find /workspace/repo -type f -not -path '*/.git/*' | head -200 && "
                + "echo '=== SCAN END ==='"
        );

        HostConfig hostConfig = HostConfig.newHostConfig()
                .withNetworkMode(props.getNetwork())
                .withAutoRemove(false);   // we remove manually after log collection

        try {
            CreateContainerResponse container = dockerClient
                    .createContainerCmd(props.getImage())
                    .withCmd(cmd)
                    .withHostConfig(hostConfig)
                    .withLabels(java.util.Map.of(
                            "managed-by", "job-service",
                            "job-id", jobId
                    ))
                    .exec();

            return container.getId();
        } catch (Exception ex) {
            throw new DockerOperationException("Failed to create worker container: " + ex.getMessage(), ex);
        }
    }

    private int waitForContainer(String containerId, String jobId) {
        try {
            WaitContainerResultCallback callback = new WaitContainerResultCallback();
            dockerClient.waitContainerCmd(containerId).exec(callback);
            return callback.awaitStatusCode(props.getTimeoutSeconds(), TimeUnit.SECONDS);
        } catch (Exception ex) {
            log.warn("[job={}] Timeout or error waiting for container {}: {}", jobId, containerId, ex.getMessage());
            throw new DockerOperationException("Container timed out or failed to complete", ex);
        }
    }

    private String collectLogs(String containerId, String jobId) {
        StringBuilder sb = new StringBuilder();
        try {
            dockerClient.logContainerCmd(containerId)
                    .withStdOut(true)
                    .withStdErr(true)
                    .withFollowStream(false)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<>() {
                        @Override
                        public void onNext(com.github.dockerjava.api.model.Frame frame) {
                            if (frame != null && frame.getPayload() != null) {
                                sb.append(new String(frame.getPayload()));
                            }
                        }
                    })
                    .awaitCompletion(30, TimeUnit.SECONDS);
        } catch (Exception ex) {
            log.warn("[job={}] Could not collect logs from container {}: {}", jobId, containerId, ex.getMessage());
        }
        return sb.toString();
    }

    private void removeContainer(String containerId, String jobId) {
        if (!props.isAutoRemove()) return;
        try {
            dockerClient.removeContainerCmd(containerId)
                    .withForce(true)
                    .exec();
            log.info("[job={}] Container {} removed", jobId, containerId);
        } catch (Exception ex) {
            log.warn("[job={}] Could not remove container {}: {}", jobId, containerId, ex.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Result record
    // -------------------------------------------------------------------------

    public record WorkerResult(String containerId, int exitCode, String logs) {
        public boolean succeeded() {
            return exitCode == 0;
        }
    }
}
