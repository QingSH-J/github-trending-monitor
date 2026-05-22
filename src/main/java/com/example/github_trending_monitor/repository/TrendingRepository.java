package com.example.github_trending_monitor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.github_trending_monitor.entity.TrendingRepo;

public interface TrendingRepository extends JpaRepository<TrendingRepo, Long> {

    List<TrendingRepo> findBySinceOrderByStarsTodayDesc(String since);

    List<TrendingRepo> findBySinceAndLanguageOrderByStarsTodayDesc(String since, String language);
}
