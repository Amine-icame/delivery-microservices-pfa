package com.example.identity_service.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; // CUSTOMER ou DRIVER

    // Infos supplémentaires pour le profil
    private String firstName;
    private String lastName;
    private String address;
    private String phone;
    private String city; // Pour le livreur
}