package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Used by AuthController to check if email exists and to login
    Optional<User> findByEmail(String email);
}