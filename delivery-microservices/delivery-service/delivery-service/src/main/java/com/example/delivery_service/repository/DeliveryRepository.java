package com.example.delivery_service.repository;

import com.example.delivery_service.entities.Delivery;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    // Trouver les livraisons d'un livreur spécifique
    List<Delivery> findByDriverId(Long driverId);

    // Trouver les livraisons par commande (au cas où)
    Delivery findByOrderId(Long orderId);
    @Query("SELECT COUNT(d) FROM Delivery d WHERE d.driverId = :driverId AND d.status IN ('ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'ON_WAY')")
    long countActiveDeliveries(@Param("driverId") Long driverId);
}