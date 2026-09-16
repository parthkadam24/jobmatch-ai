package com.jobmatch.backend.repository;

import com.jobmatch.backend.entity.Application;
import com.jobmatch.backend.entity.Job;
import com.jobmatch.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // All applications by a candidate
    List<Application> findByCandidate(User candidate);

    // All applications by candidate ID
    List<Application> findByCandidateId(Long candidateId);

    // All applications for a job
    List<Application> findByJob(Job job);

    // All applications for a job ID
    List<Application> findByJobId(Long jobId);

    // Find specific application by candidate + job (for duplicate check)
    Optional<Application> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    // Filter by status
    List<Application> findByStatus(String status);

    // Count applications for a job
    long countByJobId(Long jobId);

    // Count applications by candidate
    long countByCandidateId(Long candidateId);
}