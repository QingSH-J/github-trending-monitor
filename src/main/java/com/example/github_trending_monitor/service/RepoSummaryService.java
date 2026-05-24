package com.example.github_trending_monitor.service;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

@Service
public class RepoSummaryService {
    private final GitHubService gitHubService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final OpenAIClient openAIClient;

    public RepoSummaryService(GitHubService gitHubService, RedisTemplate<String, Object> redisTemplate, @Value("${app.deepseek.api-key}") String deepSeekApi) {
        this.gitHubService = gitHubService;
        this.redisTemplate = redisTemplate;
        this.openAIClient = OpenAIOkHttpClient.builder()
            .apiKey(deepSeekApi)
            .baseUrl("https://api.deepseek.com")
            .build();
    }

    public String getSummary(String owner, String repo){
        String cacheKey = "summary:" + owner + ":" +repo; 

        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if(cached != null){
            return (String) cached;
        }

        String readme = gitHubService.fetchReadme(owner, repo);
        if(readme == null){
            return null;
        }

        String trimmed = readme.length() > 3000 ? readme.substring(0, 3000) : readme;

        String prompt = """
            以下是一個 GitHub 倉庫的 README:

            %s

            請用繁體中文生成一段簡短摘要(150字以內),包含:
            1. 這個項目是做什麼的
            2. 主要技術棧
            3. 適合什麼場景使用
            """.formatted(trimmed);

        ChatCompletion completion = openAIClient.chat().completions().create(
            ChatCompletionCreateParams.builder()
            .model("deepseek-v4-pro")
            .addUserMessage(prompt)
            .maxCompletionTokens(512L)
            .build()
        );

        String summary = completion.choices().get(0).message().content().orElse("");
        redisTemplate.opsForValue().set(cacheKey, summary, 1, TimeUnit.HOURS);
        return summary;
    }

}
