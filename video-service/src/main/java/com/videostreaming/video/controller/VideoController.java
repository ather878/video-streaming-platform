package com.videostreaming.video.controller;

import com.videostreaming.video.dto.VideoDto;
import com.videostreaming.video.security.JwtUtil;
import com.videostreaming.video.service.VideoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/videos")
public class VideoController {

    private final VideoService videoService;
    private final JwtUtil jwtUtil;

    public VideoController(VideoService videoService, JwtUtil jwtUtil) {
        this.videoService = videoService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Extract user ID from JWT token (Authorization header)
     */
    private Long getUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Invalid token");
        }
        String username = jwtUtil.getUsernameFromToken(token);
        // For now, use username hash as userId. In production, call auth-service to get userId
        return (long) username.hashCode();
    }

    /**
     * CREATE: POST /videos
     * Create a new video
     */
    @PostMapping
    public ResponseEntity<VideoDto.VideoResponse> createVideo(
            @RequestBody VideoDto.CreateRequest req,
            HttpServletRequest request) {
        Long uploaderId = getUserIdFromToken(request);
        VideoDto.VideoResponse response = videoService.createVideo(uploaderId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * READ: GET /videos/{id}
     * Get a specific video by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VideoDto.VideoResponse> getVideo(@PathVariable java.util.UUID id) {
        VideoDto.VideoResponse response = videoService.getVideoById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * READ: GET /videos
     * List videos with pagination
     * Query params: page, size, sortBy
     */
    @GetMapping
    public ResponseEntity<Page<VideoDto.VideoResponse>> listVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Page<VideoDto.VideoResponse> videos = videoService.getAllVideos(page, size, sortBy);
        return ResponseEntity.ok(videos);
    }

    /**
     * UPDATE: PUT /videos/{id}
     * Update video (only uploader can update)
     */
    @PutMapping("/{id}")
    public ResponseEntity<VideoDto.VideoResponse> updateVideo(
            @PathVariable java.util.UUID id,
            @RequestBody VideoDto.UpdateRequest req,
            HttpServletRequest request) {
        Long uploaderId = getUserIdFromToken(request);
        VideoDto.VideoResponse response = videoService.updateVideo(id, uploaderId, req);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE: DELETE /videos/{id}
     * Delete video (only uploader can delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVideo(
            @PathVariable java.util.UUID id,
            HttpServletRequest request) {
        Long uploaderId = getUserIdFromToken(request);
        videoService.deleteVideo(id, uploaderId);
        return ResponseEntity.ok("Video deleted successfully");
    }

    /**
     * ATTACH UPLOAD: POST /videos/{id}/attach-upload
     * Called by upload-service when physical file is stored. Body: { "uploadId": "uuid" }
     */
    @PostMapping("/{id}/attach-upload")
    public ResponseEntity<VideoDto.VideoResponse> attachUpload(
            @PathVariable java.util.UUID id,
            @RequestBody VideoDto.AttachRequest attachRequest
    ) {
        VideoDto.VideoResponse response = videoService.attachUploadToVideo(id, attachRequest.getUploadId());
        return ResponseEntity.ok(response);
    }
}


