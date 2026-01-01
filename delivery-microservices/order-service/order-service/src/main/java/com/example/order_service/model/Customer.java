package com.example.order_service.model;
import lombok.Data;

@Data
public class Customer {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String address;
}