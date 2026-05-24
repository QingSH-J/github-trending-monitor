package com.example.github_trending_monitor.dto;




public record RepoBrief(
    String what,
    String targetAudience,
    String techStack,
    String highlights,
    String difficulty,
    boolean goodForLearning,
    boolean goodForProduction,
    String risks
) {
    
}
