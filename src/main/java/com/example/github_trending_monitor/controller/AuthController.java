package com.example.github_trending_monitor.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.dto.AuthResponse;
import com.example.github_trending_monitor.dto.LoginRequest;
import com.example.github_trending_monitor.dto.RegisterRequest;
import com.example.github_trending_monitor.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
     }

     @PostMapping("/register")
     public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
         return ResponseEntity.ok(authService.register(req));
     }

     @PostMapping("/login")
     public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
         return ResponseEntity.ok(authService.login(req));
     }
     
}
