package com.videostreaming.upload.repository;

import com.videostreaming.upload.model.UploadFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UploadFileRepository extends JpaRepository<UploadFile, UUID> {
    Optional<UploadFile> findByVideoId(UUID videoId);
}

