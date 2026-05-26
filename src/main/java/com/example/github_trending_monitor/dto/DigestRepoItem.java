package com.example.github_trending_monitor.dto;

public record DigestRepoItem(
        String repoName,
        String description,
        String language,
        int stars,
        int starsToday,
        String url,
        String briefWhat,
        String briefTechStack
) {}
