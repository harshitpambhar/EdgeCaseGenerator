package com.microservices.job_service.docker;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.PullImageResultCallback;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Volume;
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
     * Ensures the worker Docker image is available locally.
     *
     * <p>For <em>locally-built</em> images (no registry host in the name, e.g.
     * {@code ecg-worker:latest}) we never attempt a Docker Hub pull — the image
     * simply does not exist there. Instead we fail fast with an actionable message
     * telling the developer to rebuild via {@code docker compose build}.
     *
     * <p>For proper registry images (containing a {@code /} with a dot or port in
     * the first segment, e.g. {@code ghcr.io/myorg/ecg-worker:latest}) we attempt
     * to pull normally.
     */
    private void pullImageIfMissing(String jobId) {
        String image = props.getImage();
        log.info("STEP 2 — [job={}] Checking image availability: {}", jobId, image);

        // ── 1. Check local image store first ──────────────────────────────────
        try {
            dockerClient.inspectImageCmd(image).exec();
            log.info("STEP 2 — [job={}] Image already present locally: {}", jobId, image);
            return; // nothing to do
        } catch (com.github.dockerjava.api.exception.NotFoundException localMiss) {
            log.warn("STEP 2 — [job={}] Image not found locally: {}", jobId, image);
        }

        // ── 2. Decide whether to pull or abort ────────────────────────────────
        if (isLocalOnlyImage(image)) {
            // Local images (e.g. ecg-worker:latest) are built by 'docker compose build'
            // and will never exist on Docker Hub. Pulling would only waste time and produce
            // a confusing "repository does not exist" error.
            throw new DockerOperationException(
                    "Worker image '" + image + "' is not in the local Docker image store. "
                    + "Rebuild it with:  docker compose build ecg-worker");
        }

        // ── 3. Attempt to pull from the registry ──────────────────────────────
        log.info("STEP 2 — [job={}] Pulling image from registry: {}", jobId, image);
        try {
            dockerClient.pullImageCmd(image)
                    .exec(new PullImageResultCallback())
                    .awaitCompletion(120, TimeUnit.SECONDS);
            log.info("STEP 2 — [job={}] Image pulled successfully: {}", jobId, image);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new DockerOperationException("Image pull interrupted for " + image, ex);
        } catch (com.github.dockerjava.api.exception.NotFoundException ex) {
            throw new DockerOperationException("Image not found in registry: " + image, ex);
        } catch (Exception ex) {
            throw new DockerOperationException("Failed to pull image " + image + ": " + ex.getMessage(), ex);
        }
    }

    /**
     * Returns {@code true} when {@code image} refers to a locally-built image
     * that has no remote registry (e.g. {@code ecg-worker:latest} or
     * {@code myapp:1.0}).
     *
     * <p>A registry host always contains either a dot ({@code .}) or a colon
     * ({@code :}) in the first path segment, or is {@code localhost}. Plain
     * names like {@code ecg-worker} have no such prefix.
     */
    private static boolean isLocalOnlyImage(String image) {
        // Strip tag
        String name = image.contains(":") ? image.substring(0, image.lastIndexOf(':')) : image;
        if (!name.contains("/")) {
            // Single-component name — always local (e.g. "ecg-worker")
            return true;
        }
        String firstSegment = name.substring(0, name.indexOf('/'));
        // Registry hosts contain a dot or colon, or are "localhost"
        return !firstSegment.contains(".") && !firstSegment.contains(":") && !firstSegment.equals("localhost");
    }

    private String createContainer(String repoUrl, String jobId) {
        List<String> cmd = List.of(jobId, repoUrl);

        // Mount the shared workspace volume so generated tests are visible
        // to ml-api for download after the worker exits.
        String workspaceVolume = System.getenv().getOrDefault(
                "WORKER_WORKSPACE_VOLUME", "ecg_workspaces");
        String containerWorkspacePath = "/tmp/ecg_workspaces";
        Bind workspaceBind = new Bind(workspaceVolume,
                new Volume(containerWorkspacePath));

        HostConfig hostConfig = HostConfig.newHostConfig()
                .withNetworkMode(props.getNetwork())
                .withBinds(workspaceBind)
                .withAutoRemove(false);

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
