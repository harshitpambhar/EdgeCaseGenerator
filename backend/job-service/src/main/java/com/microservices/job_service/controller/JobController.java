package com.microservices.job_service.controller;

import com.microservices.job_service.dto.CreateJobRequest;
import com.microservices.job_service.dto.JobResponse;
import com.microservices.job_service.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Repository analysis job management")
public class JobController {

    private final JobService jobService;
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    @Operation(summary = "Submit a new analysis job")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody CreateJobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job by ID")
    public ResponseEntity<JobResponse> getJob(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    @GetMapping
    @Operation(summary = "List all jobs")
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/user/{email}")
    @Operation(summary = "List jobs by user email")
    public ResponseEntity<List<JobResponse>> getJobsByUser(@PathVariable String email) {
        return ResponseEntity.ok(jobService.getJobsByUser(email));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a job")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download generated tests for a job")
    public ResponseEntity<Resource> downloadTests(@PathVariable UUID id) {
        try {
            // Forward to Python ML service download endpoint (allowing docker network override)
            String mlServiceBase = System.getenv("ML_SERVICE_URL") != null ? System.getenv("ML_SERVICE_URL") : "http://localhost:8000";
            String mlServiceUrl = mlServiceBase + "/api/download/" + id.toString();
            Resource resource = restTemplate.getForObject(mlServiceUrl, Resource.class);
            
            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + id + "_tests.zip\"")
                    .body(resource);
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ByteArrayResource(e.getResponseBodyAsByteArray()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
