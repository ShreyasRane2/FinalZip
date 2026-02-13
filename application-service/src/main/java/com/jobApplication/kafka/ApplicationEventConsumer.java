package com.jobApplication.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import com.jobApplication.model.Application;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ApplicationEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationEventConsumer.class);

    @KafkaListener(topics = "application-events", groupId = "application-service-group")
    public void consumeApplicationEvent(Application application) {
        logger.info("Received application event: {}", application.getId());
        // Process the event here
        // For example, you could send notifications, update cache, etc.
    }
}
