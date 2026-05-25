package com.example.github_trending_monitor.dto;

public record SubscriptionUpdateRequest(
    boolean enabled,
    Integer dailyCount
) {}