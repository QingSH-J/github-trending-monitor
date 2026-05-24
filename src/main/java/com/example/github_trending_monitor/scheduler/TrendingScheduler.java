package com.example.github_trending_monitor.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.github_trending_monitor.service.TrendingService;

@Component
public class TrendingScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(TrendingScheduler.class);
    
    private final TrendingService trendingService;

    public TrendingScheduler(TrendingService trendingService) {
        this.trendingService = trendingService;
    }

    // Run every 6 hours
    @Scheduled(fixedDelay= 6 * 60 * 60 * 1000)
    public void scrapeDaily(){
        try {
            logger.info("Starting scheduled trending repositories scrape...");
            trendingService.scrapeAndSave("daily", "");
            trendingService.scrapeAndSave("weekly", "");
            trendingService.scrapeAndSave("monthly", "");
            logger.info("Finished scheduled trending repositories scrape.");
        } catch (Exception e) {
            logger.error("Error during scheduled trending repositories scrape: ", e.getMessage());
        }
    }
}
