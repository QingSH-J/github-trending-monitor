package com.example.github_trending_monitor.service;

import com.example.github_trending_monitor.controller.AuthController;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class EmailService {
    private final AuthController authController;

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    private final Resend resend;

    private final SpringTemplateEngine templateEngine;
    private final String fromEmail;
    private final String fromName;

    public EmailService(Resend resend, 
        SpringTemplateEngine templateEngine, 
        @Value("${app.mail.from}") String fromEmail, 
        @Value("${app.mail.from-name}") String fromName, AuthController authController){
        this.resend = resend;
        this.templateEngine = templateEngine;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.authController = authController;
    }

    @Async
    public void sendEmail(String to, String subject, String templateName,
         Map<String, Object> variables
    ){
        try{
            Context context = new Context();
            context.setVariables(variables);
            String html = templateEngine.process("email/" + templateName, context);

            // Send email using Resend
            CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromName + "<" + fromEmail + ">")
                .to(to)
                .subject(subject)
                .html(html)
                .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("Email sent to {} with subject '{}', response id: {}", to, subject, response.getId());
    } catch(ResendException e){
        log.error("Failed to send email to {} with subject '{}': {}", to, subject, e.getMessage());
    } catch(Exception e){
        log.error("Unexpected error while sending email to {} with subject '{}': {}", to, subject, e.getMessage());
    }
}
}
