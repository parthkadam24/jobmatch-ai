package com.jobmatch.backend.controller;

import com.jobmatch.backend.entity.Job;
import com.jobmatch.backend.entity.Resume;
import com.jobmatch.backend.repository.JobRepository;
import com.jobmatch.backend.repository.ResumeRepository;
import com.jobmatch.backend.service.AIService;
import com.jobmatch.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    // ============================================================
    // HEALTH CHECK
    // ============================================================
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Service is alive (mock mode)");
    }

    // ============================================================
    // FEATURE 1: PARSE RESUME
    // POST /api/ai/parse-resume/{resumeId}
    // ============================================================
    @PostMapping("/parse-resume/{resumeId}")
    public ResponseEntity<?> parseResume(@PathVariable Long resumeId) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            // Extract real text from PDF
            String resumeText = resumeService.extractTextFromPdf(resume.getFileUrl());
            System.out.println("=== Extracted PDF text (" + resumeText.length() + " chars) ===");
            System.out.println(resumeText);

            Map<String, Object> parsed = aiService.parseResume(resumeText);

            @SuppressWarnings("unchecked")
            List<String> skillsList = (List<String>) parsed.get("skills");
            String skillsCsv = String.join(", ", skillsList);
            String experience = (String) parsed.getOrDefault("experience", "");

            resume.setSkills(skillsCsv);
            resume.setExperience(experience);
            Resume saved = resumeRepository.save(resume);

            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // FEATURE 2: MATCH SCORE
    // GET /api/ai/match/{jobId}/{candidateId}
    // ============================================================
    @GetMapping("/match/{jobId}/{candidateId}")
    public ResponseEntity<?> matchScore(@PathVariable Long jobId,
                                        @PathVariable Long candidateId) {
        try {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            Optional<Resume> resumeOpt = resumeRepository.findByCandidateId(candidateId);
            if (resumeOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Candidate has not uploaded a resume");
            }

            Resume resume = resumeOpt.get();
            if (resume.getSkills() == null || resume.getSkills().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Resume has not been parsed yet. Call /api/ai/parse-resume/" + resume.getId() + " first.");
            }

            Map<String, Object> result = aiService.calculateMatch(
                    resume.getSkills(),
                    job.getSkills()
            );

            result.put("jobId", jobId);
            result.put("jobTitle", job.getTitle());
            result.put("candidateId", candidateId);
            result.put("candidateSkills", resume.getSkills());
            result.put("requiredSkills", job.getSkills());

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // FEATURE 3: COVER LETTER GENERATOR
    // POST /api/ai/cover-letter
    // ============================================================
    @PostMapping("/cover-letter")
    public ResponseEntity<?> coverLetter(@RequestBody Map<String, Long> body) {
        try {
            Long jobId = body.get("jobId");
            Long resumeId = body.get("resumeId");

            if (jobId == null || resumeId == null) {
                return ResponseEntity.badRequest()
                        .body("Please provide both jobId and resumeId");
            }

            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            String candidateName = resume.getCandidate().getFullName();
            String skills = resume.getSkills() != null ? resume.getSkills() : "my professional skills";

            String coverLetter = aiService.generateCoverLetter(
                    candidateName,
                    job.getTitle(),
                    job.getCompany(),
                    skills
            );

            Map<String, Object> response = new HashMap<>();
            response.put("jobTitle", job.getTitle());
            response.put("company", job.getCompany());
            response.put("candidateName", candidateName);
            response.put("coverLetter", coverLetter);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // FEATURE 4: JOB SUMMARY
    // GET /api/ai/summarize-job/{jobId}
    // ============================================================
    @GetMapping("/summarize-job/{jobId}")
    public ResponseEntity<?> summarizeJob(@PathVariable Long jobId) {
        try {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            String summary = aiService.summarizeJob(job.getDescription());

            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("title", job.getTitle());
            response.put("summary", summary);
            response.put("originalLength", job.getDescription() != null ? job.getDescription().length() : 0);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}