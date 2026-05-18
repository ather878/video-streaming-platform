package com.videostreaming.streaming.service;

import com.videostreaming.streaming.client.UploadServiceClient;
import com.videostreaming.streaming.dto.UploadFileDto;
import com.videostreaming.streaming.exception.VideoNotFoundException;
import com.videostreaming.streaming.util.RangeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreamingService {

    private final UploadServiceClient uploadServiceClient;

    /**
     * Stream video with support for HTTP 206 Partial Content (Range Requests)
     */
    public ResponseEntity<?> streamVideo(String videoId, String rangeHeader) {
        try {
            // 1. Call upload-service to get the file metadata and storage path
            UploadFileDto fileDto = uploadServiceClient.getFileByVideoId(videoId);
            
            if (fileDto == null) {
                throw new VideoNotFoundException("Video not found: " + videoId);
            }

            String storagePath = fileDto.getStoragePath();
            Long fileSize = fileDto.getSize();
            String contentType = fileDto.getContentType();

            log.info("Streaming video: {} from path: {}", videoId, storagePath);

            // 2. Create file resource
            File file = new File(storagePath);
            if (!file.exists() || !file.isFile()) {
                throw new VideoNotFoundException("File not found at path: " + storagePath);
            }

            // 3. Handle Range requests for partial content
            if (rangeHeader != null && !rangeHeader.isEmpty()) {
                return handleRangeRequest(file, fileSize, contentType, rangeHeader);
            }

            // 4. Full file streaming
            return handleFullFileStream(file, fileSize, contentType);

        } catch (VideoNotFoundException e) {
            log.error("Video not found: {}", videoId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error streaming video: {}", videoId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Handle full file streaming (200 OK)
     */
    private ResponseEntity<?> handleFullFileStream(File file, Long fileSize, String contentType) {
        
        Resource resource = new FileSystemResource(file);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_LENGTH, fileSize.toString())
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .body(resource);
    }

    /**
     * Handle Range requests (206 Partial Content)
     */
    private ResponseEntity<?> handleRangeRequest(File file, Long fileSize, String contentType, 
                                                  String rangeHeader) 
            throws IOException {
        
        log.debug("Processing range request: {}", rangeHeader);
        
        // Parse the range header
        RangeRequest range = RangeRequest.builder(fileSize)
                .withRange(rangeHeader)
                .build();

        // Create a file input stream with range support
        RangeInputStream inputStream = new RangeInputStream(new FileInputStream(file), range);
        InputStreamResource resource = new InputStreamResource(inputStream);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType(contentType));
        headers.setContentLength(range.getContentLength());
        headers.set(HttpHeaders.CONTENT_RANGE, range.getContentRangeHeader());
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.set(HttpHeaders.CACHE_CONTROL, "public, max-age=3600");

        return new ResponseEntity<>(inputStream, headers, HttpStatus.PARTIAL_CONTENT);
    }

    /**
     * Custom InputStream that provides only a specific range of the file
     */
    public static class RangeInputStream extends InputStream {
        private final FileInputStream delegate;
        private final RangeRequest range;
        private long position;

        public RangeInputStream(FileInputStream delegate, RangeRequest range) throws IOException {
            this.delegate = delegate;
            this.range = range;
            // Skip to the start of the range
            delegate.skip(range.getStart());
            this.position = 0;
        }

        @Override
        public int read() throws IOException {
            if (position >= range.getContentLength()) {
                return -1;
            }
            int byte_read = delegate.read();
            if (byte_read != -1) {
                position++;
            }
            return byte_read;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            if (position >= range.getContentLength()) {
                return -1;
            }

            long remaining = range.getContentLength() - position;
            int bytesToRead = (int) Math.min(len, remaining);
            
            int bytesRead = delegate.read(b, off, bytesToRead);
            if (bytesRead > 0) {
                position += bytesRead;
            }
            return bytesRead;
        }

        @Override
        public void close() throws IOException {
            delegate.close();
        }
    }
}




