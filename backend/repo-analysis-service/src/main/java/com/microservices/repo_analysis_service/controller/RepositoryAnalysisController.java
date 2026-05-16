package com.microservices.repo_analysis_service.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.microservices.repo_analysis_service.dto.AnalysisRequest;
import com.microservices.repo_analysis_service.dto.AnalysisResponse;
import com.microservices.repo_analysis_service.exception.InvalidRepositoryException;
import com.microservices.repo_analysis_service.exception.RepositoryAnalysisException;
import com.microservices.repo_analysis_service.service.RepositoryAnalysisService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@ Slf4j 

    @RestController
    @RequestMapping("/api/repo")
public class RepositoryAnalysisController {

    private final RepositoryAnalysisService repositoryAnalysisService;

    public RepositoryAnalysisController(RepositoryAnalysisService repositoryAnalysisService) {
        this.repositoryAnalysisService = repositoryAnalysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeRepository(
            @Valid @RequestBody AnalysisRequest request,
            BindingResult bindingResult) {

        log.info("Received analysis request for: {}", request.getRepoUrl());

        // Validate request
        if (bindingResult.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "VALIDATION_ERROR");
            errorResponse.put("message", "Invalid request parameters");
            errorResponse.put("errors", bindingResult.getFieldErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            AnalysisResponse response = repositoryAnalysisService.analyzeRepository(request.getRepoUrl());
            return ResponseEntity.ok(response);

        } catch (InvalidRepositoryException e) {
            log.warn("Invalid repository URL: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "INVALID_REPOSITORY");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (RepositoryAnalysisException e) {
            log.error("Repository analysis failed: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ANALYSIS_FAILED");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error during analysis: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "healthy", "service", "repo-analysis-service"));
    }

}
