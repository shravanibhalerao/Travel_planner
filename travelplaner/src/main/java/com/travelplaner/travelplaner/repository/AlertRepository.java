package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Personal alerts (userId matches) + broadcast alerts (userId is null)
    @Query("SELECT a FROM Alert a WHERE a.userId = :userId OR a.userId IS NULL ORDER BY a.createdAt DESC")
    List<Alert> findAlertsForUser(Long userId);

    // Unread count for a user (personal + broadcast)
    @Query("SELECT COUNT(a) FROM Alert a WHERE (a.userId = :userId OR a.userId IS NULL) AND a.read = false")
    long countUnreadForUser(Long userId);

    // Admin - all alerts
    List<Alert> findAllByOrderByCreatedAtDesc();

    // Mark all as read for a user
    @Modifying
    @Transactional
    @Query("UPDATE Alert a SET a.read = true WHERE a.userId = :userId OR a.userId IS NULL")
    void markAllReadForUser(Long userId);
    
}