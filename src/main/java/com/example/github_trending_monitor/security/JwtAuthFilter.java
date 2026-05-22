package com.example.github_trending_monitor.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;




@Component
public class JwtAuthFilter extends OncePerRequestFilter{
    
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil){
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{
        String header = request.getHeader("Authorization");

        /*Check the header */
        if(header == null || !header.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            if(jwtUtil.validates(token)){
                Claims claims = jwtUtil.parseClaims(token);
                Long userId = Long.parseLong(claims.getSubject());
                String email = claims.get("email", String.class);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, email, List.of());

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(auth);
                SecurityContextHolder.setContext(context);
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
    
}
