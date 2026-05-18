package com.videostreaming.streaming.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadFileDto {
    private String id;
    private String originalFileName;
    private String storagePath;
    private String contentType;
    private Long size;
    private String videoId;
}

