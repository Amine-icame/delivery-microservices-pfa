package com.example.delivery_service.repository;

import com.example.delivery_service.entities.Driver;
import com.example.delivery_service.enums.DriverStatus; // Import nécessaire
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    // Trouver les livreurs par ville (Ex: Casablanca)
    List<Driver> findByCity(String city);

    Optional<Driver> findByEmail(String email);

    // Optionnel : Trouver les livreurs disponibles par ville
    List<Driver> findByCityAndStatus(String city, DriverStatus status);
}