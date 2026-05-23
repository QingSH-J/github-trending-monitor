package com.example.github_trending_monitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GithubTrendingMonitorApplication {

	public static void main(String[] args) {
		SpringApplication.run(GithubTrendingMonitorApplication.class, args);
	}

}
