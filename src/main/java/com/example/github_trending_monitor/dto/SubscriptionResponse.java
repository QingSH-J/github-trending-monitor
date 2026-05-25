package com.example.github_trending_monitor.dto;

import com.example.github_trending_monitor.entity.EmailSubscription;
import com.example.github_trending_monitor.entity.SubscriptionType;

public record SubscriptionResponse(SubscriptionType type, boolean enabled, int dailyCount) {
    public static SubscriptionResponse from(EmailSubscription sub){
        return new SubscriptionResponse(sub.getType(), sub.isEnabled(), sub.getDailyCount());
    }
}
