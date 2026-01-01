package com.example.identity_service.client;

import com.example.identity_service.dto.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "delivery-service")
public interface DeliveryRestClient {
    @PostMapping("/api/deliveries/drivers")
    void createDriver(@RequestBody RegisterRequest request);
}