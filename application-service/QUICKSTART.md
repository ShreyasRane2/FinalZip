# Quick Start Guide - Kafka & JWT Integration

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Docker & Docker Compose
- Java 17+ (recommended) or use Docker build
- Maven

### Step 1: Start Infrastructure Services
```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

You should see:
- `kafka` (port 9092, 29092)
- `zookeeper` (port 2181)
- `mysql` (port 3306)

### Step 2: Build the Application

**Option A: Local Build (if Java 17 is available)**
```bash
./build.sh          # Linux/Mac
# OR
build.bat          # Windows
```

**Option B: Docker Build (Recommended)**
```bash
docker run --rm -v "%cd%":/workspace -w /workspace maven:3.9-eclipse-temurin-17 mvn clean package -DskipTests
```

### Step 3: Run the Application
```bash
java -jar target/application-service-0.0.1-SNAPSHOT.jar
```

The app starts on `http://localhost:8123`

---

## 🔐 Authentication (JWT)

### Get a Token
```bash
curl -X POST "http://localhost:8123/auth/login?username=user1"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyMSIsImlhdCI6MTcxMzAwMDAwMCwiZXhwIjoxNzEzMDAwMDAwfQ...",
  "username": "user1",
  "message": "Login successful"
}
```

### Use the Token
Save the token and include it in requests:
```bash
TOKEN=eyJhbGciOiJIUzUxMiJ9...

curl -X GET "http://localhost:8123/applications/1" \
  -H "Authorization: Bearer $TOKEN"
```

### Available Users
```
user1 / password123 (ROLE_USER)
admin / admin123 (ROLE_ADMIN)
```

---

## 📨 Kafka Events

### Create an Application (This Publishes a Kafka Event)
```bash
TOKEN=your_jwt_token_here

curl -X POST "http://localhost:8123/applications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1,
    "applicantId": 1,
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am interested in this role"
  }'
```

### Monitor Kafka Events
```bash
# List Kafka topics
docker exec $(docker ps -q -f "label=com.docker.compose.service=kafka") \
  kafka-topics --list --bootstrap-server localhost:9092

# Consume messages from topic
docker exec -it $(docker ps -q -f "label=com.docker.compose.service=kafka") \
  kafka-console-consumer --bootstrap-server localhost:9092 \
    --topic application-events --from-beginning
```

You should see events like:
```
application-created-1: {...application json...}
```

---

## 📊 API Endpoints

### Authentication
```
POST /auth/login?username=user1
  ↳ Get JWT token

POST /auth/validate
  ↳ Validate JWT token
  Header: Authorization: Bearer <token>
```

### Applications (Protected - Requires JWT)
```
POST /applications
  ↳ Create new application
  Header: Authorization: Bearer <token>

GET /applications/{id}
  ↳ Get application by ID
  Header: Authorization: Bearer <token>

GET /applications/user/{userId}
  ↳ Get all applications by user
  Header: Authorization: Bearer <token>

GET /applications/job/{jobId}
  ↳ Get all applications for a job
  Header: Authorization: Bearer <token>
```

---

## 🐛 Troubleshooting

### Build Fails with "Cannot load from object array"
**Cause**: Java 21 with Spring Boot 4.0.2 incompatibility
**Solution**: Use Docker build (see Step 2, Option B)

### Cannot Connect to Kafka
**Check**: `docker-compose ps` - is kafka container running?
**Fix**: `docker-compose restart kafka`

### JWT Token Expired
**Cause**: Token expires after 24 hours (configurable in `application.yaml`)
**Solution**: Get a new token with login endpoint

### MySQL Connection Error
**Check**: Is mysql container running? `docker-compose logs mysql`
**Fix**: `docker-compose down && docker-compose up -d`

---

## 📁 Project Structure

```
src/main/java/com/jobApplication/
├── security/
│   ├── JwtTokenProvider.java       ← Token management
│   ├── JwtAuthenticationFilter.java ← Request filtering
│   └── SecurityConfig.java          ← Security setup
├── kafka/
│   ├── ApplicationEventProducer.java ← Send events
│   └── ApplicationEventConsumer.java ← Receive events
├── controller/
│   ├── AuthController.java          ← Login endpoint
│   └── ApplicationController.java    ← Application CRUD
├── service/
│   └── ApplicationService.java       ← Business logic
├── model/
│   └── Application.java              ← Data model
└── repository/
    └── ApplicationRepository.java    ← Database access

compose.yaml                          ← Docker services
application.yaml                      ← App configuration
pom.xml                              ← Dependencies
```

---

## 🔧 Configuration Files

### application.yaml
```yaml
server:
  port: 8123

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/jobportal
    username: root
    password: root

  kafka:
    bootstrap-servers: localhost:9092

app:
  jwt:
    secret: mySecretKey... (min 32 chars)
    expiration: 86400000  # 24 hours
```

### compose.yaml
Services:
- **kafka** (Confluent) - Message broker
- **zookeeper** - Kafka coordination
- **mysql:8.0** - Database

---

## 📚 Learn More

- See [KAFKA_JWT_SETUP.md](./KAFKA_JWT_SETUP.md) for detailed setup
- See [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) for implementation details

---

## ✅ Verification Checklist

- [ ] Docker containers are running (`docker-compose ps`)
- [ ] MySQL database is accessible
- [ ] Kafka broker is available
- [ ] Application builds successfully
- [ ] Application starts on port 8123
- [ ] Can login and get JWT token
- [ ] Can access protected endpoints with JWT
- [ ] Kafka events are being published

---

**Happy Coding! 🎉**

For issues or questions, refer to the detailed documentation files.
