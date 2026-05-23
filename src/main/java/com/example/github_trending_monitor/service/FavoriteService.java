package com.example.github_trending_monitor.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.github_trending_monitor.entity.UserFavorite;
import com.example.github_trending_monitor.repository.FavoriteRepository;

@Service
public class FavoriteService {
    
    private final FavoriteRepository favoriteRepository;

    public FavoriteService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    //
    public List<UserFavorite> favoriteRepos(Long userId){
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 
    public UserFavorite addFavorite(Long userId, String repoName){
        if(favoriteRepository.existsByUserIdAndRepoName(userId, repoName)){
            throw new RuntimeException("Already favorited");
        }
        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setRepoName(repoName);
        return favoriteRepository.save(favorite);
    }

    //
    @Transactional
    public void removeFavorite(Long userId, String repoName){
        if(!favoriteRepository.existsByUserIdAndRepoName(userId, repoName)){
            throw new RuntimeException("Favorite not found");
        }
        favoriteRepository.deleteByUserIdAndRepoName(userId, repoName);
    }

    // check if the repo is already favorited by the user
    public boolean isFavorited(Long userId, String repoName){
        return favoriteRepository.existsByUserIdAndRepoName(userId, repoName);
    }
}

