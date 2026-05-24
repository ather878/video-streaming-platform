package com.videostreaming.upload.service;

import com.videostreaming.upload.config.MinioConfig;
import io.minio.MinioClient;
import io.minio.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    public MinioService(MinioClient minioClient, MinioConfig minioConfig) {
        this.minioClient = minioClient;
        this.minioConfig = minioConfig;
    }

    /**
     * Generate a presigned URL for uploading to MinIO
     */
    public String generatePresignedUploadUrl(UUID videoId, String fileName, String contentType) {
        try {
            String objectName = generateObjectKey(videoId, fileName);

            String presignedUrl = minioClient.getPresignedObjectUrl(
                    io.minio.GetPresignedObjectUrlArgs.builder()
                            .method(io.minio.http.Method.PUT)
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .expiry(minioConfig.getDefaultExpiryHours(), TimeUnit.HOURS)
                           .build()
            );

            log.info("Generated presigned URL for video: {}, file: {}", videoId, fileName);
            return presignedUrl;
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for video: {}", videoId, e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    public String generatePresignedStreamUrl(String objectKey) {
        try {

            String presignedUrl = minioClient.getPresignedObjectUrl(
                    io.minio.GetPresignedObjectUrlArgs.builder()
                            .method(io.minio.http.Method.GET)
                            .bucket(minioConfig.getBucketName())
                            .object(objectKey)
                            .expiry(1, TimeUnit.HOURS)
                            .build()
            );

            log.info("Generated presigned URL for object: {}", objectKey);
            return presignedUrl;
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for object: {}", objectKey, e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    /**
     * Generate a presigned URL for downloading/reading from MinIO
     */
    public String generatePresignedDownloadUrl(String objectKey) {
        try {
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    io.minio.GetPresignedObjectUrlArgs.builder()
                            .method(io.minio.http.Method.GET)
                            .bucket(minioConfig.getBucketName())
                            .object(objectKey)
                            .expiry(minioConfig.getDefaultExpiryHours(), TimeUnit.HOURS)
                            .build()
            );

            log.info("Generated presigned download URL for object: {}", objectKey);
            return presignedUrl;
        } catch (Exception e) {
            log.error("Failed to generate presigned download URL for object: {}", objectKey, e);
            throw new RuntimeException("Failed to generate presigned download URL", e);
        }
    }

    public void uploadObject(String thumbnailObjectName, String thumbnailPath) throws IOException, ServerException,
            InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException,
            InvalidResponseException, XmlParserException, InternalException
    {
        minioClient.uploadObject(
                io.minio.UploadObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(thumbnailObjectName)
                        .filename(thumbnailPath)
                        .contentType("image/jpeg")
                        .build()
        );
    }

    /**
     * Generate object key for storage in MinIO
     */
    public String generateObjectKey(UUID videoId, String fileName) {
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
        return String.format("videos/%s/%s-%s", videoId, timestamp, sanitizeFileName(fileName));
    }

    /**
     * Sanitize file name to prevent directory traversal
     */
    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public String getBucketName() {
        return minioConfig.getBucketName();
    }
}



