package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.TourDestination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourDestinationRepository 
        extends JpaRepository<TourDestination, Long> {

    // 🔹 Get all destinations by category ID
    List<TourDestination> findByCategoryId(Long categoryId);

    // 🔹 Get destinations by state (useful for filtering)
    List<TourDestination> findByStateIgnoreCase(String state);

    // 🔹 Search by destination name (partial search)
    List<TourDestination> findByNameContainingIgnoreCase(String name);
}