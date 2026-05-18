package com.videostreaming.streaming.client;

import com.videostreaming.streaming.dto.UploadFileDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class UploadServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${upload-service.url:http://localhost:8085}")
    private String uploadServiceUrl;
    
    /**
     * Fetch file metadata by videoId from upload service
     */
    public UploadFileDto getFileByVideoId(String videoId) {
        String url = uploadServiceUrl + "/upload/video/" + videoId;
        try {
            log.debug("Calling upload service: {}", url);
            return restTemplate.getForObject(url, UploadFileDto.class);
        } catch (Exception e) {
            log.error("Error calling upload service for videoId: {}", videoId, e);
            throw new RuntimeException("Failed to fetch file from upload service", e);
        }
    }
}


