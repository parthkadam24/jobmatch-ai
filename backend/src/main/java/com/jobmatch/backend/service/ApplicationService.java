package com.jobmatch.backend.service;

import com.jobmatch.backend.entity.Application;
import com.jobmatch.backend.entity.Job;
import com.jobmatch.backend.entity.User;
import com.jobmatch.backend.repository.ApplicationRepository;
import com.jobmatch.backend.repository.JobRepository;
import com.jobmatch.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // ============ CANDIDATE ACTIONS ============

    // Apply to a job
    public Application applyToJob(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CANDIDATE".equalsIgnoreCase(candidate.getRole())) {
            throw new RuntimeException("Only candidates can apply to jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check for duplicate application
        applicationRepository.findByCandidateIdAndJobId(candidate.getId(), jobId)
                .ifPresent(a -> {
                    throw new RuntimeException("You have already applied to this job");
                });

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        application.setStatus("APPLIED");

        return applicationRepository.save(application);
    }

    // Get candidate's applications
    public List<Application> getMyApplications(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByCandidate(candidate);
    }

    // Withdraw an application
    public void withdrawApplication(Long applicationId, String candidateEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!application.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("You can only withdraw your own applications");
        }

        applicationRepository.delete(application);
    }

    // ============ RECRUITER ACTIONS ============

    // Get all applicants for a job (recruiter's own job)
    public List<Application> getApplicantsForJob(Long jobId, String recruiterEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = job.getRecruiter().getId().equals(recruiter.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(recruiter.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You can only view applicants for your own jobs");
        }

        return applicationRepository.findByJob(job);
    }

    // Update application status (recruiter's own job)
    public Application updateStatus(Long applicationId, String newStatus, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify the recruiter owns the job
        Job job = application.getJob();
        boolean isOwner = job.getRecruiter().getId().equals(recruiter.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(recruiter.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You can only update applications for your own jobs");
        }

        // Validate status
        String[] validStatuses = {"APPLIED", "SHORTLISTED", "REJECTED", "HIRED"};
        boolean valid = false;
        for (String s : validStatuses) {
            if (s.equalsIgnoreCase(newStatus)) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            throw new RuntimeException("Invalid status. Must be: APPLIED, SHORTLISTED, REJECTED, or HIRED");
        }

        application.setStatus(newStatus.toUpperCase());
        return applicationRepository.save(application);
    }

    // ============ GENERAL ============

    // Get one application by ID
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    // Count applications for a job
    public long countApplicationsForJob(Long jobId) {
        return applicationRepository.countByJobId(jobId);
    }
}