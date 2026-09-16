package com.jobmatch.backend.service;

import com.jobmatch.backend.dto.JobRequest;
import com.jobmatch.backend.entity.Job;
import com.jobmatch.backend.entity.User;
import com.jobmatch.backend.repository.JobRepository;
import com.jobmatch.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new job (recruiter only)
    public Job createJob(JobRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (!"RECRUITER".equalsIgnoreCase(recruiter.getRole())
                && !"ADMIN".equalsIgnoreCase(recruiter.getRole())) {
            throw new RuntimeException("Only recruiters can post jobs");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setDescription(request.getDescription());
        job.setSkills(request.getSkills());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setRecruiter(recruiter);

        return jobRepository.save(job);
    }

    // Get all jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAllByOrderByIdDesc();
    }

    // Get a single job by ID
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    // Get jobs posted by a specific recruiter
    public List<Job> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    // Get jobs by the currently logged-in recruiter
    public List<Job> getMyJobs(String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        return jobRepository.findByRecruiter(recruiter);
    }

    // Search jobs
    public List<Job> searchJobs(String keyword) {
        return jobRepository.searchJobs(keyword);
    }

    // Filter jobs by location
    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocationContainingIgnoreCase(location);
    }

    // Filter jobs by skill
    public List<Job> getJobsBySkill(String skill) {
        return jobRepository.findBySkillsContainingIgnoreCase(skill);
    }

    // Delete a job (only by owner or admin)
    public void deleteJob(Long jobId, String userEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = job.getRecruiter().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You can only delete your own jobs");
        }

        jobRepository.delete(job);
    }
}