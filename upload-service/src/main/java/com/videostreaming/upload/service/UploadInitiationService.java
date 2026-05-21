package com.videostreaming.upload.service;

import com.videostreaming.upload.dto.InitiateUploadRequest;
import com.videostreaming.upload.dto.InitiateUploadResponse;
import com.videostreaming.upload.model.MediaAsset;
import com.videostreaming.upload.repository.MediaAssetRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
public class UploadInitiationService {

    private final MediaAssetRepository mediaAssetRepository;
    private final MinioService minioService;

    public UploadInitiationService(
            MediaAssetRepository mediaAssetRepository,
            MinioService minioService
    ) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.minioService = minioService;
    }

    /**
     * Initiate a video upload process
     * Creates a video record and media asset, generates presigned URL
     */
    @Transactional
    public InitiateUploadResponse initiateUpload(InitiateUploadRequest request) {
        try {

            // Generate object key
            String objectKey = minioService.generateObjectKey(request.getVideoId(), request.getFileName());

            // Create media asset record
            MediaAsset mediaAsset = MediaAsset.builder()
                    .videoId(request.getVideoId())
                    .assetType(MediaAsset.AssetType.ORIGINAL)
                    .objectKey(objectKey)
                    .bucketName(minioService.getBucketName())
                    .contentType(request.getContentType())
                    .uploadStatus(MediaAsset.UploadStatus.INITIATED)
                    .build();
            
            mediaAssetRepository.save(mediaAsset);
            log.info("Created media asset for video: {}", request.getVideoId());

            // Generate presigned URL
            String presignedUrl = minioService.generatePresignedUploadUrl(
                    request.getVideoId(),
                    request.getFileName(),
                    request.getContentType()
            );

            return InitiateUploadResponse.builder()
                    .videoId(request.getVideoId())
                    .presignedUrl(presignedUrl)
                    .objectKey(objectKey)
                    .build();

        } catch (Exception e) {
            log.error("Failed to initiate upload", e);
            throw new RuntimeException("Failed to initiate upload", e);
        }
    }
}

