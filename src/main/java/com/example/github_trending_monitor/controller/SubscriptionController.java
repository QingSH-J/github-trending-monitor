package com.example.github_trending_monitor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.dto.SubscriptionResponse;
import com.example.github_trending_monitor.dto.SubscriptionUpdateRequest;
import com.example.github_trending_monitor.entity.EmailSubscription;
import com.example.github_trending_monitor.entity.SubscriptionType;
import com.example.github_trending_monitor.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * GET /api/subscriptions
     * 查當前用戶的 Daily Digest 訂閱設定。
     * 第一次訪問會自動建立一筆 enabled=false 的預設記錄。
     */
    @GetMapping
    public ResponseEntity<SubscriptionResponse> getMySubscription(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        EmailSubscription sub = subscriptionService.getOrCreateForUser(
            userId, SubscriptionType.DAILY_DIGEST);
        return ResponseEntity.ok(SubscriptionResponse.from(sub));
    }

    /**
     * PUT /api/subscriptions
     * 更新訂閱設定。Body 範例：
     *   { "enabled": true, "dailyCount": 5 }
     * 任一欄位可省略表示不變動。
     */
    @PutMapping
    public ResponseEntity<SubscriptionResponse> updateMySubscription(
            Authentication authentication,
            @RequestBody SubscriptionUpdateRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        EmailSubscription sub = subscriptionService.updateForUser(
            userId,
            SubscriptionType.DAILY_DIGEST,
            request.enabled(),
            request.dailyCount()
        );
        return ResponseEntity.ok(SubscriptionResponse.from(sub));
    }
}
