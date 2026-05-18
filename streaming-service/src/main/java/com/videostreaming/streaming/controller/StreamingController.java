package com.videostreaming.streaming.controller;

import com.videostreaming.streaming.service.StreamingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stream")
@RequiredArgsConstructor
@Slf4j
public class StreamingController {

    private final StreamingService streamingService;

    /**
     * Stream video with support for HTTP 206 Partial Content (Range Requests)
     * 
     * GET /stream/{videoId}
     * 
     * Response:
     * - 200 OK: Full video content
     * - 206 Partial Content: Partial video content (when Range header is provided)
     * - 404 Not Found: Video not found
     * - 500 Internal Server Error: Server error
     * 
     * Headers:
     * - Accept-Ranges: bytes (indicates that range requests are supported)
     * - Content-Type: video/mp4 (or appropriate video type)
     * - Content-Length: size of the content
     * - Content-Range: bytes start-end/total (only for 206 responses)
     * 
     * Example:
     * GET /stream/abc123
     * Range: bytes=0-1024
     * 
     * Response:
     * HTTP/1.1 206 Partial Content
     * Content-Type: video/mp4
     * Content-Length: 1025
     * Content-Range: bytes 0-1024/104857600
     * Accept-Ranges: bytes
     */
    @GetMapping("/{videoId}")
    public ResponseEntity<?> streamVideo(
            @PathVariable String videoId,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        
        log.info("Stream request for videoId: {} with Range header: {}", videoId, rangeHeader);
        
        return streamingService.streamVideo(videoId, rangeHeader);
    }
}

