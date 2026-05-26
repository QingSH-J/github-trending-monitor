package com.example.github_trending_monitor.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.service.SubscriptionService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/unsubscribe")
public class UnsubscribeController {
    
    private final SubscriptionService subscriptionService;

    public UnsubscribeController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * POST /api/unsubscribe/
     */
    @PostMapping
    public ResponseEntity<Map<String, Boolean>> unsubscribe(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        boolean success = token != null && subscriptionService.disableByToken(token);
        return ResponseEntity.ok(Map.of("success", success));
    }
    
}
