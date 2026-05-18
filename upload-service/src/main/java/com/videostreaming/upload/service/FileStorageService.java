package com.videostreaming.upload.service;

import com.videostreaming.upload.config.StorageProperties;
import com.videostreaming.upload.model.UploadFile;
import com.videostreaming.upload.repository.UploadFileRepository;
import com.videostreaming.upload.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageLocation;
    private final UploadFileRepository repository;

    public FileStorageService(StorageProperties properties, UploadFileRepository repository) {
        this.storageLocation = Path.of(properties.getLocation()).toAbsolutePath().normalize();
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(storageLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not create storage directory", e);
        }
    }

    public UploadFile store(MultipartFile file, Long uploadedBy, java.util.UUID videoId) {
        validateVideoFile(file);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int idx = originalFileName.lastIndexOf('.');
        if (idx > 0) {
            ext = originalFileName.substring(idx);
        }

        String storedFileName = UUID.randomUUID().toString() + ext;
        Path target = storageLocation.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file", e);
        }

        UploadFile.UploadFileBuilder entityBuilder = UploadFile.builder()
                .id(UUID.randomUUID())
                .originalFileName(originalFileName)
                .storedFileName(storedFileName)
                .storagePath(target.toString())
                .contentType(file.getContentType())
                .size(file.getSize())
                .uploadedBy(uploadedBy)
                .createdAt(Instant.now())
                .status(UploadFile.Status.UPLOADED);

        if (videoId != null) {
            entityBuilder.videoId(videoId);
        }

        UploadFile entity = entityBuilder.build();

        return repository.save(entity);
    }

    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new FileStorageException("Only video files are allowed");
        }

        // optional size limit can be enforced here
    }

    public UploadFile findByVideoId(UUID videoId) {
        return repository.findByVideoId(videoId).orElse(null);
    }
}

