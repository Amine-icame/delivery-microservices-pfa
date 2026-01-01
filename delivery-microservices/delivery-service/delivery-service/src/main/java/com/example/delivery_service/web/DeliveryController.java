package com.example.delivery_service.web;

import com.example.delivery_service.dto.DriverRegisterDTO;
import com.example.delivery_service.entities.*;
import com.example.delivery_service.enums.*;
import com.example.delivery_service.service.DeliveryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    // Endpoint 1 : Créer un livreur (Méthode POST)
    @PostMapping("/drivers")
    public Driver createDriver(@RequestBody DriverRegisterDTO driverRequest) {
        return deliveryService.createDriver(driverRequest);
    }

    // Endpoint 2 : Lister les livreurs par ville (Méthode GET)
    @GetMapping("/drivers")
    public List<Driver> getDriversByCity(@RequestParam String city) {
        return deliveryService.getDriversByCity(city);
    }

    @PutMapping("/drivers/{id}")
    public Driver updateDriver(@PathVariable Long id, @RequestBody Driver driver) {
        return deliveryService.updateDriver(id, driver);
    }

    @PutMapping("/drivers/{id}/validate")
    public Driver validateDriver(@PathVariable Long id) {
        return deliveryService.validateDriver(id);
    }

    // Endpoint 3 : Créer une livraison (Méthode POST)
    @PostMapping
    public Delivery createDelivery(@RequestParam Long orderId, @RequestParam String address) {
        return deliveryService.createDeliveryRequest(orderId, address);
    }

    // Endpoint 4 : Assigner un livreur (Méthode PUT)
    @PutMapping("/{deliveryId}/assign/{driverId}")
    public Delivery assignDriver(@PathVariable Long deliveryId, @PathVariable Long driverId) {
        return deliveryService.assignDriver(deliveryId, driverId);
    }

    // Endpoint 5 : Changer statut livraison (Méthode PUT)
    @PutMapping("/{deliveryId}/status")
    public Delivery updateStatus(@PathVariable Long deliveryId, @RequestParam DeliveryStatus status) {
        return deliveryService.updateStatus(deliveryId, status);
    }

    // Endpoint pour trouver ses infos via l'email (utilisé au login)
    @GetMapping("/drivers/search")
    public Driver getDriverInfo(@RequestParam String email) {
        return deliveryService.getDriverByEmail(email);
    }

    // Ajoute aussi cet endpoint s'il n'existe pas déjà pour lister les livraisons d'un ID
    @GetMapping
    public List<Delivery> getDeliveriesByDriver(@RequestParam Long driverId) {
        return deliveryService.getDeliveriesByDriverId(driverId);
        // ⚠️ Si cette méthode n'existe pas dans ton Service, ajoute-la :
        // return deliveryRepository.findByDriverId(driverId);
    }

    @GetMapping("/all")
    public List<Delivery> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    // --- ENDPOINTS LIVREURS (DRIVERS) ---

    @GetMapping("/drivers/all")
    public List<Driver> getAllDrivers() {
        return deliveryService.getAllDrivers();
    }

    @DeleteMapping("/drivers/{id}")
    public void deleteDriver(@PathVariable Long id) {
        deliveryService.deleteDriver(id);
    }
}