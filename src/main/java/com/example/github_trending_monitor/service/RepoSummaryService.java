package com.example.github_trending_monitor.service;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.github_trending_monitor.dto.RepoBrief;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

@Service
public class RepoSummaryService {
    private final GitHubService gitHubService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RepoSummaryService(GitHubService gitHubService, 
        RedisTemplate<String, Object> redisTemplate,
        @Value("${app.deepseek.api-key}") String deepSeekApi) {
        this.gitHubService = gitHubService;
        this.redisTemplate = redisTemplate;
        this.openAIClient = OpenAIOkHttpClient.builder()
            .apiKey(deepSeekApi)
            .baseUrl("https://api.deepseek.com")
            .build();
    }

    // public String getSummary(String owner, String repo){
    //     String cacheKey = "summary:" + owner + ":" +repo; 

    //     Object cached = redisTemplate.opsForValue().get(cacheKey);
    //     if(cached != null){
    //         return (String) cached;
    //     }

    //     String readme = gitHubService.fetchReadme(owner, repo);
    //     if(readme == null){
    //         return null;
    //     }

    //     String trimmed = readme.length() > 3000 ? readme.substring(0, 3000) : readme;

    //     String prompt = """
    //         以下是一個 GitHub 倉庫的 README:

    //         %s

    //         請用繁體中文生成一段簡短摘要(150字以內),包含:
    //         1. 這個項目是做什麼的
    //         2. 主要技術棧
    //         3. 適合什麼場景使用
    //         """.formatted(trimmed);

    //     ChatCompletion completion = openAIClient.chat().completions().create(
    //         ChatCompletionCreateParams.builder()
    //         .model("deepseek-v4-pro")
    //         .addUserMessage(prompt)
    //         .maxCompletionTokens(512L)
    //         .build()
    //     );

    //     String summary = completion.choices().get(0).message().content().orElse("");
    //     redisTemplate.opsForValue().set(cacheKey, summary, 1, TimeUnit.HOURS);
    //     return summary;
    // }

    public RepoBrief getBrief(String owner, String repo){
        String cacheKey = "brief:" + owner + ":" + repo;

        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if(cached != null){
            if(cached instanceof RepoBrief brief){
                return brief;
            }

            if(cached instanceof String json){
                try{
                    return objectMapper.readValue(json, RepoBrief.class);
                } catch (Exception e) {
                    redisTemplate.delete(cacheKey);
                }
            }
        }

        String readme = gitHubService.fetchReadme(owner, repo);
        if(readme == null){
            return null;
        }

        String trimmed = readme.length() > 3000 ? readme.substring(0, 3000) : readme;

        String prompt = """
                以下是一個 GitHub 倉庫的 README:

                %s

                請用繁體中文分析這個 repo,只回覆以下 JSON 物件，不要有任何前後文字或 markdown 標記：
                {
                  "what": "這個項目是做什麼的(1-2句話)",
                  "targetAudience": "適合誰使用(1句話,例如:後端工程師、AI 研究者)",
                  "techStack": "主要技術棧(關鍵技術，逗號分隔)",
                  "highlights": "最大亮點(1-2句話)",
                  "difficulty": "入門 / 中級 / 高級 三選一",
                  "goodForLearning": true 或 false,
                  "goodForProduction": true 或 false,
                  "risks": "潛在風險或注意事項(1句話,無風險則填 null)"
                }
                """.formatted(trimmed);
        ChatCompletion completion = openAIClient.chat().completions()
            .create(ChatCompletionCreateParams.builder()
                .model("deepseek-v4-pro")
                .addUserMessage(prompt)
                .maxCompletionTokens(512L)
                .build());
            
        String response = completion.choices().get(0).message().content().orElse("");

        int start = response.indexOf("{");
        int end = response.lastIndexOf("}");
        if(start < 0 || end <= start){
            return null;
        }

        String json = response.substring(start, end + 1);
        try{
            RepoBrief brief = objectMapper.readValue(json, RepoBrief.class);
            redisTemplate.opsForValue().set(cacheKey, brief, 1, TimeUnit.HOURS);
            return brief;
        } catch (Exception e) {
            return null;
        }
    }

}
