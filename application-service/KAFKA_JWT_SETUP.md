# Application Service - Kafka & JWT Setup Guide

## Overview
This Spring Boot application now includes:
- **Kafka** integration for event-driven messaging
- **JWT Authentication** for secure API access

## Prerequisites
- Docker and Docker Compose installed
- Java 17+
- Maven

## Getting Started

### 1. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- **Zookeeper** (port 2181): Required for Kafka coordination
- **Kafka** (port 9092): Message broker for event streaming
- **MySQL** (port 3306): Database for application data

### 2. Build the Application

```bash
mvn clean package -DskipTests
```

### 3. Run the Application

```bash
java -jar target/application-service-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8123`

## Authentication (JWT)

### Login Endpoint
Get a JWT token by logging in:

```bash
curl -X POST "http://localhost:8123/auth/login?username=user1"
```

**Built-in Users:**
- Username: `user1` | Password: `password123` | Role: USER
- Username: `admin` | Password: `admin123` | Role: ADMIN

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "username": "user1",
  "message": "Login successful"
}
```

### Using the Token

Include the token in the `Authorization` header for protected endpoints:

```bash
curl -X POST "http://localhost:8123/applications" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1,
    "applicantId": 1,
    "resume": "resume_url",
    "coverLetter": "cover letter text"
  }'
```

### Validate Token

```bash
curl -X POST "http://localhost:8123/auth/validate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

**Response:**
```json
{
  "valid": true,
  "username": "user1"
}
```

## Kafka Integration

### How It Works

1. **Event Producer**: When a new job application is created, an event is published to Kafka
2. **Event Consumer**: The application listens for events and processes them

### Kafka Topics

- `application-events`: Publishes application-related events

### Example Event Flow

1. POST request to create an application
2. Application is saved to MySQL
3. Event is published to Kafka topic `application-events`
4. Consumer picks up the event and processes it (logging, notifications, etc.)

## API Endpoints

### Authentication
- `POST /auth/login?username=user1` - Get JWT token
- `POST /auth/validate` - Validate JWT token

### Applications (Protected - Requires JWT)
- `POST /applications` - Create new application
- `GET /applications/{id}` - Get application by ID
- `GET /applications/user/{userId}` - Get applications by user
- `GET /applications/job/{jobId}` - Get applications by job

## Configuration

### JWT Settings (application.yaml)
```yaml
app:
  jwt:
    secret: mySecretKeyForJWTTokenGenerationAndValidationWithMinimum32CharactersLong
    expiration: 86400000  # 24 hours in milliseconds
```

### Kafka Settings (application.yaml)
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: application-service-group
```

## File Structure

```
src/main/java/com/jobApplication/
├── security/
│   ├── JwtTokenProvider.java       # JWT token generation and validation
│   ├── JwtAuthenticationFilter.java # Filter for JWT validation
│   └── SecurityConfig.java          # Spring Security configuration
├── kafka/
│   ├── ApplicationEventProducer.java # Kafka producer for events
│   └── ApplicationEventConsumer.java # Kafka consumer for events
├── controller/
│   ├── ApplicationController.java    # Application REST API
│   └── AuthController.java           # Authentication endpoints
└── config/
    └── UserDetailsConfig.java        # User details service
```

## Testing

### Create an Application (with JWT)

1. Get a token:
```bash
TOKEN=$(curl -s -X POST "http://localhost:8123/auth/login?username=user1" | jq -r '.token')
```

2. Create an application:
```bash
curl -X POST "http://localhost:8123/applications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1,
    "applicantId": 1,
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am interested in this position"
  }'
```

### Kafka Verification

Check Kafka topics:
```bash
docker exec -it $(docker ps -q -f "label=com.docker.compose.service=kafka") \
  kafka-topics --list --bootstrap-server localhost:9092
```

Consume messages:
```bash
docker exec -it $(docker ps -q -f "label=com.docker.compose.service=kafka") \
  kafka-console-consumer --bootstrap-server localhost:9092 --topic application-events --from-beginning
```

## Troubleshooting

### Connection Issues
- Ensure Docker containers are running: `docker-compose ps`
- Check logs: `docker-compose logs kafka`

### JWT Token Expired
- Default expiration is 24 hours
- Get a new token by logging in again

### Kafka Connection Failed
- Verify Kafka is running: `docker-compose logs kafka`
- Check bootstrap servers in application.yaml

## Security Notes

⚠️ **For Development Only**: The JWT secret and user credentials are hardcoded for demonstration. In production:
- Use environment variables for sensitive data
- Store user credentials in a database
- Implement proper password hashing
- Use stronger JWT secrets
- Enable HTTPS
- Implement rate limiting

## Future Enhancements

- User registration endpoint
- Role-based access control (RBAC)
- Refresh token mechanism
- OAuth2/OpenID Connect integration
- Event sourcing with Kafka
- Distributed tracing (Spring Cloud Sleuth)
