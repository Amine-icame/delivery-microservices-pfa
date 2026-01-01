package com.example.order_service.service;

import com.example.order_service.client.CustomerRestClient;
import com.example.order_service.client.DeliveryRestClient;
import com.example.order_service.client.ProductRestClient;
import com.example.order_service.dto.OrderRequestDTO;
import com.example.order_service.entities.Order;
import com.example.order_service.entities.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.model.Customer;
import com.example.order_service.model.Product;
import com.example.order_service.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRestClient customerRestClient;
    private final ProductRestClient productRestClient;
    private final DeliveryRestClient deliveryRestClient;

    public OrderService(OrderRepository orderRepository, CustomerRestClient customerRestClient, ProductRestClient productRestClient,DeliveryRestClient deliveryRestClient) {
        this.orderRepository = orderRepository;
        this.customerRestClient = customerRestClient;
        this.productRestClient = productRestClient;
        this.deliveryRestClient = deliveryRestClient;

    }

    public Order createOrder(OrderRequestDTO request) {
        // 1. Vérifier le client via Feign
        Customer customer = customerRestClient.findCustomerById(request.getCustomerId());
        if (customer == null) throw new RuntimeException("Customer not found");

        // 2. Créer la commande
        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.CREATED);
        order.setTrackingNumber(UUID.randomUUID().toString()); // Génération du Tracking ID unique

        // 3. Traiter les produits et calculer le total
        List<OrderItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemDTO : request.getItems()) {
            Product product = productRestClient.findProductById(itemDTO.getProductId());
            if (product == null) throw new RuntimeException("Product not found ID: " + itemDTO.getProductId());

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .quantity(itemDTO.getQuantity())
                    .price(product.getPrice()) // On fige le prix
                    .order(order)
                    .build();

            items.add(orderItem);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setOrderItems(items);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        try {
            // On utilise l'adresse du client pour la livraison
            // (Assure-toi que customer.getAddress() n'est pas null, sinon mets une valeur par défaut)
            String deliveryAddress = customer.getAddress() != null ? customer.getAddress() : "Adresse inconnue";

            deliveryRestClient.createDelivery(savedOrder.getId(), deliveryAddress);

            System.out.println("Demande de livraison créée automatiquement pour la commande " + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de la livraison : " + e.getMessage());
            // On ne bloque pas la commande si la livraison échoue (Pattern Resilience),
            // mais dans un vrai projet on gérerait une transaction distribuée (Saga).
        }

        return savedOrder;
    }

    public Order getOrderByTrackingNumber(String trackingNumber) {
        return orderRepository.findByTrackingNumber(trackingNumber);
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 2. Supprimer une commande par ID
    public void deleteOrder(Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
        } else {
            throw new RuntimeException("Commande introuvable avec l'ID : " + id);
        }
    }

    // 3. Forcer un statut (Utile pour l'admin)
    public Order forceUpdateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));
        try {
            order.setStatus(OrderStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide : " + status);
        }
        return orderRepository.save(order);
    }

}