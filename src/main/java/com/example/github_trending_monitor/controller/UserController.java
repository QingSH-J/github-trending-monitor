package com.example.github_trending_monitor.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.entity.User;
import com.example.github_trending_monitor.repository.UserRepository;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping({"/api/user", "/api/users"})
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(Authentication auth){
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "createdAt", user.getCreatedAt()
        ));

    }
}
