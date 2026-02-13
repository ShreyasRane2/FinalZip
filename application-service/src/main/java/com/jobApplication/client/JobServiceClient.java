package com.jobApplication.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class JobServiceClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${job-service.url}")
    private String jobServiceUrl;
    
    public JobDTO getJobById(Long jobId, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<JobDTO> response = restTemplate.exchange(
                jobServiceUrl + "/job/" + jobId,
                HttpMethod.GET,
                entity,
                JobDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch job from Job Service: " + e.getMessage());
        }
    }
    
    public JobDTO[] getAllJobs(String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<JobDTO[]> response = restTemplate.exchange(
                jobServiceUrl + "/job",
                HttpMethod.GET,
                entity,
                JobDTO[].class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch jobs from Job Service: " + e.getMessage());
        }
    }
}
