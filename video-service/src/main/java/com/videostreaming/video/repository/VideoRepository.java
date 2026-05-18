package com.videostreaming.video.repository;

import com.videostreaming.video.model.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {
    Page<Video> findByVisibility(Video.Visibility visibility, Pageable pageable);
    Page<Video> findByUploaderId(Long uploaderId, Pageable pageable);
    Page<Video> findByVisibilityAndCategory(Video.Visibility visibility, String category, Pageable pageable);
    Page<Video> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}

