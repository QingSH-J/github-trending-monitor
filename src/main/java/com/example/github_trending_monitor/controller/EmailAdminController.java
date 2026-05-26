package com.example.github_trending_monitor.controller;

import com.example.github_trending_monitor.service.DigestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/email")
public class EmailAdminController {

    private final DigestService digestService;

    public EmailAdminController(DigestService digestService) {
        this.digestService = digestService;
    }

    @PostMapping("/digest")
    public ResponseEntity<DigestService.DigestStats> triggerDigest() {
        return ResponseEntity.ok(digestService.sendDailyDigest());
    }
}
