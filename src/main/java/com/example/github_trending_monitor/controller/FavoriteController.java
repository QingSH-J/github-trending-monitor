package com.example.github_trending_monitor.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.entity.UserFavorite;
import com.example.github_trending_monitor.service.FavoriteService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    
    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favortitService){
        this.favoriteService = favortitService;
    }

    // GET /api/favorites - get all favorites for the current user
    @GetMapping
    public ResponseEntity<List<UserFavorite>> getFavorites(Authentication authentication){
        Long userId = (Long) authentication.getPrincipal();
        List<UserFavorite> favorites = favoriteService.favoriteRepos(userId);
        return ResponseEntity.ok(favorites);
    }
    
    // POST /api/favorites - add a new favorite for the current user
    @PostMapping
    public UserFavorite addFavorite(Authentication authentication, @RequestBody Map<String, String> body) {
        Long userId = (Long) authentication.getPrincipal();
        String repoName = body.get("repoName");
        return favoriteService.addFavorite(userId, repoName);
    }
    

    //DELETE /api/favorites?repoName=xxx - remove a favorite for the current user
    @DeleteMapping
    public ResponseEntity<Void> removeFavorite(Authentication authentication, @RequestParam String repoName){
        Long userId = (Long) authentication.getPrincipal();
        favoriteService.removeFavorite(userId, repoName);
        return ResponseEntity.noContent().build();
    }

    // GET /api/favorites/check?repoName=xxx - check if the repo is already favorited by the user
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(Authentication authentication, @RequestParam String repoName){
        Long userId = (Long) authentication.getPrincipal();
        boolean isFavorited = favoriteService.isFavorited(userId, repoName);
        return ResponseEntity.ok(Map.of("favorited", isFavorited));
    }
}
