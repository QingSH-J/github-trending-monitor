package com.example.github_trending_monitor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.resend.Resend;

@Configuration
public class ResendConfig {
    
    @Bean
    @ConditionalOnExpression("'${app.mail.resend-api-key:}' != ''")
    public Resend resend(@Value("${app.mail.resend-api-key:}") String apiKey){
        return new Resend(apiKey);
    }
}
