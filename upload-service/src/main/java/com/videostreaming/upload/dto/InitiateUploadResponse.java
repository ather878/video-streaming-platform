package com.videostreaming.upload.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InitiateUploadResponse {

    @JsonProperty("video_id")
    private UUID videoId;

    @JsonProperty("presigned_url")
    private String presignedUrl;

    @JsonProperty("object_key")
    private String objectKey;
}

