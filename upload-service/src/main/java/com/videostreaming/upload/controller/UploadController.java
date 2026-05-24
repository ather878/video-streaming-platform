package com.videostreaming.upload.controller;

import com.videostreaming.upload.dto.InitiateUploadRequest;
import com.videostreaming.upload.dto.InitiateUploadResponse;
import com.videostreaming.upload.dto.StreamResponse;
import com.videostreaming.upload.service.ThumbnailService;
import com.videostreaming.upload.service.UploadInitiationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@Validated
public class UploadController {

    private final UploadInitiationService uploadInitiationService;
    private final ThumbnailService thumbnailService;

    public UploadController(UploadInitiationService uploadInitiationService, ThumbnailService thumbnailService) {
        this.uploadInitiationService = uploadInitiationService;
        this.thumbnailService = thumbnailService;
    }

    /**
     * Initiate a video upload - returns presigned URL for direct MinIO upload
     */
    @PostMapping("/initiate")
    public ResponseEntity<InitiateUploadResponse> initiateUpload(
            @RequestBody InitiateUploadRequest request
    ) {
        try {
            InitiateUploadResponse response = uploadInitiationService.initiateUpload(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{videoId}/stream-url")
    public ResponseEntity<StreamResponse> streamVideo(@PathVariable UUID videoId) {
        try {
            StreamResponse response = uploadInitiationService.getStreamUrl(videoId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{videoId}/thumbnail")
    public ResponseEntity<Void> updateThumbnail(@PathVariable UUID videoId)
    {
        try {
            thumbnailService.generateThumbnail(videoId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

