package com.admin.microservice.kafka;

import com.admin.microservice.dto.AdminEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AdminEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public AdminEventProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishAdminEvent(AdminEvent adminEvent) {
        log.info("Publishing admin event to Kafka topic: {}", adminEvent);
        
        Message<AdminEvent> message = MessageBuilder
                .withPayload(adminEvent)
                .setHeader(KafkaHeaders.TOPIC, "admin-events-topic")
                .setHeader("eventType", adminEvent.getEventType())
                .build();
        
        kafkaTemplate.send(message);
        log.info("Admin event published successfully: {}", adminEvent.getEventId());
    }

    public void publishAuditLog(String userId, String action, String resource) {
        AdminEvent auditEvent = new AdminEvent();
        auditEvent.setEventType("AUDIT_LOG");
        auditEvent.setUserId(userId);
        auditEvent.setAction(action);
        auditEvent.setTargetResource(resource);
        auditEvent.setTimestamp(String.valueOf(System.currentTimeMillis()));
        auditEvent.setStatus("LOGGED");

        publishAdminEvent(auditEvent);
    }
}
