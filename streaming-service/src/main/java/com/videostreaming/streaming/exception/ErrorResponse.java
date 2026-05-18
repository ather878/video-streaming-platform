package com.videostreaming.streaming.exception;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int status;
    private String message;
    @Builder.Default
    private long timestamp = System.currentTimeMillis();
}


