package com.example.github_trending_monitor.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.github_trending_monitor.service.GitHubService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/repos")
public class RepoController {
    
    private final GitHubService gitHubService;

    public RepoController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    //GET
    @GetMapping("/{owner}/{repo}/readme")
    public ResponseEntity<?> getReadme(@PathVariable String owner, @PathVariable String repo) {
        String markdown = gitHubService.fetchReadme(owner, repo);

        if(markdown == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "README not found"));
        }

        return ResponseEntity.ok(Map.of("readme", markdown));
    }
    
}
