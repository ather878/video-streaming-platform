# MinIO Upload Workflow - Implementation Summary

## What Was Changed

### Backend Changes

#### 1. Upload Service (upload-service)

**Dependencies Added**:
- Added MinIO dependency (`io.minio:minio:8.4.3`) to `build.gradle`

**New Entities**:
- `Video.java` - Represents a video being uploaded with statuses: INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED
- `MediaAsset.java` - Represents video assets stored in MinIO (ORIGINAL, HLS variants, THUMBNAIL, etc.)

**New Repositories**:
- `VideoRepository.java` - JPA repository for Video entity
- `MediaAssetRepository.java` - JPA repository for MediaAsset entity

**New Services**:
- `MinioService.java` - Handles MinIO operations:
  - `generatePresignedUploadUrl()` - Creates time-limited upload URLs
  - `generatePresignedDownloadUrl()` - Creates time-limited download URLs
  - `generateObjectKey()` - Creates object keys following pattern: `videos/{videoId}/{timestamp}-{filename}`
  
- `UploadInitiationService.java` - Orchestrates upload initialization:
  - Creates Video and MediaAsset records in database
  - Generates presigned URLs
  - Returns response to frontend

**New Configuration**:
- `MinioConfig.java` - Spring configuration class for MinIO client initialization

**New DTOs**:
- `InitiateUploadRequest.java` - Request body for `/upload/initiate` endpoint
- `InitiateUploadResponse.java` - Response containing presigned URL and video ID

**Controller Updates**:
- `UploadController.java` - Added new endpoint:
  - `POST /upload/initiate` - Returns presigned URL for direct MinIO upload

**Configuration File Updates**:
- `application.yml` - Added MinIO configuration:
  ```yaml
  minio:
    url: http://localhost:9000
    access-key: minioadmin
    secret-key: minioadmin
    bucket-name: videos
    default-expiry-hours: 24
  ```

#### 2. Video Service (video-service)

**Model Updates**:
- `Video.java` - Updated Status enum from `(PENDING, PROCESSING, COMPLETED, FAILED)` to `(INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED)`
- Changed `uploadStatus` field to `status` field for consistency

### Frontend Changes

#### 1. API Services (frontend-web/src/api/services.js)

**New Functions**:
- `uploadAPI.initiateUpload(uploadRequest)` - Calls `/upload/initiate` endpoint
- `uploadAPI.uploadToMinIO(presignedUrl, file)` - Uploads file directly to MinIO using presigned URL

#### 2. Upload Page (frontend-web/src/pages/Upload.jsx)

**Workflow Changes**:
- Old: Create video record → Upload file through API (multipart)
- New: Get presigned URL → Upload file directly to MinIO

**UI Updates**:
- Removed category field from form
- Updated step indicators: "Initiating upload" → "Uploading to storage"
- Added file size display
- Improved error handling

**Features**:
- Real-time upload progress tracking
- Presigned URL generation with 24-hour expiration
- Direct file upload to MinIO (bypasses API gateway)
- Automatic redirect to video detail page after upload

### Database Schema Changes

**New Tables Created**:

```sql
-- Videos table (tracks upload state)
CREATE TABLE videos (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    uploader_id UUID NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    duration_seconds BIGINT,
    thumbnail_url TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Media assets table (tracks video assets in MinIO)
CREATE TABLE media_assets (
    id UUID PRIMARY KEY,
    video_id UUID NOT NULL,
    asset_type VARCHAR(30) NOT NULL,
    object_key TEXT NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    upload_status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_media_assets_video_id ON media_assets(video_id);
```

## New Upload Flow

1. **User submits form** with video title, description, visibility, and file
2. **Frontend calls `/api/upload/initiate`** with video metadata and file info
3. **Upload Service**:
   - Creates Video record (status: INITIATED)
   - Creates MediaAsset record (status: INITIATED)
   - Generates presigned URL via MinIO
   - Returns video_id and presigned_url to frontend
4. **Frontend uploads file directly to MinIO** using presigned URL
5. **Frontend navigates** to video detail page
6. **Backend (future)**: 
   - Polls for upload completion
   - Updates MediaAsset status to UPLOADED
   - Triggers transcoding process

## Files Modified/Created

### Backend Files
```
upload-service/
├── build.gradle (MODIFIED - added MinIO dependency)
├── src/main/resources/application.yml (MODIFIED - added MinIO config)
└── src/main/java/com/videostreaming/upload/
    ├── config/MinioConfig.java (NEW)
    ├── dto/
    │   ├── InitiateUploadRequest.java (NEW)
    │   └── InitiateUploadResponse.java (NEW)
    ├── model/
    │   ├── Video.java (NEW)
    │   └── MediaAsset.java (NEW)
    ├── repository/
    │   ├── VideoRepository.java (NEW)
    │   └── MediaAssetRepository.java (NEW)
    ├── service/
    │   ├── MinioService.java (NEW)
    │   └── UploadInitiationService.java (NEW)
    └── controller/UploadController.java (MODIFIED)

video-service/
└── src/main/java/com/videostreaming/video/model/Video.java (MODIFIED)
```

### Frontend Files
```
frontend-web/
├── src/api/services.js (MODIFIED)
└── src/pages/Upload.jsx (MODIFIED)
```

### Documentation Files
```
docs/
└── MINIO_WORKFLOW.md (NEW - comprehensive guide)
```

## Quick Start

### 1. Prerequisites
- Docker (for MinIO)
- Node.js 18+ (for frontend)
- Java 21 (for backend)
- PostgreSQL (for database)

### 2. Start Infrastructure
```bash
# Option A: Using docker-compose
docker compose -f docker/docker-compose.yml up -d

# Option B: Using start-all script
chmod +x scripts/*.sh
./scripts/start-all.sh
```

### 3. Initialize MinIO
```bash
# Access MinIO Console: http://localhost:9001
# Username: minioadmin
# Password: minioadmin

# Create 'videos' bucket (if not exists)
```

### 4. Verify Services
```bash
# Check upload-service is running
curl http://localhost:8084/upload/initiate \
  -X OPTIONS -v

# Check MinIO is accessible
curl http://localhost:9000/
```

### 5. Test Upload Flow
1. Navigate to frontend: http://localhost:5173
2. Go to Upload page
3. Fill in video details (title, description, visibility)
4. Select a video file
5. Click "Publish Video"
6. Monitor the upload progress
7. Should be redirected to video detail page after successful upload

## Configuration Reference

### Environment Variables (Frontend)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STREAM_BASE_URL=http://localhost:8086/stream
```

### Environment Variables (Backend - upload-service/application.yml)
```yaml
minio:
  url: http://localhost:9000              # MinIO endpoint
  access-key: minioadmin                  # MinIO access key
  secret-key: minioadmin                  # MinIO secret key
  bucket-name: videos                     # Storage bucket name
  default-expiry-hours: 24                # Presigned URL expiration
```

## API Endpoint Reference

### POST /upload/initiate
**Purpose**: Initiate a video upload and receive a presigned URL

**Request**:
```json
{
  "title": "My Video",
  "description": "Video description",
  "visibility": "PUBLIC",
  "file_name": "video.mp4",
  "file_size": 1024000000,
  "content_type": "video/mp4"
}
```

**Headers**:
```
X-User-Id: <uuid>
Content-Type: application/json
```

**Response** (201 Created):
```json
{
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "presigned_url": "http://localhost:9000/videos/...",
  "object_key": "videos/550e8400-e29b-41d4-a716-446655440000/1716422400-video.mp4",
  "bucket_name": "videos",
  "expiry_hours": 24
}
```

## Verification Checklist

- [x] MinIO dependency added to build.gradle
- [x] MinIO configuration class created
- [x] Video and MediaAsset entities created
- [x] video and media_assets tables defined
- [x] Repositories created for new entities
- [x] MinioService with presigned URL generation
- [x] UploadInitiationService orchestrating the flow
- [x] New DTOs for request/response
- [x] /upload/initiate endpoint implemented
- [x] Frontend services updated
- [x] Upload.jsx refactored to use presigned URLs
- [x] Documentation updated

## Troubleshooting

### MinIO Not Found Error
**Problem**: IDE shows "Cannot resolve symbol 'minio'"
**Solution**: 
1. Rebuild project: `./gradlew clean build`
2. Invalidate IDE cache and restart

### Upload Returns 403
**Problem**: Upload to MinIO presigned URL fails with 403
**Solution**:
1. Verify MinIO credentials match application.yml
2. Check MinIO bucket exists and is accessible
3. Ensure presigned URL not expired

### CORS Issues
**Problem**: Browser blocks upload to MinIO
**Solution**:
1. Configure MinIO bucket CORS policy
2. Ensure frontend domain is allowed in CORS headers

### Presigned URL Expired
**Problem**: Upload fails because URL expired
**Solution**: Increase `default-expiry-hours` in application.yml or implement refresh mechanism

## Next Steps

1. **Webhook Notification**: Implement callback when file successfully uploads to MinIO
2. **Progress Tracking**: Add real-time upload progress updates
3. **Transcoding Integration**: Auto-trigger transcoding after upload completion
4. **Resumable Uploads**: Support multipart uploads for large files
5. **Error Recovery**: Implement retry logic for failed uploads
6. **Analytics**: Track upload success/failure rates

## Support & Debugging

### View Upload Logs
```bash
tail -f logs/upload-service.log
```

### View Frontend Logs
```
Browser Console (F12) → Console tab
```

### Check MinIO Console
```
http://localhost:9001
Username: minioadmin
Password: minioadmin
```

### Test Presigned URL
```bash
curl -v -X PUT \
  "http://localhost:9000/videos/test-video/timestamp-file.mp4?..." \
  --data-binary @file.mp4 \
  -H "Content-Type: video/mp4"
```


