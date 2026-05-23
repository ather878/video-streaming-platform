package com.videostreaming.video.service;

import com.videostreaming.video.dto.VideoDto;
import com.videostreaming.video.model.Video;
import com.videostreaming.video.repository.VideoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @Transactional
    public VideoDto.VideoResponse createVideo(Long uploaderId, VideoDto.CreateRequest req) {
        Video video = new Video();
        video.setTitle(req.getTitle());
        video.setDescription(req.getDescription());
        video.setUploaderId(uploaderId);
        // uploadId removed; attachment is handled by upload-service calling /videos/{id}/attach-upload
        video.setCategory(req.getCategory());
        video.setDurationInSeconds(req.getDurationInSeconds());
        
        if (req.getVisibility() != null) {
            video.setVisibility(Video.Visibility.valueOf(req.getVisibility().toUpperCase()));
        }
        video.setStatus(Video.Status.INITIATED);
        
        video = videoRepository.save(video);
        return new VideoDto.VideoResponse(video);
    }

    public VideoDto.VideoResponse getVideoById(java.util.UUID id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Video not found: " + id));
        return new VideoDto.VideoResponse(video);
    }

    public Page<VideoDto.VideoResponse> getAllVideos(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return videoRepository.findByVisibility(Video.Visibility.PUBLIC, pageable)
                .map(VideoDto.VideoResponse::new);
    }

    public Page<VideoDto.VideoResponse> getVideosByUploader(Long uploaderId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return videoRepository.findByUploaderId(uploaderId, pageable)
                .map(VideoDto.VideoResponse::new);
    }

    public Page<VideoDto.VideoResponse> searchVideos(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return videoRepository.findByTitleContainingIgnoreCase(query, pageable)
                .map(VideoDto.VideoResponse::new);
    }

    @Transactional
    public VideoDto.VideoResponse updateVideo(java.util.UUID videoId, Long uploaderId, VideoDto.UpdateRequest req) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found: " + videoId));
        
        // Only uploader can update
        if (!video.getUploaderId().equals(uploaderId)) {
            throw new IllegalArgumentException("Unauthorized: only uploader can update this video");
        }

        if (req.getTitle() != null) video.setTitle(req.getTitle());
        if (req.getDescription() != null) video.setDescription(req.getDescription());
        if (req.getCategory() != null) video.setCategory(req.getCategory());
        if (req.getThumbnailUrl() != null) video.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getVisibility() != null) {
            video.setVisibility(Video.Visibility.valueOf(req.getVisibility().toUpperCase()));
        }

        video = videoRepository.save(video);
        return new VideoDto.VideoResponse(video);
    }

    @Transactional
    public VideoDto.VideoResponse updateVideo(java.util.UUID videoId, VideoDto.UpdateThumbnailRequest req) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found: " + videoId));

        video.setThumbnailUrl(req.getPresignedUrl());
        video = videoRepository.save(video);
        return new VideoDto.VideoResponse(video);
    }

    @Transactional
    public void deleteVideo(java.util.UUID videoId, Long uploaderId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found: " + videoId));
        
        // Only uploader can delete
        if (!video.getUploaderId().equals(uploaderId)) {
            throw new IllegalArgumentException("Unauthorized: only uploader can delete this video");
        }

        videoRepository.delete(video);
    }

    @Transactional
    public VideoDto.VideoResponse attachUploadToVideo(java.util.UUID videoId, String uploadIdStr) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found: " + videoId));

        // We don't store uploadId on Video; upload-service keeps the mapping.
        video.setStatus(Video.Status.UPLOADED);
        video = videoRepository.save(video);
        return new VideoDto.VideoResponse(video);
    }
}

