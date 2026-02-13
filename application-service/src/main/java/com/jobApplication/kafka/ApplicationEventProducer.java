package com.jobApplication.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.jobApplication.model.Application;

@Service
public class ApplicationEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationEventProducer.class);
    private static final String TOPIC = "application-events";

    @Autowired(required = false)
    private KafkaTemplate<String, Application> kafkaTemplate;

    /**
     * Send application created event
     */
    public void sendApplicationCreatedEvent(Application application) {
        if (kafkaTemplate != null) {
            logger.info("📤 [Kafka] Sending Application Created Event - App ID: {}", application.getId());
            kafkaTemplate.send(TOPIC, "application-created-" + application.getId(), application);
        } else {
            logger.warn("⚠️  [Kafka] KafkaTemplate not available. Kafka might not be running.");
            logger.info("📤 [Event Log] Application Created - App ID: {} | Applicant: {} | Job: {}", 
                        application.getId(), application.getApplicantId(), application.getJobId());
        }
    }

    /**
     * Send application status changed event
     */
    public void sendApplicationStatusChangedEvent(Application application) {
        if (kafkaTemplate != null) {
            logger.info("📤 [Kafka] Sending Application Status Changed Event - App ID: {} | Status: {}", 
                        application.getId(), application.getApplicationStatus());
            kafkaTemplate.send(TOPIC, "application-status-changed-" + application.getId(), application);
        } else {
            logger.warn("⚠️  [Kafka] KafkaTemplate not available.");
            logger.info("📤 [Event Log] Status Changed - App ID: {} | New Status: {}", 
                        application.getId(), application.getApplicationStatus());
        }
    }
}



