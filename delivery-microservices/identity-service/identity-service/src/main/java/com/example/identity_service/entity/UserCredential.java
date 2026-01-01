package com.example.identity_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCredential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name; // Username

    private String email;
    private String password; // Sera crypté

    // Rôle : ADMIN, CUSTOMER, DRIVER
    // On garde ça simple en String pour le moment (ou tu peux faire un Enum si tu préfères)
    private String role;
}