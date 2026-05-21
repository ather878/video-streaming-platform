package com.videostreaming.upload.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InitiateUploadRequest {

    @JsonProperty("videoId")
    private UUID videoId;

    @JsonProperty("fileName")
    private String fileName;

    @JsonProperty("contentType")
    private String contentType;
}

