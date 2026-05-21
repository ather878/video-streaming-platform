package com.videostreaming.video.dto;

import com.videostreaming.video.model.Video;
import java.time.LocalDateTime;

public class VideoDto {

    public static class CreateRequest {
        private String title;
        private String description;
        private String category;
        private String thumbnailUrl;
        private String videoUrl;
        // uploadId removed from create request
        private Long durationInSeconds;
        private String visibility;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        public Long getDurationInSeconds() { return durationInSeconds; }
        public void setDurationInSeconds(Long durationInSeconds) { this.durationInSeconds = durationInSeconds; }

        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }
        
    }

    public static class AttachRequest {
        private String uploadId;

        public String getUploadId() { return uploadId; }
        public void setUploadId(String uploadId) { this.uploadId = uploadId; }

    }

    public static class UpdateRequest {
        private String title;
        private String description;
        private String category;
        private String thumbnailUrl;
        private String visibility;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }
    }

    public static class VideoResponse {
        private String id;
        private String title;
        private String description;
        private Long uploaderId;
        private String category;
        private String thumbnailUrl;
        private String videoUrl;
        private Long durationInSeconds;
        
        private String visibility;
        private String uploadStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public VideoResponse() {}

        public VideoResponse(Video video) {
            this.id = video.getId() == null ? null : video.getId().toString();
            this.title = video.getTitle();
            this.description = video.getDescription();
            this.uploaderId = video.getUploaderId();
            this.category = video.getCategory();
            this.thumbnailUrl = video.getThumbnailUrl();
            this.durationInSeconds = video.getDurationInSeconds();
            // uploadId removed; upload relationship tracked in upload-service
            this.visibility = video.getVisibility().toString();
            this.uploadStatus = video.getStatus().toString();
            this.createdAt = video.getCreatedAt();
            this.updatedAt = video.getUpdatedAt();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getUploaderId() { return uploaderId; }
        public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        // uploadId removed from response

        public Long getDurationInSeconds() { return durationInSeconds; }
        public void setDurationInSeconds(Long durationInSeconds) { this.durationInSeconds = durationInSeconds; }

        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }

        public String getUploadStatus() { return uploadStatus; }
        public void setUploadStatus(String uploadStatus) { this.uploadStatus = uploadStatus; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}

