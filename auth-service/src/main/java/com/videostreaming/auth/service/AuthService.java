package com.videostreaming.auth.service;

import com.videostreaming.auth.dto.AuthDto;
import com.videostreaming.auth.model.RefreshToken;
import com.videostreaming.auth.model.User;
import com.videostreaming.auth.repository.RefreshTokenRepository;
import com.videostreaming.auth.repository.UserRepository;
import com.videostreaming.auth.security.JwtUtil;
import com.videostreaming.auth.security.TokenHasher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenHasher tokenHasher;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil, TokenHasher tokenHasher,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenHasher = tokenHasher;
        this.authenticationManager = authenticationManager;
    }

    public AuthDto.RegisterResponse register(AuthDto.RegisterRequest req) {
        var exists = userRepository.findByUsernameOrEmail(req.getUsername(), req.getEmail());
        if (exists.isPresent()) {
            throw new IllegalArgumentException("User already exists");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user = userRepository.save(user);

        return new AuthDto.RegisterResponse(user.getId());
    }

    public AuthDto.TokenResponse login(AuthDto.LoginRequest req) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByUsernameOrEmail(req.getUsernameOrEmail(), req.getUsernameOrEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String accessToken = jwtUtil.generateToken(user.getUsername());
        String refreshToken = jwtUtil.generateToken(user.getUsername());
        
        // Hash and store refresh token
        String refreshTokenHash = tokenHasher.hashToken(refreshToken);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7); // 7 days validity
        RefreshToken rtEntity = new RefreshToken(user, refreshTokenHash, expiresAt, null);
        refreshTokenRepository.save(rtEntity);

        return new AuthDto.TokenResponse(accessToken, refreshToken);
    }

    public AuthDto.TokenResponse refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        String username = jwtUtil.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Hash the refresh token to look it up in DB
        String refreshTokenHash = tokenHasher.hashToken(refreshToken);
        
        // Verify the token exists in DB and is not expired
        RefreshToken rtEntity = refreshTokenRepository.findByUserAndTokenHashAndExpiresAtAfter(user, refreshTokenHash, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found or expired"));

        // Generate new tokens
        String newAccessToken = jwtUtil.generateToken(username);
        String newRefreshToken = jwtUtil.generateToken(username);
        
        // Hash and update refresh token in DB
        String newRefreshTokenHash = tokenHasher.hashToken(newRefreshToken);
        rtEntity.setTokenHash(newRefreshTokenHash);
        rtEntity.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(rtEntity);

        return new AuthDto.TokenResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            // Delete all refresh tokens for the user
            refreshTokenRepository.deleteByUser(user);
        }
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}

