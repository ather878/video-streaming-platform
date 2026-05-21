package com.videostreaming.upload.config;

import io.minio.MinioClient;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "minio")
@Getter
public class MinioConfig {

    private String url;
    private String accessKey;
    private String secretKey;
    private String bucketName;
    private int defaultExpiryHours = 24;

    public void setUrl(String url) {
        this.url = url;
    }

    public void setAccessKey(String accessKey) {
        this.accessKey = accessKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public void setBucketName(String bucketName) {
        this.bucketName = bucketName;
    }

    public void setDefaultExpiryHours(int defaultExpiryHours) {
        this.defaultExpiryHours = defaultExpiryHours;
    }

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }
}

