package com.microservices.job_service.repository;

import com.microservices.job_service.entity.Job;
import com.microservices.job_service.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findAllByOrderByCreatedAtDesc();

    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);

    List<Job> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
