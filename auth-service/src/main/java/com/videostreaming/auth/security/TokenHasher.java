package com.videostreaming.auth.security;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class TokenHasher {

    /**
     * Hash a token using SHA-256 for secure storage.
     * Never store plain tokens in the database.
     */
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Verify if a plain token matches a stored hash.
     */
    public boolean verifyToken(String plainToken, String storedHash) {
        String computedHash = hashToken(plainToken);
        return computedHash.equals(storedHash);
    }
}

