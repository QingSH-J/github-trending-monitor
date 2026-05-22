package com.example.github_trending_monitor.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.github_trending_monitor.entity.User;
import com.example.github_trending_monitor.entity.UserAuth;
import com.example.github_trending_monitor.repository.UserAuthRepository;
import com.example.github_trending_monitor.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtUtil jwtUtil;

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;

    @Value("${app.oauth2.redirect-url}")
    private String redirectUrl;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, UserRepository userRepository, UserAuthRepository userAuthRepository){
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.userAuthRepository = userAuthRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        
        OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauth2Token.getPrincipal();

        // Info from OAuth2 provider
        String githubId = String.valueOf(oauth2User.getAttribute("id"));
        String email = oauth2User.getAttribute("email");
        String username = oauth2User.getAttribute("login");
        String avatarUrl = oauth2User.getAttribute("avatar_url");

        // Github may sets the email to null if it's private, so we use a placeholder email
        if(email == null){
            email = githubId + "@github.com";
        }

        User user = findOrCreateUser(githubId, email, username, avatarUrl);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        // Redirect to frontend with token
        getRedirectStrategy().sendRedirect(request, response, redirectUrl + "?token=" + token);
    }


    private User findOrCreateUser(String githubId, String email, String username, String avatarUrl){
        Optional<UserAuth> existingAuth = userAuthRepository.findByAuthTypeAndIdentifier("GITHUB", githubId);
        
        if(existingAuth.isPresent()){
            return existingAuth.get().getUser();
        }

        //if not exist, check if there's a user with the same email (maybe registered with other method)
        User user = userRepository.findByEmail(email).orElse(null);
        if(user == null){
            user = new User();
            user.setEmail(email);
            user.setUsername(username);
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);
        }

        //Create Github auth record
        UserAuth userAuth = new UserAuth();
        userAuth.setUser(user);
        userAuth.setAuthType("GITHUB");
        userAuth.setIdentifier(githubId);
        userAuth.setCredential(null);
        userAuthRepository.save(userAuth);

        return user;
    }


}
