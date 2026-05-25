package com.example.github_trending_monitor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.github_trending_monitor.entity.EmailSubscription;
import com.example.github_trending_monitor.entity.SubscriptionType;

public interface EmailSubscriptionRepository extends JpaRepository<EmailSubscription, Long>{
    
    Optional<EmailSubscription> findByUserIdAndType(Long userId, SubscriptionType type);

    Optional<EmailSubscription> findByUnsubscribeToken(String unsubscribeToken);

    List<EmailSubscription> findByTypeAndEnabledTrue(SubscriptionType type);
}
