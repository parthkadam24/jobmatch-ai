package com.jobmatch.backend.controller;

import com.jobmatch.backend.entity.Resume;
import com.jobmatch.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // POST /api/resumes/upload  — Upload resume (CANDIDATE only)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file,
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            Resume resume = resumeService.uploadResume(file, email);
            return ResponseEntity.ok(resume);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/resumes/my-resume  — View my own resume (CANDIDATE)
    @GetMapping("/my-resume")
    public ResponseEntity<?> getMyResume(Authentication authentication) {
        try {
            String email = authentication.getName();
            Resume resume = resumeService.getMyResume(email);
            return ResponseEntity.ok(resume);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/resumes/candidate/{candidateId}  — Recruiter views a candidate's resume
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getResumeByCandidate(@PathVariable Long candidateId) {
        try {
            Resume resume = resumeService.getResumeByCandidateId(candidateId);
            return ResponseEntity.ok(resume);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/resumes  — Delete my resume (CANDIDATE)
    @DeleteMapping
    public ResponseEntity<?> deleteResume(Authentication authentication) {
        try {
            String email = authentication.getName();
            resumeService.deleteResume(email);
            return ResponseEntity.ok("Resume deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to delete file: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}