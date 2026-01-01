package com.example.gateway_service.filter;

import com.example.gateway_service.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // 1. Vérifier si la route demande une sécurité (n'est pas dans la liste blanche)
            if (validator.isSecured.test(exchange.getRequest())) {

                // 2. Vérifier si le Header contient le Token
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException("Missing authorization header");
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7); // Enlever "Bearer "
                }

                try {
                    // AJOUTE CE LOG POUR VOIR LE TOKEN REÇU
                    System.out.println("Token reçu dans Gateway : " + authHeader);

                    jwtUtil.validateToken(authHeader);

                    System.out.println("Token Validé avec succès !"); // Si on arrive là, c'est gagné

                } catch (Exception e) {
                    // AFFICHE L'ERREUR EXACTE
                    System.out.println("Erreur de validation JWT : " + e.getMessage());
                    e.printStackTrace(); // Affiche la trace complète dans la console

                    throw new RuntimeException("Unauthorized access to application");
                }
            }
            return chain.filter(exchange);
        });
    }

    public static class Config {
        // Configuration vide
    }
}