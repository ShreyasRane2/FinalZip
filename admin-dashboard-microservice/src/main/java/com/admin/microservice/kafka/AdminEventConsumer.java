package com.admin.microservice.kafka;

import com.admin.microservice.dto.AdminEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AdminEventConsumer {

    @KafkaListener(
        topics = "admin-events-topic",
        groupId = "admin-dashboard-group"
    )
    public void consumeAdminEvent(AdminEvent adminEvent) {
        log.info("Consuming admin event from Kafka topic: {}", adminEvent);
        
        // Process admin event based on event type
        switch (adminEvent.getEventType()) {
            case "AUDIT_LOG":
                handleAuditLog(adminEvent);
                break;
            case "JOB_UPDATE":
                handleJobUpdate(adminEvent);
                break;
            case "USER_ACTIVITY":
                handleUserActivity(adminEvent);
                break;
            case "APPLICATION_STATUS":
                handleApplicationStatus(adminEvent);
                break;
            default:
                log.warn("Unknown admin event type: {}", adminEvent.getEventType());
        }
        
        log.info("Admin event processed successfully: {}", adminEvent.getEventId());
    }

    private void handleAuditLog(AdminEvent event) {
        log.info("Audit Log - User: {}, Action: {}, Resource: {}", 
            event.getUserId(), event.getAction(), event.getTargetResource());
        // Add audit log processing logic here
    }

    private void handleJobUpdate(AdminEvent event) {
        log.info("Job Update - Resource: {}, Status: {}", 
            event.getTargetResource(), event.getStatus());
        // Add job update processing logic here
    }

    private void handleUserActivity(AdminEvent event) {
        log.info("User Activity - User: {}, Action: {}", 
            event.getUserId(), event.getAction());
        // Add user activity processing logic here
    }

    private void handleApplicationStatus(AdminEvent event) {
        log.info("Application Status - Resource: {}, Status: {}", 
            event.getTargetResource(), event.getStatus());
        // Add application status processing logic here
    }
}
