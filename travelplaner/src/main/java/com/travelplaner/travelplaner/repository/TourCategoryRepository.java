package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.TourCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourCategoryRepository 
        extends JpaRepository<TourCategory, Long> {

    // 🔹 Find category by name (useful for admin panel or filtering)
    Optional<TourCategory> findByCategoryName(String categoryName);
    @Query("SELECT c FROM TourCategory c LEFT JOIN FETCH c.destinations")
    List<TourCategory> findAllWithDestinations();
}

