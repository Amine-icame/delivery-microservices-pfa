package com.example.customer_service.dto;

import lombok.Data;

@Data
public class CustomerResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String phoneNumber;
}