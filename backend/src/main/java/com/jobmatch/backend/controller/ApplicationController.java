package com.jobmatch.backend.controller;

import com.jobmatch.backend.dto.ApplicationRequest;
import com.jobmatch.backend.dto.ApplicationStatusRequest;
import com.jobmatch.backend.entity.Application;
import com.jobmatch.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // ============ CANDIDATE ENDPOINTS ============

    // POST /api/applications  — Apply to a job (CANDIDATE only)
    @PostMapping
    public ResponseEntity<?> applyToJob(@RequestBody ApplicationRequest request,
                                        Authentication authentication) {
        try {
            String email = authentication.getName();
            Application application = applicationService.applyToJob(request.getJobId(), email);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/applications/my-applications  — Candidate's applications
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Application> applications = applicationService.getMyApplications(email);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/applications/{id}  — Withdraw application
    @DeleteMapping("/{id}")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long id,
                                                 Authentication authentication) {
        try {
            String email = authentication.getName();
            applicationService.withdrawApplication(id, email);
            return ResponseEntity.ok("Application withdrawn successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============ RECRUITER ENDPOINTS ============

    // GET /api/applications/job/{jobId}  — Recruiter views applicants for their job
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicantsForJob(@PathVariable Long jobId,
                                                 Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Application> applications = applicationService.getApplicantsForJob(jobId, email);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/applications/{id}/status  — Recruiter updates application status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody ApplicationStatusRequest request,
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            Application application = applicationService.updateStatus(id, request.getStatus(), email);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============ GENERAL ============

    // GET /api/applications/{id}  — View one application
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(applicationService.getApplicationById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}