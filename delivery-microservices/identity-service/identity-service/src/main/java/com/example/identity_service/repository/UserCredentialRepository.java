package com.example.identity_service.repository;


import com.example.identity_service.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {
    // Nouvelle méthode magique : Cherche par Nom OU par Email
    Optional<UserCredential> findByNameOrEmail(String name, String email);
}