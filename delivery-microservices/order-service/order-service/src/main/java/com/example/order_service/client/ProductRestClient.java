package com.example.order_service.client;

import com.example.order_service.model.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service")
public interface ProductRestClient {
    @GetMapping("/api/products/{id}")
    Product findProductById(@PathVariable("id") Long id);
}