package com.example.github_trending_monitor.dto;

public class AuthResponse {
    private final String token;
    private final String username;
    private final String email;

    public AuthResponse(String token, String username, String email) {
        this.token = token;
        this.username = username;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

}
