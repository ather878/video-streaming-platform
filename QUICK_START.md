# Quick Start Guide - Video Streaming Platform

## Complete Setup Instructions

### 1. Start Backend Services (in separate terminals)

```bash
cd /Users/ather/IdeaProjects/video-streaming-platform

# Terminal 1: Auth Service
./gradlew :auth-service:bootRun

# Terminal 2: Video Service
./gradlew :video-service:bootRun

# Terminal 3: Upload Service
./gradlew :upload-service:bootRun

# Terminal 4: API Gateway
./gradlew :api-gateway:bootRun
```

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend-web

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

The UI will open at `http://localhost:3000`

---

## API Gateway Configuration

Ensure your API Gateway (`api-gateway/src/main/resources/application.yml`) is configured:

```yaml
server:
  port: 8080
  servlet:
    context-path: ""

spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: http://localhost:8081
          predicates:
            - Path=/auth/**
          
        - id: video-service
          uri: http://localhost:8083
          predicates:
            - Path=/videos/**
          
        - id: upload-service
          uri: http://localhost:8084
          predicates:
            - Path=/upload/**
```

---

## Service Ports

| Service | Port | Endpoint |
|---------|------|----------|
| API Gateway | 8080 | http://localhost:8080 |
| Auth Service | 8081 | http://localhost:8081 |
| Video Service | 8083 | http://localhost:8083 |
| Upload Service | 8084 | http://localhost:8084 |
| Frontend (UI) | 3000 | http://localhost:3000 |

---

## Testing the Platform

### 1. Create an Account
- Navigate to `http://localhost:3000`
- Click "Sign Up"
- Enter username, email, password
- Submit

### 2. Login
- Enter credentials
- You'll be redirected to Home page

### 3. Upload a Video
- Click "Upload" in navbar
- Select a video file (MP4, WebM, etc.)
- Click "Upload Video"
- Enter video details (title, description, category, visibility)
- Click "Create Video"

### 4. View Videos
- Go to Home page
- Browse published videos in a grid
- Click any video to view details and play

### 5. Manage Your Videos
- Navigate to a video you uploaded
- Click "Edit" or "Delete" (only your videos)

---

## Example Test Video

```bash
# Create a dummy video file for testing (10 seconds)
ffmpeg -f lavfi -i testsrc=s=640x480:d=10 \
  -f lavfi -i sine=f=1000:d=10 \
  -pix_fmt yuv420p \
  test-video.mp4
```

If `ffmpeg` is not installed:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

---

## Common Issues & Fixes

### Issue: "Failed to connect to API"
**Fix:** 
- Check all backend services are running
- Verify API Gateway is on port 8080
- Check `.env` has correct `VITE_API_BASE_URL=http://localhost:8080`

### Issue: "Login failed"
**Fix:**
- Ensure auth-service is running
- Check credentials are correct
- Verify database is initialized (first run creates tables)

### Issue: "Upload fails"
**Fix:**
- Check upload-service is running
- Verify file is a valid video format
- Check upload directory has write permissions
- Look at browser console for detailed error

### Issue: "CORS errors"
**Fix:**
- API Gateway may need CORS configuration
- Add CORS headers in API Gateway filter if needed

### Issue: "Videos not showing"
**Fix:**
- Ensure video-service is running
- Upload videos are created successfully
- Check videos use `visibility: PUBLIC`

---

## Database

By default, services use in-memory H2 databases (auto-initialized on startup).

### To persist data (optional):

Update `application.yml` in each service to use PostgreSQL/MySQL:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/video_platform
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```

---

## Development Tips

### Hot Reload Frontend
- Frontend automatically reloads on file changes
- Edit files in `src/` and see changes instantly

### Debug Backend
- Add breakpoints in IDE
- Use `./gradlew --debug` to start service in debug mode
- Check logs in terminal/IDE console

### Test API Directly
```bash
# Test auth endpoint
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'

# Test video listing
curl http://localhost:8080/videos
```

---

## Next Steps

- Add more video services (streaming, transcoding, recommendations)
- Implement video search/filtering
- Add user profiles
- Add comments/likes
- Deploy to production (Docker, Kubernetes)

---

## Support

For issues or questions:
1. Check console logs (browser & terminal)
2. Verify all services are running
3. Check network tab in browser DevTools
4. Review backend logs for errors

