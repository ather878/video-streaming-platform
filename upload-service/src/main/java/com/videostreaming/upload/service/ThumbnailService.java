package com.videostreaming.upload.service;

import com.videostreaming.upload.model.MediaAsset;
import com.videostreaming.upload.repository.MediaAssetRepository;
import io.minio.errors.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.io.File;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Component
public class ThumbnailService
{
    @Autowired
    private MediaAssetRepository mediaAssetRepository;

    @Autowired
    private MinioService minioService;

    @Autowired
    private VideoProxy videoProxy;

    public void generateThumbnail(UUID videoId) throws IOException, InterruptedException {
        MediaAsset mediaAsset = mediaAssetRepository.findByVideoId(videoId).get(0);

        String presignedUrl = minioService.generatePresignedDownloadUrl(
                mediaAsset.getObjectKey()
        );

        UUID thumbnailId = UUID.randomUUID();
//        String thumbnailPath = System.getProperty("java.io.tmpdir")
//                + File.separator + thumbnailId + ".jpg";
        String thumbnailPath = thumbnailId + ".jpg";

        // TODO: Generate thumbnail
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-ss", "00:00:05",
                "-i", presignedUrl,
                "-vframes", "1",
                "-q:v", "2",
                "-y",
                thumbnailPath
        );

        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Failed to generate thumbnail");
        }

        String thumbnailObjectKey = generateObjectKey(thumbnailId);

        try
        {
            minioService.uploadObject(thumbnailObjectKey, thumbnailPath);
        }
        catch (Exception e)
        {
            throw new RuntimeException("Failed to upload thumbnail", e);
        }

        String thumbnailPresignedUrl = minioService.generatePresignedDownloadUrl(
                thumbnailObjectKey
        );

        // TODO: Update video thumbnail
        videoProxy.updateVideoThumbnail(videoId, thumbnailPresignedUrl);

    }

    public String generateObjectKey(UUID thumbnailId)
    {
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
        return String.format("thumbnails/%s/%s-thumbnail.jpg", thumbnailId, timestamp);
    }
}
