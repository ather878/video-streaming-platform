# MinIO-Based Upload Workflow Documentation

## Overview

The video streaming platform now uses MinIO (S3-compatible object storage) for handling video uploads. The new workflow enables secure, direct uploads from the frontend to MinIO using presigned URLs, without the need to route large video files through the backend API.

## Architecture

### Upload Flow

```
Frontend
   ↓ (1. POST /upload/initiate)
Upload Service
   ├─ Creates Video record (status: INITIATED)
   ├─ Creates MediaAsset record (assetType: ORIGINAL)
   └─ Returns presigned URL
   ↑ (2. Returns presigned URL + videoId)
Frontend
   ├─ Displays upload progress
   └─ PUT file directly to MinIO using presigned URL
   ↓ (3. File uploaded to MinIO)
MinIO Object Storage
   └─ Stores file at videos/{videoId}/{timestamp}-{filename}
   ↑ (4. Upload complete)
Frontend
   └─ Navigate to video detail page
```

### Data Models

#### Video Entity (upload-service)
- `id` (UUID): Unique video identifier
- `title` (String): Video title
- `description` (String): Video description
- `uploaderId` (UUID): ID of the user uploading the video
- `status` (Enum): INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED
- `visibility` (Enum): PUBLIC, PRIVATE, UNLISTED
- `durationSeconds` (Long): Video duration in seconds
- `thumbnailUrl` (String): URL to thumbnail
- `createdAt` (Timestamp): Creation timestamp
- `updatedAt` (Timestamp): Last update timestamp

#### MediaAsset Entity (upload-service)
- `id` (UUID): Unique asset identifier
- `videoId` (UUID): Associated video ID
- `assetType` (Enum): ORIGINAL, HLS_MASTER, HLS_1080P, HLS_720P, HLS_480P, THUMBNAIL, SUBTITLE, PREVIEW
- `objectKey` (String): MinIO object key (e.g., "videos/videoId/timestamp-filename.mp4")
- `bucketName` (String): MinIO bucket name
- `contentType` (String): MIME type of the asset
- `fileSize` (Long): File size in bytes
- `uploadStatus` (Enum): INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED
- `createdAt` (Timestamp): Creation timestamp

## API Endpoints

### Upload Service - POST /upload/initiate

**Purpose**: Initiate a video upload and get a presigned URL

**Request**:
```json
{
  "title": "My Video Title",
  "description": "Video description",
  "visibility": "PUBLIC",
  "file_name": "video.mp4",
  "file_size": 1024000000,
  "content_type": "video/mp4"
}
```

**Headers**:
- `X-User-Id`: UUID of the user uploading (extracted from JWT token)

**Response** (201 Created):
```json
{
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "presigned_url": "http://localhost:9000/videos/550e8400-e29b-41d4-a716-446655440000/1716422400-video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "object_key": "videos/550e8400-e29b-41d4-a716-446655440000/1716422400-video.mp4",
  "bucket_name": "videos",
  "expiry_hours": 24
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid X-User-Id header
- `500 Internal Server Error`: Failed to generate presigned URL

## Frontend Integration

### Upload Flow (React)

1. **Collect Video Metadata**
   - Title, description, visibility settings

2. **Select Video File**
   - Validate file type (must be video/*)
   - Display file size to user

3. **Call /upload/initiate**
   ```javascript
   const response = await uploadAPI.initiateUpload({
     title,
     description,
     visibility,
     file_name: file.name,
     file_size: file.size,
     content_type: file.type
   });
   ```

4. **Upload to MinIO**
   ```javascript
   const uploadResponse = await fetch(presignedUrl, {
     method: 'PUT',
     body: file,
     headers: {
       'Content-Type': file.type
     }
   });
   ```

5. **Navigate to Video Detail**
   - User is redirected to `/videos/{videoId}` after successful upload

### Configuration

Set these environment variables in `.env` or `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STREAM_BASE_URL=http://localhost:8086/stream
```

## MinIO Configuration

### Environment Setup

Add MinIO configuration to `upload-service/src/main/resources/application.yml`:

```yaml
minio:
  url: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
  bucket-name: videos
  default-expiry-hours: 24
```

### MinIO Initialization

1. **Start MinIO**:
   ```bash
   docker run -d \
     -e MINIO_ROOT_USER=minioadmin \
     -e MINIO_ROOT_PASSWORD=minioadmin \
     -p 9000:9000 \
     -p 9001:9001 \
     minio/minio
   ```

2. **Create Bucket**:
   ```bash
   mc mb minio/videos
   ```

3. **Set Bucket Policy** (if needed for public access):
   ```bash
   mc policy set public minio/videos
   ```

## Updated Services

### 1. Upload Service

**New Classes**:
- `Video` (Entity): Represents a video being uploaded
- `MediaAsset` (Entity): Represents an asset associated with a video
- `MinioService` (Service): Handles presigned URL generation and MinIO interactions
- `UploadInitiationService` (Service): Orchestrates the upload initiation process
- `InitiateUploadRequest` (DTO): Request DTO for upload initiation
- `InitiateUploadResponse` (DTO): Response DTO containing presigned URL
- `VideoRepository` (Repository): JPA repository for Video entity
- `MediaAssetRepository` (Repository): JPA repository for MediaAsset entity

**Updated Controller**:
- `UploadController.initiateUpload()`: New endpoint for presigned URL generation

### 2. Video Service

**Updated Entity**:
- `Video`: Added `status` field with new enum values (INITIATED, UPLOADING, UPLOADED, PROCESSING, READY, FAILED)

### 3. Frontend Web

**Updated Services**:
- `uploadAPI.initiateUpload()`: New method to call /upload/initiate endpoint
- `uploadAPI.uploadToMinIO()`: New method to upload file directly to MinIO

**Updated Pages**:
- `Upload.jsx`: Refactored to use presigned URL workflow

## Database Schema Changes

### Videos Table
```sql
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
```

### Media Assets Table
```sql
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

## Security Considerations

1. **Presigned URLs**
   - URLs are time-limited (24 hours by default)
   - URLs are specific to the user performing the upload
   - Each upload gets a unique presigned URL
   - URLs cannot be reused after expiration

2. **User Authentication**
   - `X-User-Id` header is required for all upload initiation requests
   - This should be extracted from JWT tokens in the API gateway / auth middleware

3. **File Validation**
   - Frontend validates file type (must be video/*)
   - Backend can add additional validation (file size limits, virus scanning, etc.)

4. **CORS**
   - MinIO must be configured to allow cross-origin requests from the frontend domain
   - Presigned URLs work across origins due to S3 signature mechanism

## Testing

### Manual Testing

1. **Start all services**:
   ```bash
   ./scripts/start-all.sh
   ```

2. **Access the upload page**:
   - Navigate to http://localhost:5173/upload

3. **Initiate an upload**:
   - Fill in video details (title, description, visibility)
   - Select a video file
   - Click "Publish Video"

4. **Monitor upload progress**:
   - Watch the step indicators (Initiating upload → Uploading to storage)
   - Check MinIO console at http://localhost:9001 to verify file is uploaded

5. **Verify results**:
   - Check upload-service logs for presigned URL generation
   - Verify VideoRepository contains new Video record
   - Verify MediaAssetRepository contains new MediaAsset record
   - Check that file appears in MinIO bucket

### cURL Testing

**Initiate upload**:
```bash
curl -X POST http://localhost:8084/upload/initiate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "title": "Test Video",
    "description": "Test video description",
    "visibility": "PUBLIC",
    "file_name": "test.mp4",
    "file_size": 1024000000,
    "content_type": "video/mp4"
  }'
```

**Upload to presigned URL**:
```bash
PRESIGNED_URL="<url from response>"
curl -X PUT "$PRESIGNED_URL" \
  --data-binary @test.mp4 \
  -H "Content-Type: video/mp4"
```

## Troubleshooting

### Issue: "Failed to generate presigned URL"
- **Cause**: MinIO service not running or misconfigured
- **Solution**: Check MinIO connection and credentials in application.yml

### Issue: Upload fails with 403 Forbidden
- **Cause**: Access key or secret key is incorrect
- **Solution**: Verify MinIO credentials match those in application.yml

### Issue: Presigned URL expires before upload completes
- **Cause**: Large file taking longer than 24 hours to upload
- **Solution**: Increase `default-expiry-hours` in application.yml or implement resumable uploads

### Issue: CORS errors when uploading
- **Cause**: MinIO not configured for cross-origin requests
- **Solution**: Configure MinIO bucket CORS policy

## Future Enhancements

1. **Resumable Uploads**: Implement multipart uploads for large files
2. **Upload Progress**: Track upload progress on backend and notify frontend
3. **Transcoding Integration**: Automatically trigger transcoding after upload completion
4. **Thumbnail Generation**: Generate thumbnails during upload
5. **Virus Scanning**: Integrate with antivirus scanning before processing
6. **CDN Integration**: Sync uploaded files to CDN for faster streaming


