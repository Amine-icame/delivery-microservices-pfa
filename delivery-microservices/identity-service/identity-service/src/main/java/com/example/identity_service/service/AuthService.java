package com.example.identity_service.service;

import com.example.identity_service.client.CustomerRestClient;
import com.example.identity_service.client.DeliveryRestClient;
import com.example.identity_service.dto.RegisterRequest;
import com.example.identity_service.entity.UserCredential;
import com.example.identity_service.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    // Clients Feign
    @Autowired
    private CustomerRestClient customerRestClient;
    @Autowired
    private DeliveryRestClient deliveryRestClient;

    public String register(RegisterRequest request) {
        // 1. Sauvegarder l'authentification (UserCredential)
        UserCredential credential = UserCredential.builder()
                .name(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        // On sauvegarde et on récupère l'entité pour avoir l'ID généré
        UserCredential savedUser = repository.save(credential);

        // 2. Dispatcher vers le bon service métier
        try {
            if ("CUSTOMER".equalsIgnoreCase(request.getRole())) {
                // On pourrait mapper l'objet, mais pour faire simple on envoie le DTO
                // L'idéal serait d'ajouter l'ID généré (savedUser.getId()) dans la requête
                // Mais pour ce PFA, supposons que les IDs sont synchronisés ou gérés par le token plus tard
                // ASTUCE PFA : On va passer l'ID généré dans le DTO pour être sûr
                customerRestClient.createCustomer(request);
            }
            else if ("DRIVER".equalsIgnoreCase(request.getRole())) {
                deliveryRestClient.createDriver(request);
            }
        } catch (Exception e) {
            // Si le microservice métier est éteint, on a un problème de cohérence.
            // Pour le PFA, on log juste l'erreur.
            System.err.println("Erreur lors de la création du profil métier : " + e.getMessage());
        }

        return "User created with role: " + request.getRole();
    }

    public String generateToken(String username) {
        // 1. Chercher l'utilisateur pour avoir son rôle
        // Note: username peut être l'email, donc on utilise findByNameOrEmail
        UserCredential user = repository.findByNameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Préparer les infos à mettre dans le token
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());

        claims.put("email", user.getEmail());// <--- LA CLÉ DU SUCCÈS

        // 3. Générer
        return jwtService.generateToken(user.getName(), claims);
    }

    public void validateToken(String token) {
        jwtService.validateToken(token);
    }
}