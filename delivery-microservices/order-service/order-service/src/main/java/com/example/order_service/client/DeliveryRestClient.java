package com.example.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "delivery-service")
public interface DeliveryRestClient {

    // On appelle le endpoint qu'on a déjà créé dans DeliveryController
    @PostMapping("/api/deliveries")
    void createDelivery(@RequestParam("orderId") Long orderId,
                        @RequestParam("address") String address);
}