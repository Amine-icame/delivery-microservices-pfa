package com.example.delivery_service.dto;

import lombok.Data;

@Data
public class DriverRegisterDTO {
    private String firstName; // Reçu du Frontend via Identity
    private String lastName;  // Reçu du Frontend via Identity
    private String email;
    private String city;
    // On ignore les autres champs (password, role) qui ne servent pas ici
}