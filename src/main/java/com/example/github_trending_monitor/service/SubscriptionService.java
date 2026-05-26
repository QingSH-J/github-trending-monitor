package com.example.github_trending_monitor.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.github_trending_monitor.entity.EmailSubscription;
import com.example.github_trending_monitor.entity.SubscriptionType;
import com.example.github_trending_monitor.repository.EmailSubscriptionRepository;

@Service
public class SubscriptionService {
    private static final int MIN_DAILY_COUNT = 3;
    private static final int MAX_DAILY_COUNT = 15;

    private final EmailSubscriptionRepository emailSubscriptionRepository;

    public SubscriptionService(EmailSubscriptionRepository emailSubscriptionRepository) {
        this.emailSubscriptionRepository = emailSubscriptionRepository;
    }

    @Transactional
    public EmailSubscription getOrCreateForUser(Long userId, SubscriptionType type){
        return emailSubscriptionRepository.findByUserIdAndType(userId, type)
            .orElseGet(() -> {
                EmailSubscription subscription = new EmailSubscription();
                subscription.setUserId(userId);
                subscription.setType(type);
                return emailSubscriptionRepository.save(subscription);
            });
    }

    @Transactional
    public EmailSubscription updateForUser(
        Long userId,
        SubscriptionType type,
        Boolean enabled,
        Integer dailyCount
    ) {
        EmailSubscription subscription = getOrCreateForUser(userId, type);
        if(enabled != null){
            subscription.setEnabled(enabled);
        }
        if(dailyCount != null){
            if(dailyCount < MIN_DAILY_COUNT || dailyCount > MAX_DAILY_COUNT) {
                throw new IllegalArgumentException("Invalid daily count");
            }
            subscription.setDailyCount(dailyCount);
        }
        return emailSubscriptionRepository.save(subscription);
    }

    @Transactional
    public boolean disableByToken(String token){
        return emailSubscriptionRepository.findByUnsubscribeToken(token)
            .map(sub -> {
                sub.setEnabled(false);
                emailSubscriptionRepository.save(sub);
                return true;
            })
            .orElse(false);
    }



}
