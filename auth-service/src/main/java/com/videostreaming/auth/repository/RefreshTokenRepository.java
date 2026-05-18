package com.videostreaming.auth.repository;

import com.videostreaming.auth.model.RefreshToken;
import com.videostreaming.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    Optional<RefreshToken> findByUserAndTokenHashAndExpiresAtAfter(User user, String tokenHash, LocalDateTime now);
    void deleteByUserAndExpiresAtBefore(User user, LocalDateTime now);
    void deleteByUser(User user);
    List<RefreshToken> findByUser(User user);
}

