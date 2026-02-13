package com.admin.microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.admin.microservice.external.Job;

import java.util.List;

@FeignClient(name = "JOB-SERVICE")
public interface JobClient {

    @GetMapping("api/jobs")
    List<Job> getAllJobs();

    @GetMapping("api/jobs/{id}")
    Job getJobById(@PathVariable Long id);

    @PostMapping("api/admin/jobs")
    Job createJob(@RequestBody Job job, @RequestParam Long companyId);

    @PutMapping("api/admin/jobs/{id}")
    String updateJob(@PathVariable Long id, @RequestBody Job job);

    @DeleteMapping("api/admin/jobs/{id}")
    String deleteJob(@PathVariable Long id);

}
















