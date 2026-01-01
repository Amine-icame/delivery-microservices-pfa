package com.example.identity_service.controller;

import com.example.identity_service.dto.AuthRequest;
import com.example.identity_service.dto.RegisterRequest;
import com.example.identity_service.entity.UserCredential;
import com.example.identity_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private AuthenticationManager authenticationManager; // Vient de AuthConfig

    // Inscription (Créer un compte)
    @PostMapping("/register")
    public String addNewUser(@RequestBody RegisterRequest request) {
        return service.register(request);
    }

    // Connexion (Login) -> Renvoie le Token
    @PostMapping("/token")
    public String getToken(@RequestBody AuthRequest authRequest) {
        // Authentification via Spring Security
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        if (authenticate.isAuthenticated()) {
            return service.generateToken(authRequest.getUsername());
        } else {
            throw new RuntimeException("invalid access");
        }
    }

    // Validation (Utilisé par la Gateway)
    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }
}