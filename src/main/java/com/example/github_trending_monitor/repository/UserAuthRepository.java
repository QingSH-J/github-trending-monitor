package com.example.github_trending_monitor.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.github_trending_monitor.entity.UserAuth;

public interface UserAuthRepository extends JpaRepository<UserAuth, Long>{
    Optional<UserAuth> findByAuthTypeAndIdentifier(String authType, String identifier);
}