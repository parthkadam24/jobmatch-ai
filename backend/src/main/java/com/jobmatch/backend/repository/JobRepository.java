package com.jobmatch.backend.repository;

import com.jobmatch.backend.entity.Job;
import com.jobmatch.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Get all jobs posted by a specific recruiter
    List<Job> findByRecruiter(User recruiter);

    // Get all jobs posted by recruiter ID
    List<Job> findByRecruiterId(Long recruiterId);

    // Search jobs by title or description (case-insensitive)
    @Query("SELECT j FROM Job j WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Job> searchJobs(@Param("keyword") String keyword);

    // Find jobs by location
    List<Job> findByLocationContainingIgnoreCase(String location);

    // Find jobs by company
    List<Job> findByCompanyContainingIgnoreCase(String company);

    // Find jobs whose skills contain the given skill
    List<Job> findBySkillsContainingIgnoreCase(String skill);
}