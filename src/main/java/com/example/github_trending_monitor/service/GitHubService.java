package com.example.github_trending_monitor.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class GitHubService {

    //RestClient to call GitHub API
    private final RestClient restClient;

    public GitHubService(RestClient restClient) {
        this.restClient = restClient;
    }

    public String fetchReadme(String owner, String repo){
        try{
            return restClient.get()
                .uri("https://api.github.com/repos/{owner}/{repo}/readme", owner, repo)
                .header("Accept", "application/vnd.github.raw+json")
                .header("User-Agent", "github-trending-monitor")
                .retrieve()
                .body(String.class);
        }catch(HttpClientErrorException e){
            return null;
        }

    }
}
