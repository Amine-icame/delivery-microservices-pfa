package com.example.delivery_service.entities;

import com.example.delivery_service.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Driver {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String city; // Pour filtrer "Casablanca", "Rabat", etc.

    @Enumerated(EnumType.STRING)
    private DriverStatus status;
}