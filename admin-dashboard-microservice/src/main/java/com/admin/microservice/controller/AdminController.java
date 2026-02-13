package com.admin.microservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.admin.microservice.client.JobClient;
import com.admin.microservice.client.JobApplicationClient;
import com.admin.microservice.client.UserClient;
import com.admin.microservice.external.Job;
import com.admin.microservice.external.JobApplication;
import com.admin.microservice.external.JOB_APPLICATION_STATUS;
import com.admin.microservice.external.User;

import java.util.List;
import java.util.Map;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private JobClient jobClient;

    @Autowired
    private JobApplicationClient jobApplicationClient;

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userClient.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userClient.findUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userClient.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String response = userClient.deleteUser(id);
        return ResponseEntity.ok(response);
    }

    // Job Management
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobClient.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        Job job = jobClient.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping("/jobs")
    public ResponseEntity<Job> createJob(@RequestBody Job job, @RequestParam Long companyId) {
        Job createdJob = jobClient.createJob(job, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<String> updateJob(@PathVariable Long id, @RequestBody Job job) {
        String response = jobClient.updateJob(id, job);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        String response = jobClient.deleteJob(id);
        return ResponseEntity.ok(response);
    }

    // Job Application Management
    @GetMapping("/applications/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicationsForJob(@PathVariable Long jobId) {
        List<JobApplication> applications = jobApplicationClient.getAllJobApplicationsForJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/user/{userId}")
    public ResponseEntity<List<JobApplication>> getApplicationsForUser(@PathVariable Long userId) {
        List<JobApplication> applications = jobApplicationClient.getAllJobApplicationsForUser(userId);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(@PathVariable Long id, @RequestParam JOB_APPLICATION_STATUS status) {
        JobApplication updated = jobApplicationClient.updateJobApplicationStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // Monitoring and Reports
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<User> users = userClient.getAllUsers();
        List<Job> jobs = jobClient.getAllJobs();
        // For applications, I need all, but there's no endpoint for all applications. Let's assume we can get from jobs or something.
        // For simplicity, return counts.

        Map<String, Object> stats = Map.of(
            "totalUsers", users.size(),
            "totalJobs", jobs.size(),
            "activeJobs", jobs.stream().filter(job -> job.getStatus() == com.admin.microservice.external.JOB_STATUS.OPEN).count()
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports/jobs")
    public ResponseEntity<Map<String, Object>> getJobReport() {
        List<Job> jobs = jobClient.getAllJobs();
        Map<com.admin.microservice.external.JOB_STATUS, Long> statusCount = jobs.stream()
            .collect(Collectors.groupingBy(Job::getStatus, Collectors.counting()));
        Map<String, Object> report = Map.of("jobStatusCounts", statusCount);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/applications")
    public ResponseEntity<Map<String, Object>> getApplicationReport() {
        // Since no all applications endpoint, this is placeholder
        Map<String, Object> report = Map.of("message", "Application report - implement aggregation from all jobs");
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/users")
    public ResponseEntity<Map<String, Object>> getUserReport() {
        List<User> users = userClient.getAllUsers();
        Map<String, Object> report = Map.of("totalUsers", users.size());
        return ResponseEntity.ok(report);
    }

}
















