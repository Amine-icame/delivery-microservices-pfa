package com.example.delivery_service.model;
import lombok.Data;

@Data
public class OrderResponse {
    private Long id;
    private Long customerId;
    // On suppose qu'on récupèrera l'adresse via le client,
    // ou qu'elle est stockée dans la commande. Simplifions ici.
}