package com.videostreaming.upload.controller;

import com.videostreaming.upload.dto.UploadResponseDto;
import com.videostreaming.upload.model.UploadFile;
import com.videostreaming.upload.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@Validated
public class UploadController {

    private final FileStorageService storageService;

    public UploadController(FileStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponseDto> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "videoId", required = false) String videoId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        java.util.UUID videoUuid = null;
        if (videoId != null && !videoId.isBlank()) {
            try {
                videoUuid = java.util.UUID.fromString(videoId);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build();
            }
        }

        UploadFile saved = storageService.store(file, userId, videoUuid);

        UploadResponseDto.UploadResponseDtoBuilder dtoBuilder = UploadResponseDto.builder()
                .fileId(saved.getId())
                .fileName(saved.getOriginalFileName())
                .storagePath(saved.getStoragePath())
                .size(saved.getSize())
                .contentType(saved.getContentType());

        if (saved.getVideoId() != null) {
            dtoBuilder.videoId(saved.getVideoId().toString());
        }

        UploadResponseDto dto = dtoBuilder.build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<UploadResponseDto>> getAll() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<UploadResponseDto> getFileByVideoId(@PathVariable String videoId) {
        try {
            UUID videoUuid = UUID.fromString(videoId);
            UploadFile file = storageService.findByVideoId(videoUuid);

            if (file == null) {
                return ResponseEntity.notFound().build();
            }

            UploadResponseDto.UploadResponseDtoBuilder dtoBuilder = UploadResponseDto.builder()
                    .fileId(file.getId())
                    .fileName(file.getOriginalFileName())
                    .storagePath(file.getStoragePath())
                    .size(file.getSize())
                    .contentType(file.getContentType());

            if (file.getVideoId() != null) {
                dtoBuilder.videoId(file.getVideoId().toString());
            }

            return ResponseEntity.ok(dtoBuilder.build());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}

