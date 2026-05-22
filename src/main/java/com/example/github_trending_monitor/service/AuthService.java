package com.example.github_trending_monitor.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.github_trending_monitor.dto.AuthResponse;
import com.example.github_trending_monitor.dto.LoginRequest;
import com.example.github_trending_monitor.dto.RegisterRequest;
import com.example.github_trending_monitor.entity.User;
import com.example.github_trending_monitor.entity.UserAuth;
import com.example.github_trending_monitor.repository.UserAuthRepository;
import com.example.github_trending_monitor.repository.UserRepository;
import com.example.github_trending_monitor.security.JwtUtil;

import jakarta.security.auth.message.config.AuthConfig;

@Service
public class AuthService {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;


    public AuthService(JwtUtil jwtUtil, UserRepository userRepository, UserAuthRepository userAuthRepository, PasswordEncoder passwordEncoder){
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.userAuthRepository = userAuthRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req){
        if(userRepository.findByEmail(req.getEmail()).isPresent()){
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setUsername(req.getUsername());
        userRepository.save(user);

        UserAuth userAuth = new UserAuth();
        userAuth.setUser(user);
        userAuth.setAuthType("EMAIL");
        userAuth.setCredential(passwordEncoder.encode(req.getPassword()));
        userAuth.setIdentifier(req.getEmail());
        userAuthRepository.save(userAuth);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req){
        UserAuth auth = userAuthRepository.findByAuthTypeAndIdentifier("EMAIL", req.getEmail()).orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if(!passwordEncoder.matches(req.getPassword(), auth.getCredential())){
            throw new RuntimeException("Invalid credentials");
        }

        User user = auth.getUser();
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getUsername(), user.getEmail());

    }

    
}
