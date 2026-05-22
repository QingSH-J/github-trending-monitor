package com.example.github_trending_monitor.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.entity.TrendingRepo;
import com.example.github_trending_monitor.service.TrendingService;

@RestController
@RequestMapping("/api/trending")
public class TrendingController {

    private final TrendingService trendingService;

    public TrendingController(TrendingService trendingService) {
        this.trendingService = trendingService;
    }

    // GET /api/trending?since=daily&language=java
    // 優先讀 DB；如果 DB 是空的（第一次），自動觸發爬蟲
    @GetMapping
    public ResponseEntity<List<TrendingRepo>> getTrending(
            @RequestParam(defaultValue = "daily") String since,
            @RequestParam(defaultValue = "") String language) throws IOException {

        List<TrendingRepo> repos = trendingService.getFromDb(since, language);

        if (repos.isEmpty()) {
            repos = trendingService.scrapeAndSave(since, language);
        }

        return ResponseEntity.ok(repos);
    }

    // GET /api/trending/refresh?since=daily&language=java
    // 強制重新爬，不管 DB 裡有沒有資料
    @GetMapping("/refresh")
    public ResponseEntity<List<TrendingRepo>> refresh(
            @RequestParam(defaultValue = "daily") String since,
            @RequestParam(defaultValue = "") String language) throws IOException {

        List<TrendingRepo> repos = trendingService.scrapeAndSave(since, language);
        return ResponseEntity.ok(repos);
    }
}
