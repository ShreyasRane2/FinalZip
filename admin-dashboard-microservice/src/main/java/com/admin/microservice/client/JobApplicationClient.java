package com.admin.microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.admin.microservice.external.JobApplication;
import com.admin.microservice.external.JOB_APPLICATION_STATUS;

import java.util.List;

@FeignClient(name = "JOB-APPLICATION-SERVICE")
public interface JobApplicationClient {

    @GetMapping("api/job_applications/job")
    List<JobApplication> getAllJobApplicationsForJob(@RequestParam Long jobId);

    @GetMapping("api/job_applications/user")
    List<JobApplication> getAllJobApplicationsForUser(@RequestParam Long userId);

    @GetMapping("api/job_applications/{jobApplicationId}")
    JobApplication getJobApplicationById(@PathVariable Long jobApplicationId);

    @PutMapping("api/admin/job_applications/{jobApplicationId}/status")
    JobApplication updateJobApplicationStatus(@PathVariable Long jobApplicationId, @RequestParam JOB_APPLICATION_STATUS status);

}
















