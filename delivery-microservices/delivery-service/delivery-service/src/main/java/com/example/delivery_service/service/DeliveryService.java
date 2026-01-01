package com.example.delivery_service.service;

import com.example.delivery_service.client.OrderRestClient;
import com.example.delivery_service.dto.DriverRegisterDTO;
import com.example.delivery_service.entities.*;
import com.example.delivery_service.enums.*;
import com.example.delivery_service.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final OrderRestClient orderRestClient;

    public DeliveryService(DeliveryRepository deliveryRepository, DriverRepository driverRepository, OrderRestClient orderRestClient) {
        this.deliveryRepository = deliveryRepository;
        this.driverRepository = driverRepository;
        this.orderRestClient = orderRestClient;
    }

    // 1. Créer une demande de livraison (Status PENDING)
    public Delivery createDeliveryRequest(Long orderId, String address) {
        Delivery delivery = Delivery.builder()
                .orderId(orderId)
                .deliveryAddress(address)
                .status(DeliveryStatus.PENDING)
                .build();
        return deliveryRepository.save(delivery);
    }

    // 2. Créer un Livreur (Pour l'admin)
    public Driver createDriver(DriverRegisterDTO request) {
        Driver driver = new Driver();

        // 1. Fusionner Prénom + Nom
        String fullName = request.getFirstName() + " " + request.getLastName();
        driver.setName(fullName);

        driver.setEmail(request.getEmail());
        driver.setCity(request.getCity());

        // 2. Définir le statut par défaut
        // Tu as dit : "On laisse le choix", donc mettons AVAILABLE ou OFFLINE par défaut pour éviter le NULL.
        driver.setStatus(DriverStatus.PENDING_APPROVAL);
        return driverRepository.save(driver);
    }

    // AJOUTER UNE METHODE POUR L'ADMIN
    public Driver validateDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setStatus(DriverStatus.AVAILABLE); // On le valide
        return driverRepository.save(driver);
    }
    private static final int MAX_CAPACITY = 5;
    // 3. Assigner un livreur (Logique Admin)
    public Delivery assignDriver(Long deliveryId, Long driverId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // Vérification basique
        if (driver.getStatus() == DriverStatus.OFFLINE) {
            throw new RuntimeException("Ce livreur est hors ligne.");
        }

        // RÈGLE 2 (Partie A) : Vérifier la capacité actuelle
        long currentLoad = deliveryRepository.countActiveDeliveries(driverId);

        if (currentLoad >= MAX_CAPACITY) {
            throw new RuntimeException("Ce livreur est complet (" + currentLoad + "/" + MAX_CAPACITY + " commandes).");
        }

        // Assigner la commande
        delivery.setDriverId(driverId);
        delivery.setStatus(DeliveryStatus.ASSIGNED);

        // RÈGLE 2 (Partie B) : Si après cet ajout, il atteint 5, on le met BUSY
        if (currentLoad + 1 >= MAX_CAPACITY) {
            driver.setStatus(DriverStatus.BUSY);
        } else {
            // Sinon il reste AVAILABLE (au cas où il était autre chose)
            driver.setStatus(DriverStatus.AVAILABLE);
        }

        driverRepository.save(driver);

        try {
            orderRestClient.updateOrderStatus(delivery.getOrderId(), "ASSIGNED");
        } catch (Exception e) {
            System.err.println("Erreur sync Order-Service: " + e.getMessage());
        }

        return deliveryRepository.save(delivery);
    }

    // 4. Mettre à jour le statut (Logique Livreur)
    public Delivery updateStatus(Long deliveryId, DeliveryStatus newStatus) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        delivery.setStatus(newStatus);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // SYNC ORDER SERVICE
        try {
            String statusToSend = newStatus.name();
            if (newStatus == DeliveryStatus.PICKED_UP) statusToSend = "ON_WAY";
            orderRestClient.updateOrderStatus(delivery.getOrderId(), statusToSend);
        } catch (Exception e) { System.err.println("Erreur sync: " + e.getMessage()); }

        // RÈGLE 2 (Partie C) : Mise à jour du statut du chauffeur
        if (delivery.getDriverId() != null) {
            Long driverId = delivery.getDriverId();
            Driver driver = driverRepository.findById(driverId).orElse(null);

            if (driver != null) {
                // Si la commande est finie (DELIVERED ou CANCELLED), cela libère un slot
                if (newStatus == DeliveryStatus.DELIVERED || newStatus == DeliveryStatus.CANCELLED) {
                    long currentLoad = deliveryRepository.countActiveDeliveries(driverId);

                    // S'il a moins de 5 commandes actives maintenant, il redevient DISPONIBLE
                    if (currentLoad < MAX_CAPACITY) {
                        driver.setStatus(DriverStatus.AVAILABLE);
                        driverRepository.save(driver);
                    }
                }
            }
        }

        return savedDelivery;
    }
    public Driver getDriverByEmail(String email) {
        return driverRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Driver not found with email: " + email));
    }

    public List<Delivery> getDeliveriesByDriverId(Long driverId) {
        return deliveryRepository.findByDriverId(driverId);
    }

    public Driver updateDriver(Long id, Driver driverUpdates) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // On ne met à jour que ce qui est permis
        if(driverUpdates.getName() != null) driver.setName(driverUpdates.getName());
        if(driverUpdates.getCity() != null) driver.setCity(driverUpdates.getCity());
        if(driverUpdates.getEmail() != null) driver.setEmail(driverUpdates.getEmail());

        // On ne touche PAS au statut ici (c'est métier)

        return driverRepository.save(driver);
    }

    // 5. Lister les livreurs d'une ville
    public List<Driver> getDriversByCity(String city) {
        return driverRepository.findByCity(city);
    }

    // --- GESTION LIVREURS (ADMIN) ---

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livreur introuvable"));

        // RÈGLE 1 : Vérifier s'il a des livraisons actives
        long activeDeliveries = deliveryRepository.countActiveDeliveries(id);

        if (activeDeliveries > 0) {
            throw new RuntimeException("Impossible de supprimer : Le livreur a " + activeDeliveries + " livraison(s) en cours !");
        }

        // Si on est ici, c'est qu'il est libre, on peut supprimer
        driverRepository.deleteById(id);
    }

    // --- GESTION LIVRAISONS (ADMIN) ---

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

}