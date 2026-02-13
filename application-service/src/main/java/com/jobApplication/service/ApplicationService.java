// src/main/java/com/jobapplication/application_service/service/ApplicationService.java
package com.jobApplication.service;

//import com.jobapplication.application_service.model.Application;
//import com.jobapplication.application_service.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jobApplication.model.Application;
import com.jobApplication.repository.ApplicationRepository;
import com.jobApplication.kafka.ApplicationEventProducer;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository repository;

    @Autowired
    private ApplicationEventProducer eventProducer;

    // This method would call User and Job services to verify existence; simplified here
    public Application applyForJob(Application application) {
        application.setApplicationStatus("Applied");
        application.setAppliedDate(LocalDateTime.now());
        Application savedApplication = repository.save(application);
        
        // Send Kafka event (wrapped in try-catch to handle Kafka being unavailable)
        try {
            eventProducer.sendApplicationCreatedEvent(savedApplication);
        } catch (Exception e) {
            System.out.println("Warning: Could not send Kafka event - " + e.getMessage());
            // Continue anyway - application is already saved
        }
        
        return savedApplication;
    }

    public Application getApplication(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Application> getApplicationsByUser(Long userId) {
        return repository.findByApplicantId(userId);
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        return repository.findByJobId(jobId);
    }
}