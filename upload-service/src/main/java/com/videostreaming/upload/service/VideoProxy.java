package com.videostreaming.upload.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class VideoProxy
{
    private final RestTemplate restTemplate;

    public VideoProxy(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void updateVideoThumbnail(UUID videoId, String presignedUrl)
    {
        String url = "http://localhost:8080/api/videos/update-thumbnail";

        // Build request body
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("videoId", videoId.toString());
        requestBody.put("presignedUrl", presignedUrl);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    new HttpEntity<>(requestBody),
                    Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Video service returned: " + response.getStatusCode());
            }

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new RuntimeException("Failed to update thumbnail for video: " + videoId + " - " + e.getMessage());
        }

    }
}
