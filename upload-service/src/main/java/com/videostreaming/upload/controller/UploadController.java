package com.videostreaming.upload.controller;

import com.videostreaming.upload.dto.InitiateUploadRequest;
import com.videostreaming.upload.dto.InitiateUploadResponse;
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

    public UploadController(UploadInitiationService uploadInitiationService) {
        this.uploadInitiationService = uploadInitiationService;
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
}

