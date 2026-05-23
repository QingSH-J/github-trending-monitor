package com.example.github_trending_monitor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.github_trending_monitor.entity.UserFavorite;
import java.util.List;
import java.util.Optional;


public interface FavoriteRepository extends JpaRepository<UserFavorite, Long>{

    // according to user id, find all favorites and order by createdAt desc
    List<UserFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    // find by user id and repo name
    Optional<UserFavorite> findByUseridAndRepoName(Long userId, String repoName);

    boolean existsByUserIdAndRepoName(Long userId, String repoName);

    void deleteByUserIdAndRepoName(Long userId, String repoName);


    
}
