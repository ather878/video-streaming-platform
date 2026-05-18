package com.videostreaming.upload.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UploadResponseDto {
    private UUID fileId;
    private String fileName;
    private String storagePath;
    private Long size;
    private String contentType;
    private String videoId;
}

