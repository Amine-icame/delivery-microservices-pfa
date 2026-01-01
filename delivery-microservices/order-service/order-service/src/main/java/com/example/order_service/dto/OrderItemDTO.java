package com.example.order_service.dto;
import lombok.Data;

@Data
public class OrderItemDTO {
    private Long productId;
    private int quantity;
}