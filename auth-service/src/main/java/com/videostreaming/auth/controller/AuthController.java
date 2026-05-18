package com.videostreaming.auth.controller;

import com.videostreaming.auth.dto.AuthDto;
import com.videostreaming.auth.model.User;
import com.videostreaming.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDto.RegisterResponse> register(@RequestBody AuthDto.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.TokenResponse> login(@RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        User user = authService.getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(Map.of("id", user.getId(), "username", user.getUsername(), "email", user.getEmail()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthDto.TokenResponse> refresh(@RequestBody Map<String, String> body) {
        String refresh = body.get("refreshToken");
        return ResponseEntity.ok(authService.refresh(refresh));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        User user = authService.getCurrentUser();
        if (user != null) {
            authService.logout(user.getUsername());
        }
        return ResponseEntity.ok(Map.of("status", "logged out"));
    }
}

