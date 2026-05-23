package com.videostreaming.upload.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreamResponse {

    @JsonProperty("presigned_url")
    private String presignedUrl;

}
