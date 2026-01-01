package com.example.identity_service.client;

import com.example.identity_service.dto.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "customer-service")
public interface CustomerRestClient {
    @PostMapping("/api/customers")
    void createCustomer(@RequestBody RegisterRequest request);
    // On envoie tout le paquet, le CustomerService triera ce dont il a besoin
}
