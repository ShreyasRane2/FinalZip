package com.resume.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.resume.entity.Resume;
import com.resume.service.ResumeService;

@RestController
@RequestMapping("/resume")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // ================= UPLOAD =================
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email,
            @RequestParam("skills") String skills,
            @RequestParam("experience") int experience) {

        try {
            Resume resume = resumeService.uploadResume(file, email, skills, experience);
            return ResponseEntity.ok(resume);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Error uploading resume: " + e.getMessage());
        }
    }

    // ================= GET =================
    @GetMapping
    public ResponseEntity<List<Resume>> getResumes(@RequestParam String email) {
        return ResponseEntity.ok(resumeService.getResumesByEmail(email));
    }
    @GetMapping("/all")
    public List<Resume> getAll() {
        return resumeService.getAll();
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long id,
            @RequestParam String email) {

        boolean deleted = resumeService.deleteResume(id, email);

        if (deleted) {
            return ResponseEntity.ok("Resume deleted successfully");
        } else {
            return ResponseEntity.badRequest()
                    .body("Resume not found or unauthorized");
        }
    }
}
