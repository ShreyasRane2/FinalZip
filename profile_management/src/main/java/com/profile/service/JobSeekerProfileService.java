package com.profile.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.profile.entity.JobSeekerProfile;
import com.profile.Repository.JobSeekerProfileRepository;
import com.profile.Kafka.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JobSeekerProfileService {

    @Autowired
    private JobSeekerProfileRepository repo;

    @Autowired
    private KafkaProducerService producer;

    @Autowired
    private ObjectMapper objectMapper;

    public JobSeekerProfile saveProfile(JobSeekerProfile profile) {
        JobSeekerProfile saved = repo.save(profile);

        // Send Kafka event
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("event", "RESUME_UPLOADED");
            event.put("email", profile.getEmail());
            event.put("profileId", saved.getId());
            if(profile.getSkills() != null) event.put("skills", profile.getSkills());

            String eventJson = objectMapper.writeValueAsString(event);

            producer.sendResumeEvent(eventJson);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return saved;
    }

    public Optional<JobSeekerProfile> getProfile(String email) {
        return repo.findByEmail(email);
    }

    public boolean deleteProfile(String email) {
        Optional<JobSeekerProfile> profileOpt = repo.findByEmail(email);
        profileOpt.ifPresent(repo::delete);
        return profileOpt.isPresent();
    }
}
