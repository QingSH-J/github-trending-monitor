package com.example.github_trending_monitor.service;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class GitHubService {

    //RestClient to call GitHub API
    private final RestClient restClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public GitHubService(RestClient restClient, RedisTemplate<String, Object> redisTemplate) {
        this.restClient = restClient;
        this.redisTemplate = redisTemplate;
    }

    public String fetchReadme(String owner, String repo){
        String cacheKey = "github:readme:" + owner + ":" + repo;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if(cached != null){
            return (String) cached;
        }
        try{
            String markdown = restClient.get()
                .uri("https://api.github.com/repos/{owner}/{repo}/readme", owner, repo)
                .header("Accept", "application/vnd.github.raw+json")
                .header("User-Agent", "github-trending-monitor")
                .retrieve()
                .body(String.class);
            
            if (markdown != null) {
                redisTemplate.opsForValue().set(cacheKey, markdown, 1, TimeUnit.HOURS);
            }

            return markdown;
            
            


        }catch(HttpClientErrorException e){
            return null;
        }

    }
}
