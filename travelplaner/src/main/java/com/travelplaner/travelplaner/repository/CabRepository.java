package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Cab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CabRepository extends JpaRepository<Cab, Long> {

    @Query("SELECT c FROM Cab c WHERE " +
           "LOWER(c.departureCity) LIKE LOWER(CONCAT('%', :source, '%')) AND " +
           "LOWER(c.arrivalCity) LIKE LOWER(CONCAT('%', :destination, '%'))")
    List<Cab> findByDepartureCityContainingIgnoreCaseAndArrivalCityContainingIgnoreCase(
        @Param("source") String source,
        @Param("destination") String destination
    );
}

