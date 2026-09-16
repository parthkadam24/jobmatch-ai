package com.jobmatch.backend.repository;

import com.jobmatch.backend.entity.Resume;
import com.jobmatch.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // Find a candidate's resume
    Optional<Resume> findByCandidate(User candidate);

    // Find by candidate ID (using the column name "candiate_id")
    Optional<Resume> findByCandidateId(Long candidateId);

    // Check if candidate has already uploaded a resume
    boolean existsByCandidateId(Long candidateId);
}