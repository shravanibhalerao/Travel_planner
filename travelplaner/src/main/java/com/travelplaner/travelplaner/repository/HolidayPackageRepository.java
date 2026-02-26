package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.HolidayPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HolidayPackageRepository extends JpaRepository<HolidayPackage, Long> {

    @Query("SELECT p FROM HolidayPackage p WHERE " +
           "LOWER(p.location) LIKE LOWER(CONCAT('%', :dest, '%')) OR " +
           "LOWER(p.country) LIKE LOWER(CONCAT('%', :dest, '%')) OR " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :dest, '%'))")
    List<HolidayPackage> findByLocationContainingIgnoreCaseOrCountryContainingIgnoreCaseOrNameContainingIgnoreCase(
        @Param("dest") String location,
        @Param("dest") String country,
        @Param("dest") String name
    );
}
