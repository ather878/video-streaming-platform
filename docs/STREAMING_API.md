# Streaming Service API Documentation

## Overview
The Streaming Service provides HTTP video streaming with support for HTTP 206 Partial Content range requests. This allows browsers and video players to seek within video files, pause, resume, and download videos efficiently.

## Features
- **HTTP 206 Partial Content Support**: Full support for byte-range requests
- **Efficient Streaming**: Stream large video files without loading them completely into memory
- **Video Seeking**: Allow users to seek to any part of a video
- **Bandwidth Optimization**: Only transfer the requested range of bytes
- **Integration with Upload Service**: Automatically retrieves file paths from the upload service

## API Endpoints

### 1. Stream Video

#### Request
```
GET /stream/{videoId}
Range: bytes=start-end (optional)
```

#### Parameters
- `videoId` (path): UUID of the video to stream
- `Range` (header, optional): Byte range in format `bytes=start-end` or `bytes=start-` or `bytes=-end`

#### Examples

**Example 1: Full Video Stream (200 OK)**
```bash
curl -X GET http://localhost:8086/stream/abc123-def456
```

**Response Headers:**
```
HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Length: 104857600
Accept-Ranges: bytes
Cache-Control: public, max-age=3600
```

**Example 2: Partial Content - Specific Range (206 Partial Content)**
```bash
curl -X GET http://localhost:8086/stream/abc123-def456 \
  -H "Range: bytes=0-1024"
```

**Response Headers:**
```
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Length: 1025
Content-Range: bytes 0-1024/104857600
Accept-Ranges: bytes
Cache-Control: public, max-age=3600
```

**Example 3: Last 1MB (206 Partial Content)**
```bash
curl -X GET http://localhost:8086/stream/abc123-def456 \
  -H "Range: bytes=-1048576"
```

**Example 4: From Byte 10MB to End (206 Partial Content)**
```bash
curl -X GET http://localhost:8086/stream/abc123-def456 \
  -H "Range: bytes=10485760-"
```

#### Response Codes
- `200 OK`: Full file stream returned
- `206 Partial Content`: Partial file stream returned with Content-Range header
- `404 Not Found`: Video not found or file not found at storage path
- `500 Internal Server Error`: Server error occurred

## HTTP Headers

### Request Headers

#### Range Header
Specifies the byte range(s) to retrieve. Syntax:
- `bytes=start-end`: Stream from byte `start` to byte `end` (inclusive)
- `bytes=start-`: Stream from byte `start` to end of file
- `bytes=-suffix`: Stream the last `suffix` bytes

**Examples:**
- `Range: bytes=0-999`: First 1000 bytes
- `Range: bytes=1000-1999`: Bytes 1000-1999
- `Range: bytes=1000-`: From byte 1000 to end
- `Range: bytes=-1000`: Last 1000 bytes

### Response Headers

#### Accept-Ranges
Indicates that the server supports range requests. Always set to `bytes`.

#### Content-Range (206 responses only)
Specifies the byte range being returned and the total size.
Format: `bytes start-end/total`

**Example:**
- `Content-Range: bytes 0-1024/104857600` - Returning bytes 0-1024 of a 100MB file

#### Content-Length
The size of the response body in bytes. For range requests, this is the size of the range, not the entire file.

#### Cache-Control
Set to `public, max-age=3600` to allow caching for 1 hour.

#### Content-Type
The MIME type of the video (e.g., `video/mp4`, `video/webm`).

## Integration Flow

### Request Flow
1. Browser/Client requests video with optional `Range` header
2. Streaming Service receives request
3. Service calls Upload Service to get video metadata and storage path
4. Service reads video file from storage path
5. If `Range` header present, service returns 206 Partial Content with specified range
6. If no `Range` header, service returns 200 OK with full file
7. Response includes proper headers for streaming

### Upload Service Integration

The Streaming Service uses the Upload Service to:
1. Retrieve video file metadata given a videoId
2. Get the storage path for the video file
3. Get content type and file size information

**Upload Service Endpoint:**
```
GET /upload/video/{videoId}

Response:
{
  "fileId": "uuid",
  "fileName": "video.mp4",
  "storagePath": "/path/to/storage/file.mp4",
  "size": 104857600,
  "contentType": "video/mp4",
  "videoId": "abc123-def456"
}
```

## Browser Behavior

### Typical Browser Video Streaming
1. Browser loads video player with `<video>` tag
2. Player makes initial HEAD or GET request to determine video size
3. Player checks `Accept-Ranges` header to confirm range support
4. Player requests initial chunk (e.g., first 1MB) with Range header
5. Player streams content to user
6. If user seeks, player requests appropriate range
7. Player downloads only requested range, not entire file

### Example HTML5 Video Player
```html
<video width="320" height="240" controls>
  <source src="http://localhost:8086/stream/abc123-def456" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

## Use Cases

### 1. Large Video Files
- Video players can stream large files (GBs) without loading into memory
- Only the requested bytes are transferred

### 2. Video Seeking
- Users can seek to any position in the video
- Only the requested range is downloaded

### 3. Mobile Devices
- Users can pause and resume streams efficiently
- Bandwidth usage is optimized

### 4. Resume Failed Downloads
- If a download fails, client can resume from where it stopped

## Configuration

### application.yml
```yaml
upload-service:
  url: http://localhost:8085

logging:
  level:
    com.videostreaming.streaming: DEBUG
```

## Error Handling

The service provides meaningful error responses:

### 404 Not Found
```json
{
  "status": 404,
  "message": "Video not found: {videoId}",
  "timestamp": 1684092000000
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "An error occurred while processing your request",
  "timestamp": 1684092000000
}
```

## Performance Considerations

1. **Partial Content Optimization**: Only requested bytes are transferred, reducing bandwidth
2. **Efficient File Reading**: Uses FileInputStream with position seeking
3. **Memory Efficient**: Streams files without loading entire file into memory
4. **Caching**: Response includes Cache-Control headers allowing client-side caching

## Security Considerations

1. **File Path Validation**: Ensures files exist at storage path before streaming
2. **Content Type Verification**: Returns appropriate content type based on file
3. **Range Validation**: Validates and sanitizes range headers to prevent abuse
4. **Error Handling**: Avoids exposing sensitive information in error messages

## Testing

### Using curl
```bash
# Stream full video
curl -X GET http://localhost:8086/stream/abc123 -o video.mp4

# Stream specific range
curl -X GET http://localhost:8086/stream/abc123 \
  -H "Range: bytes=0-1048575" -o video_chunk.mp4

# Check available stream
curl -I http://localhost:8086/stream/abc123
```

### Using Python
```python
import requests

# Full file
response = requests.get('http://localhost:8086/stream/abc123')
with open('video.mp4', 'wb') as f:
    f.write(response.content)

# Range request
headers = {'Range': 'bytes=0-1048575'}
response = requests.get('http://localhost:8086/stream/abc123', headers=headers)
print(f"Status: {response.status_code}")
print(f"Content-Range: {response.headers.get('Content-Range')}")
```

## Troubleshooting

### Video Not Found
- Ensure videoId exists in the database
- Check that Upload Service is running and accessible
- Verify that the file exists at the storage path

### Partial Content Not Working
- Check that the browser/client is sending `Range` header with proper format
- Verify server is responding with `Accept-Ranges: bytes` header
- Check response status code (should be 206, not 200)

### Connection Timeout
- Increase timeout in configuration if needed
- Check network connectivity to Upload Service
- Verify file is not corrupted or too large

## Related Services

- **Upload Service**: Stores video files and maintains metadata
- **Video Service**: Manages video records and metadata
- **API Gateway**: Routes requests to appropriate services

