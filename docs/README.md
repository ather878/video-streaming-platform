# Video Streaming Platform - Documentation

## Overview
A scalable, microservices-based video streaming platform built with Spring Boot and Spring Cloud.

## Architecture

### Microservices
1. **API Gateway** (Port 8080) - Central entry point for all requests
2. **Auth Service** (Port 8081) - JWT authentication and token management
3. **User Service** (Port 8082) - User profile and account management
4. **Video Service** (Port 8083) - Video metadata and catalog
5. **Upload Service** (Port 8084) - Video file uploads (max 10GB)
6. **Transcoding Service** (Port 8085) - Video format conversion
7. **Streaming Service** (Port 8086) - Video delivery and playback
8. **Recommendation Service** (Port 8087) - ML-based recommendations
9. **Notification Service** (Port 8088) - User notifications and alerts
10. **Search Service** (Port 8089) - Full-text search for videos
11. **Analytics Service** (Port 8090) - User behavior tracking

### Infrastructure
- **Service Registry**: Eureka (Port 8761)
- **Message Queue**: RabbitMQ (Port 5672, Management 15672)
- **Search Engine**: Elasticsearch (Port 9200)
- **Cache**: Redis (Port 6379)
- **Databases**: 
  - MySQL (Port 3306) - Relational data
  - MongoDB (Port 27017) - NoSQL data
- **File Storage**: AWS S3

## Quick Start

### Prerequisites
- Java 17+
- Gradle 8.5+ (or use the included Gradle wrapper)
- Docker & Docker Compose
- MySQL, MongoDB (optional if using containers)

### Setup

1. **Clone the repository**
   ```bash
   cd /Users/ather/IdeaProjects/video-streaming-platform
   ```

2. **Start infrastructure**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Build all services**
   ```bash
   ./gradlew clean build -x test
   ```

4. **Run services** (in separate terminals)
   ```bash
   # API Gateway
   cd api-gateway
   ./gradlew bootRun

   # Auth Service
   cd auth-service
   ./gradlew bootRun
   
   # ... and so on for other services
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Videos
- `GET /api/videos` - List all videos
- `GET /api/videos/{id}` - Get video details
- `POST /api/upload` - Upload new video
- `GET /api/stream/{id}` - Stream video

### Search
- `GET /api/search?q=keyword` - Search videos

## Deployment

### Docker Deployment
```bash
cd docker
docker-compose up -d
```

### Kubernetes Deployment
```bash
kubectl apply -f kubernetes/
```

## Monitoring

Access Prometheus: `http://localhost:9090`
Access Kibana: `http://localhost:5601`

## Development Guidelines

- Follow microservices best practices
- Use REST conventions for APIs
- Add circuit breakers for service-to-service communication
- Implement proper logging and monitoring
- Write unit and integration tests

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to the branch
4. Create a Pull Request

## License
MIT License

