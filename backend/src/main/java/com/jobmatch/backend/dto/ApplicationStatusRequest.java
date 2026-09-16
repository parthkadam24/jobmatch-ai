package com.jobmatch.backend.dto;

public class ApplicationStatusRequest {

    private String status;  // APPLIED, SHORTLISTED, REJECTED, HIRED

    // Getters and Setters

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}