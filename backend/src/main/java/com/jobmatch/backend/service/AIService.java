package com.jobmatch.backend.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    // ============================================================
    // FEATURE 1: PARSE RESUME (Mock)
    // ============================================================
    // Later, replace this with a real OpenAI API call.
    // For now, we return sample data based on common keywords.
    public Map<String, Object> parseResume(String resumeText) {
        Map<String, Object> result = new HashMap<>();

        if (resumeText == null || resumeText.trim().isEmpty()) {
            result.put("skills", new ArrayList<String>());
            result.put("experience", "");
            result.put("education", "");
            return result;
        }

        String lower = resumeText.toLowerCase();

        // Simple keyword detection (works well with our fake PDF)
        List<String> skills = new ArrayList<>();
        String[] knownSkills = {
                "java", "spring", "spring boot", "hibernate", "jpa", "mysql", "postgresql",
                "rest", "rest api", "maven", "git", "docker", "kubernetes", "aws",
                "react", "javascript", "typescript", "node", "express", "mongodb",
                "python", "django", "flask", "html", "css", "tailwind",
                "jwt", "oauth", "microservices", "kafka", "redis", "linux",
                "c++", "c#", "kotlin", "swift", "firebase", "openai"
        };

        for (String skill : knownSkills) {
            if (lower.contains(skill)) {
                skills.add(capitalize(skill));
            }
        }

        // Detect experience from text (e.g., "2 years")
        String experience = "";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("(\\d+)\\s*(\\+)?\\s*(years?|yrs?)");
        java.util.regex.Matcher m = p.matcher(lower);
        if (m.find()) {
            experience = m.group(1) + " years";
        }

        // Detect education
        String education = "";
        if (lower.contains("b.tech") || lower.contains("btech")) {
            education = "B.Tech";
        } else if (lower.contains("b.e") || lower.contains("bachelor")) {
            education = "Bachelor's Degree";
        } else if (lower.contains("m.tech") || lower.contains("mtech") || lower.contains("master")) {
            education = "Master's Degree";
        }

        result.put("skills", skills);
        result.put("experience", experience);
        result.put("education", education);
        return result;
    }

    // ============================================================
    // FEATURE 2: MATCH SCORE (REAL — no AI needed!)
    // ============================================================
    public Map<String, Object> calculateMatch(String candidateSkillsCsv, String jobSkillsCsv) {
        Map<String, Object> result = new HashMap<>();

        if (candidateSkillsCsv == null || jobSkillsCsv == null) {
            result.put("score", 0.0);
            result.put("matched", new ArrayList<String>());
            result.put("missing", new ArrayList<String>());
            result.put("recommendation", "Insufficient data to match");
            return result;
        }

        // Normalize to lowercase sets
        Set<String> candidate = Arrays.stream(candidateSkillsCsv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        Set<String> required = Arrays.stream(jobSkillsCsv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        if (required.isEmpty()) {
            result.put("score", 0.0);
            result.put("matched", new ArrayList<String>());
            result.put("missing", new ArrayList<String>());
            result.put("recommendation", "No required skills listed");
            return result;
        }

        // Find matched and missing skills
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : required) {
            boolean found = false;
            for (String cand : candidate) {
                if (cand.contains(req) || req.contains(cand)) {
                    found = true;
                    break;
                }
            }
            if (found) {
                matched.add(capitalize(req));
            } else {
                missing.add(capitalize(req));
            }
        }

        // Calculate score
        double score = (double) matched.size() / required.size() * 100.0;
        score = Math.round(score * 10.0) / 10.0;

        // Generate recommendation
        String recommendation;
        if (score >= 80) {
            recommendation = "Excellent match! You meet most of the required skills.";
        } else if (score >= 60) {
            recommendation = "Good match! Consider highlighting your existing skills.";
        } else if (score >= 40) {
            recommendation = "Partial match. Focus on learning: " + String.join(", ", missing);
        } else {
            recommendation = "Low match. Consider upskilling in: " + String.join(", ", missing);
        }

        result.put("score", score);
        result.put("matched", matched);
        result.put("missing", missing);
        result.put("recommendation", recommendation);
        return result;
    }

    // ============================================================
    // FEATURE 3: COVER LETTER GENERATOR (Mock)
    // ============================================================
    public String generateCoverLetter(String candidateName, String jobTitle,
                                      String company, String candidateSkills) {
        return String.format(
                "Dear Hiring Manager,\n\n" +
                        "I am writing to express my strong interest in the %s position at %s. " +
                        "With my background in %s, I am confident I would be a valuable addition to your team.\n\n" +
                        "Throughout my career, I have developed expertise in %s. " +
                        "I am particularly drawn to this role because it aligns perfectly with my skills and career goals. " +
                        "I thrive in collaborative environments and am eager to contribute to %s's continued success.\n\n" +
                        "I would welcome the opportunity to discuss how my experience and skills can benefit your team. " +
                        "Thank you for considering my application.\n\n" +
                        "Sincerely,\n%s",
                jobTitle, company, candidateSkills, candidateSkills, company, candidateName
        );
    }

    // ============================================================
    // FEATURE 4: JOB SUMMARY (Mock)
    // ============================================================
    public String summarizeJob(String jobDescription) {
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return "No description available.";
        }
        if (jobDescription.length() <= 200) {
            return jobDescription;
        }
        return jobDescription.substring(0, 200) + "...";
    }

    // ============================================================
    // HELPER
    // ============================================================
    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        String[] parts = s.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                        .append(part.substring(1).toLowerCase())
                        .append(" ");
            }
        }
        return sb.toString().trim();
    }
}