package com.job.microservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.job.microservice.service.JobService;
import com.job.microservice.entity.Job;
import com.job.microservice.dto.JOB_STATUS;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/jobs")
public class AdminJobController {

    private JobService jobService;

    public AdminJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping()
	public ResponseEntity<Job> createJob(@RequestBody Job job, @RequestParam Long companyId)
	{
		Job savedJob = jobService.createJob(job,companyId);
		return new ResponseEntity<>(savedJob,HttpStatus.CREATED);
	}

    @DeleteMapping("/{id}")
	public ResponseEntity<String> deleteJobById(@PathVariable Long id)
	{
		boolean deleted = jobService.deleteJobById(id);
		if(deleted)
		{
			return new ResponseEntity<>("Job deleted successfully",HttpStatus.OK);
		}
		else
		{
			return new ResponseEntity<>("Job not found!",HttpStatus.NOT_FOUND);
		}
	}

    @PutMapping("/{id}")
	public ResponseEntity<String> updateJobById(@PathVariable Long id,@RequestBody Job updatedJob)
	{
		boolean updated = jobService.updateJobById(id,updatedJob);
		if(updated)
		return new ResponseEntity<>("Job updated successfully",HttpStatus.OK);
		return new ResponseEntity<>("Job not found!",HttpStatus.NOT_FOUND);
	}
    
	@PutMapping("/{id}/status")
	public ResponseEntity<String> updateJobStatus(@PathVariable Long id,@RequestParam JOB_STATUS status)
	{
		boolean updated = jobService.updateJobStatus(id,status);
		if(updated)
		return new ResponseEntity<>("Job updated successfully",HttpStatus.OK);
		return new ResponseEntity<>("Job not found!",HttpStatus.NOT_FOUND);
	}
}

