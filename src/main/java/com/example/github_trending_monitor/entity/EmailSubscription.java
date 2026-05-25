package com.example.github_trending_monitor.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "email_subscriptions")
public class EmailSubscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private SubscriptionType type = SubscriptionType.DAILY_DIGEST;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = false;

    @Column(name = "daily_count", nullable = false)
    private int dailyCount = 5;

    @Column(name = "unsubscribe_token", nullable = false, length = 64)
    private String unsubscribeToken;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if(unsubscribeToken == null || unsubscribeToken.isBlank()){
            unsubscribeToken = UUID.randomUUID().toString().replace("-", "");
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public SubscriptionType getType() {
        return type;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public int getDailyCount() {
        return dailyCount;
    }

    public String getUnsubscribeToken() {
        return unsubscribeToken;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(SubscriptionType type) {
        this.type = type;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setDailyCount(int dailyCount) {
        this.dailyCount = dailyCount;
    }

    public void setUnsubscribeToken(String unsubscribeToken) {
        this.unsubscribeToken = unsubscribeToken;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
