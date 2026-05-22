package com.example.github_trending_monitor.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "trending_repos")
public class TrendingRepo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repo_name", nullable = false, length = 200)
    private String repoName;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String language;

    @Column(nullable = false)
    private int stars;

    @Column(nullable = false)
    private int forks;

    @Column(name = "stars_today", nullable = false)
    private int starsToday;

    @Column(nullable = false, length = 20)
    private String since;

    @Column(name = "scraped_at", nullable = false)
    private LocalDateTime scrapedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public String getRepoName() { return repoName; }
    public String getDescription() { return description; }
    public String getLanguage() { return language; }
    public int getStars() { return stars; }
    public int getForks() { return forks; }
    public int getStarsToday() { return starsToday; }
    public String getSince() { return since; }
    public LocalDateTime getScrapedAt() { return scrapedAt; }

    public void setRepoName(String repoName) { this.repoName = repoName; }
    public void setDescription(String description) { this.description = description; }
    public void setLanguage(String language) { this.language = language; }
    public void setStars(int stars) { this.stars = stars; }
    public void setForks(int forks) { this.forks = forks; }
    public void setStarsToday(int starsToday) { this.starsToday = starsToday; }
    public void setSince(String since) { this.since = since; }
    public void setScrapedAt(LocalDateTime scrapedAt) { this.scrapedAt = scrapedAt; }
}
