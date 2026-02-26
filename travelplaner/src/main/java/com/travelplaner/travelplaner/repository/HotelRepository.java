package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT h FROM Hotel h WHERE " +
           "LOWER(h.location) LIKE LOWER(CONCAT('%', :dest, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :dest, '%'))")
    List<Hotel> findByLocationContainingIgnoreCaseOrCountryContainingIgnoreCaseOrAreaContainingIgnoreCase(
        @Param("dest") String location,
        @Param("dest") String country,
        @Param("dest") String area
    );
}
