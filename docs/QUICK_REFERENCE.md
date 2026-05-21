# Quick Reference - MinIO Upload Workflow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Upload.jsx                                               │   │
│  │ - Collects video metadata (title, description, etc.)     │   │
│  │ - Selects video file                                     │   │
│  │ - Shows upload progress                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────────┘
                     │
                     │ 1. POST /api/upload/initiate
                     │    {title, description, file_name, etc.}
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                Upload Service (Spring Boot)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ UploadController.initiateUpload()                         │   │
│  │ → UploadInitiationService.initiateUpload()               │   │
│  │   ├─ Create Video record (status: INITIATED)             │   │
│  │   ├─ Create MediaAsset record (status: INITIATED)        │   │
│  │   └─ MinioService.generatePresignedUploadUrl()           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Database (PostgreSQL)                                          │
│  ├─ videos (id, title, description, status, ...)               │
│  └─ media_assets (id, video_id, object_key, status, ...)       │
└────────────────────┬──────────────────────────────────────────────┘
                     │
                     │ 2. Returns: {video_id, presigned_url}
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Upload.jsx receives presigned URL                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────────┘
                     │
                     │ 3. PUT file directly using presigned URL
                     │    (bypasses API gateway!)
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MinIO Object Storage                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Bucket: videos                                           │   │
│  │ Object: videos/{videoId}/{timestamp}-{filename}         │   │
│  │ Status: Successfully stored                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                     │
                     │ 4. Upload complete
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Navigate to /videos/{video_id}                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

1. **User Action**: Fills form with video metadata and selects file
2. **Request 1**: POST to `/api/upload/initiate` with metadata
3. **Backend Processing**:
   - Validates user (X-User-Id header)
   - Creates Video record in DB
   - Creates MediaAsset record in DB
   - Generates presigned URL from MinIO
4. **Response 1**: Returns video_id and presigned_url
5. **User Action**: Upload begins (browser shows progress)
6. **Request 2**: PUT file directly to MinIO using presigned URL
   - Bypasses API gateway
   - Direct connection to MinIO
   - Uses S3-like PUT request
7. **MinIO Processing**: Stores file at `videos/{videoId}/{timestamp}-{filename}`
8. **Response 2**: 200 OK from MinIO
9. **Frontend Navigation**: Redirects to `/videos/{videoId}`

## Key Components

### Backend

| Component | File | Purpose |
|-----------|------|---------|
| Entity | `Video.java` | Represents video metadata |
| Entity | `MediaAsset.java` | Represents stored asset |
| Repository | `VideoRepository.java` | Database access for Video |
| Repository | `MediaAssetRepository.java` | Database access for MediaAsset |
| Service | `MinioService.java` | MinIO operations |
| Service | `UploadInitiationService.java` | Orchestrates upload flow |
| Config | `MinioConfig.java` | MinIO Spring configuration |
| Controller | `UploadController.initiateUpload()` | HTTP endpoint |
| DTO | `InitiateUploadRequest.java` | Request object |
| DTO | `InitiateUploadResponse.java` | Response object |

### Frontend

| Component | File | Purpose |
|-----------|------|---------|
| Service | `uploadAPI.initiateUpload()` | Calls /upload/initiate |
| Service | `uploadAPI.uploadToMinIO()` | Uploads to presigned URL |
| Page | `Upload.jsx` | Upload UI and flow logic |

## Database Tables

### videos
```sql
id (UUID, PK)
title (VARCHAR)
description (TEXT)
uploader_id (UUID, FK)
visibility (VARCHAR: PUBLIC, PRIVATE, UNLISTED)
status (VARCHAR: INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED)
duration_seconds (BIGINT)
thumbnail_url (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### media_assets
```sql
id (UUID, PK)
video_id (UUID, FK)
asset_type (VARCHAR: ORIGINAL, HLS_MASTER, HLS_1080P, HLS_720P, HLS_480P, THUMBNAIL, SUBTITLE, PREVIEW)
object_key (TEXT)
bucket_name (VARCHAR)
content_type (VARCHAR)
file_size (BIGINT)
upload_status (VARCHAR: INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED)
created_at (TIMESTAMP)
```

## Configuration

### application.yml (upload-service)
```yaml
minio:
  url: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
  bucket-name: videos
  default-expiry-hours: 24
```

### .env (frontend)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STREAM_BASE_URL=http://localhost:8086/stream
```

## API Specification

### POST /upload/initiate

**Description**: Initialize video upload and get presigned URL

**Request Header**:
```
X-User-Id: <uuid>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "visibility": "PUBLIC | PRIVATE | UNLISTED",
  "file_name": "string (required)",
  "file_size": "long (optional)",
  "content_type": "string (optional, e.g. video/mp4)"
}
```

**Success Response (201 Created)**:
```json
{
  "video_id": "uuid",
  "presigned_url": "string (S3-formatted URL to PUT to)",
  "object_key": "string (path in bucket)",
  "bucket_name": "string",
  "expiry_hours": "integer"
}
```

**Error Responses**:
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing X-User-Id)
- 500: Internal Server Error (MinIO connection failed)

## Upload URL Format

MinIO presigned URLs follow AWS S3 format:
```
http://localhost:9000/videos/550e8400.../1716422400-video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=...&X-Amz-SignedHeaders=...&X-Amz-Signature=...
```

These URLs are:
- Time-limited (24 hours by default)
- S3-compatible (works with any S3-compatible client)
- Instance-specific (generated for current session only)

## Status Values

### Video Status
- **INITIATED**: Upload process started
- **UPLOADING**: File currently being uploaded
- **UPLOADED**: File successfully uploaded to storage
- **PROCESSING**: Processing (transcoding, etc.)
- **READY**: Ready for playback
- **FAILED**: Upload or processing failed

### MediaAsset Status
- Same as Video status, tracks individual asset state

### Asset Types
- **ORIGINAL**: Original uploaded video file
- **HLS_MASTER**: HLS master playlist
- **HLS_1080P**: HLS stream 1080p
- **HLS_720P**: HLS stream 720p
- **HLS_480P**: HLS stream 480p
- **THUMBNAIL**: Video thumbnail image
- **SUBTITLE**: Subtitle file
- **PREVIEW**: Preview thumbnail

## Development Workflow

```bash
# 1. Start infrastructure
chmod +x scripts/*.sh
./scripts/start-all.sh

# 2. Create MinIO bucket (if needed)
# Visit http://localhost:9001
# Login: minioadmin / minioadmin

# 3. Frontend development
cd frontend-web
npm install
npm run dev

# 4. Test upload
# Navigate to http://localhost:5173/upload
# Fill form and upload video

# 5. Monitor logs
./scripts/tail-logs.sh

# 6. Stop all services
./scripts/stop-all.sh
```

## Troubleshooting Checklist

- [ ] MinIO service running (docker ps)
- [ ] PostgreSQL database running
- [ ] Upload service running on :8084
- [ ] Frontend running on :5173
- [ ] X-User-Id header being sent
- [ ] MinIO 'videos' bucket exists
- [ ] MinIO credentials match application.yml
- [ ] Presigned URL not expired (24h default)
- [ ] File size < MinIO quota (usually unlimited)
- [ ] CORS policy configured if cross-domain

## Example cURL Commands

### Get Presigned URL
```bash
curl -X POST http://localhost:8084/upload/initiate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "title": "My Video",
    "description": "Test upload",
    "visibility": "PUBLIC",
    "file_name": "test.mp4",
    "file_size": 1024000000,
    "content_type": "video/mp4"
  }' | jq '.presigned_url'
```

### Upload Using Presigned URL
```bash
PRESIGNED_URL="<from above>"
curl -X PUT "$PRESIGNED_URL" \
  --data-binary @test.mp4 \
  -H "Content-Type: video/mp4" \
  -v
```

## Performance Considerations

- **Large Files**: Direct upload to MinIO avoids API gateway bottleneck
- **Bandwidth**: Upload speed depends on client connection
- **Storage**: MinIO can be scaled horizontally
- **Concurrency**: Multiple uploads can happen simultaneously

## Security Notes

- Presigned URLs are time-limited (default 24 hours)
- URLs include cryptographic signature
- Each URL is unique to the requestor
- URLs cannot be reused after expiration
- File content is validated on upload
- User authentication via X-User-Id header


