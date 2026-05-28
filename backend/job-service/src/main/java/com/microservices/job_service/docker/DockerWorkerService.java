package com.microservices.job_service.docker;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.PullImageResultCallback;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.HostConfig;
import com.microservices.job_service.config.DockerWorkerProperties;
import com.microservices.job_service.exception.DockerOperationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Launches a short-lived Docker container that clones a GitHub repository into
 * an ephemeral /workspace directory, scans it, and returns the logs.
 *
 * The host machine NEVER clones the repository. Spring Boot is purely an
 * orchestrator: it creates the container, waits for it to finish, collects
 * stdout/stderr, then removes it.
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
     * @param repoUrl GitHub HTTPS URL to clone
     * @param jobId used only for log correlation
     * @return WorkerResult containing exit code and captured logs
     */
    public WorkerResult runWorker(String repoUrl, String jobId, java.util.function.Consumer<String> logConsumer) {
        log.info("STEP 1 — [job={}] Async worker started for repo: {}", jobId, repoUrl);

        // STEP 2: Pull image if not present locally
        pullImageIfMissing(jobId);

        // STEP 3: Create container
        String containerId = createContainer(repoUrl, jobId);
        log.info("STEP 3 — [job={}] Container created: {}", jobId, containerId);

        try {
            // STEP 4: Start container
            dockerClient.startContainerCmd(containerId).exec();
            log.info("STEP 4 — [job={}] Container started: {}", jobId, containerId);

            // Start streaming logs in the background — keep callback reference so we can
            // await its full completion after the container exits (prevents lost tail bytes)
            StringBuilder accumulatedLogs = new StringBuilder();
            com.github.dockerjava.api.async.ResultCallback.Adapter<com.github.dockerjava.api.model.Frame> logCallback
                    = new com.github.dockerjava.api.async.ResultCallback.Adapter<>() {
                @Override
                public void onNext(com.github.dockerjava.api.model.Frame frame) {
                    if (frame != null && frame.getPayload() != null) {
                        String chunk = new String(frame.getPayload());
                        accumulatedLogs.append(chunk);
                        if (logConsumer != null) {
                            logConsumer.accept(chunk);
                        }
                    }
                }
            };

            try {
                dockerClient.logContainerCmd(containerId)
                        .withStdOut(true)
                        .withStdErr(true)
                        .withFollowStream(true)
                        .exec(logCallback);
            } catch (Exception e) {
                log.warn("[job={}] Failed to start log stream: {}", jobId, e.getMessage());
            }

            // STEP 5: Wait for container to finish
            log.info("STEP 5 — [job={}] Waiting for container to finish (timeout={}s)...", jobId, props.getTimeoutSeconds());
            int exitCode = waitForContainer(containerId, jobId);

            // STEP 6: Wait for log callback to fully flush all remaining bytes
            // This is critical — the JSON result markers arrive in the last few lines
            try {
                logCallback.awaitCompletion(15, java.util.concurrent.TimeUnit.SECONDS);
            } catch (Exception e) {
                log.warn("[job={}] Log callback did not complete cleanly: {}", jobId, e.getMessage());
            }

            String logs = accumulatedLogs.toString();
            if (logs.isEmpty() || !logs.contains("---RESULT_JSON_START---")) {
                String fallbackLogs = collectLogs(containerId, jobId);
                if (!fallbackLogs.isEmpty()) {
                    logs = logs.isEmpty() ? fallbackLogs : logs + fallbackLogs;
                }
            }
            log.info("STEP 6 — [job={}] Logs collected ({} chars)", jobId, logs.length());

            // STEP 7: Done
            log.info("STEP 7 — [job={}] Container completed with exit code {}", jobId, exitCode);
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
    /**
     * Pulls the worker Docker image if it is not available locally. This
     * prevents createContainerCmd from failing with "image not found".
     */
    private void pullImageIfMissing(String jobId) {
        String image = props.getImage();
        log.info("STEP 2 — [job={}] Checking/pulling image: {}", jobId, image);

        try {
            // Check if image exists locally first
            try {
                dockerClient.inspectImageCmd(image).exec();
                log.info("STEP 2 — [job={}] Image already present locally: {}", jobId, image);
                return;
            } catch (com.github.dockerjava.api.exception.NotFoundException e) {
                log.info("STEP 2 — [job={}] Image not found locally, pulling: {}", jobId, image);
            }

            // Pull the image
            dockerClient.pullImageCmd(image)
                    .exec(new PullImageResultCallback())
                    .awaitCompletion(120, TimeUnit.SECONDS);

            log.info("STEP 2 — [job={}] Image pulled successfully: {}", jobId, image);

        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new DockerOperationException("Image pull interrupted for " + image, ex);
        } catch (com.github.dockerjava.api.exception.NotFoundException ex) {
            throw new DockerOperationException("Image not found: " + image, ex);
        } catch (Exception ex) {
            throw new DockerOperationException("Failed to pull image " + image + ": " + ex.getMessage(), ex);
        }
    }

    private String createContainer(String repoUrl, String jobId) {
        // Execute the real Python CLI worker, which will clone the repo
        // into an ephemeral directory and run the orchestrator pipeline.
        List<String> cmd = List.of(
                "python", "cli_worker.py", jobId, repoUrl
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
        if (!props.isAutoRemove()) {
            return;
        }
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
