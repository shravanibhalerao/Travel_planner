package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    // All messages ordered newest first
    List<ContactMessage> findAllByOrderByCreatedAtDesc();

    // Unread messages only
    List<ContactMessage> findByReadFalseOrderByCreatedAtDesc();

    // Count of unread messages (useful for admin badge)
    long countByReadFalse();
}