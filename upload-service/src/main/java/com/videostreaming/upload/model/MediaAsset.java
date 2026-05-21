package com.videostreaming.upload.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaAsset {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID videoId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Column(nullable = false)
    private String objectKey;

    @Column(nullable = false)
    private String bucketName;

    @Column
    private String contentType;

    @Column
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UploadStatus uploadStatus;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public enum AssetType {
        ORIGINAL,
        HLS_MASTER,
        HLS_1080P,
        HLS_720P,
        HLS_480P,
        THUMBNAIL,
        SUBTITLE,
        PREVIEW
    }

    public enum UploadStatus {
        INITIATED,
        UPLOADING,
        UPLOADED,
        PROCESSING,
        READY,
        FAILED
    }

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        this.createdAt = Instant.now();
    }
}

