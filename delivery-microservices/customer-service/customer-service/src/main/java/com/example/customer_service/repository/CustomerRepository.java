package com.example.customer_service.repository;


import com.example.customer_service.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Spring Data JPA génère tout seul findByEmail grâce au nom
    Customer findByEmail(String email);
}