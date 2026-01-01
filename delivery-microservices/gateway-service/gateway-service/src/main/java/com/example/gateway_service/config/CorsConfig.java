package com.example.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // 1. Autoriser ton Frontend
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // 2. Tout autoriser pour le développement (Méthodes, Headers)
        corsConfig.setMaxAge(3600L);
        corsConfig.addAllowedMethod("*"); // GET, POST, PUT, DELETE...
        corsConfig.addAllowedHeader("*"); // Authorization, Content-Type...

        // 3. Appliquer à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}