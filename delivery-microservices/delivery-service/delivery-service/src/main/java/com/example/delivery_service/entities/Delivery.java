package com.example.delivery_service.entities;

import com.example.delivery_service.enums.DeliveryStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Delivery {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId; // Lien vers Order-Service

    private Long driverId; // Lien vers le livreur assigné (peut être null au début)

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private String deliveryAddress; // Copiée depuis la commande pour performance
}