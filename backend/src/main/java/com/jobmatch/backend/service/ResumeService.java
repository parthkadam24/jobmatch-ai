package com.jobmatch.backend.service;

import com.jobmatch.backend.entity.Resume;
import com.jobmatch.backend.entity.User;
import com.jobmatch.backend.repository.ResumeRepository;
import com.jobmatch.backend.repository.UserRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // Upload a resume for the logged-in candidate
    public Resume uploadResume(MultipartFile file, String candidateEmail) throws IOException {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CANDIDATE".equalsIgnoreCase(candidate.getRole())) {
            throw new RuntimeException("Only candidates can upload resumes");
        }

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("application/pdf") &&
                        !contentType.equals("application/msword") &&
                        !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new RuntimeException("Only PDF, DOC, or DOCX files are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 5 MB");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID() + extension;

        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        resumeRepository.findByCandidate(candidate)
                .ifPresent(old -> resumeRepository.delete(old));

        Resume resume = new Resume();
        resume.setCandidate(candidate);
        resume.setFileUrl(filePath.toString());
        resume.setUploadedAt(LocalDateTime.now());

        return resumeRepository.save(resume);
    }

    public Resume getMyResume(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resumeRepository.findByCandidate(candidate)
                .orElseThrow(() -> new RuntimeException("No resume uploaded yet"));
    }

    public Resume getResumeByCandidateId(Long candidateId) {
        return resumeRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new RuntimeException("Resume not found for candidate"));
    }

    public Resume updateParsedData(Long resumeId, String skills, String experience) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        resume.setSkills(skills);
        resume.setExperience(experience);
        return resumeRepository.save(resume);
    }

    public void deleteResume(String candidateEmail) throws IOException {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByCandidate(candidate)
                .orElseThrow(() -> new RuntimeException("No resume found"));

        try {
            Path filePath = Paths.get(resume.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // ignore
        }

        resumeRepository.delete(resume);
    }

    // Extract text from a PDF file — THIS IS NOW OUTSIDE deleteResume ✅
    public String extractTextFromPdf(String filePath) {
        try {
            java.io.File file = new java.io.File(filePath);
            if (!file.exists()) {
                return "";
            }
            try (PDDocument document = Loader.loadPDF(file)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (Exception e) {
            System.err.println("Failed to extract PDF text: " + e.getMessage());
            return "";
        }
    }
}