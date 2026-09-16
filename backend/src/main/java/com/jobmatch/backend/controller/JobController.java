package com.jobmatch.backend.controller;

import com.jobmatch.backend.dto.JobRequest;
import com.jobmatch.backend.entity.Job;
import com.jobmatch.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    // POST /api/jobs  — Create a new job (recruiter only)
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobRequest request, Authentication authentication) {
        try {
            String email = authentication.getName();
            Job job = jobService.createJob(request, email);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/jobs  — Get all jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // GET /api/jobs/{id}  — Get a single job
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.getJobById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/jobs/my-jobs  — Jobs posted by the logged-in recruiter
    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(Authentication authentication) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(jobService.getMyJobs(email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/jobs/recruiter/{recruiterId}  — Jobs by recruiter ID
    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<Job>> getJobsByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(jobService.getJobsByRecruiter(recruiterId));
    }

    // GET /api/jobs/search?keyword=java  — Search jobs
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String keyword) {
        return ResponseEntity.ok(jobService.searchJobs(keyword));
    }

    // GET /api/jobs/location?location=Remote  — Filter by location
    @GetMapping("/location")
    public ResponseEntity<List<Job>> getJobsByLocation(@RequestParam String location) {
        return ResponseEntity.ok(jobService.getJobsByLocation(location));
    }

    // GET /api/jobs/skill?skill=Java  — Filter by skill
    @GetMapping("/skill")
    public ResponseEntity<List<Job>> getJobsBySkill(@RequestParam String skill) {
        return ResponseEntity.ok(jobService.getJobsBySkill(skill));
    }

    // DELETE /api/jobs/{id}  — Delete a job (owner or admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            jobService.deleteJob(id, email);
            return ResponseEntity.ok("Job deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}