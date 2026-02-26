package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    // ✅ Uses departureCity/arrivalCity — same pattern as Cab.java
    // No @Query needed — Spring generates it automatically
    List<Bus> findByDepartureCityContainingIgnoreCaseAndArrivalCityContainingIgnoreCase(
        String departureCity,
        String arrivalCity
    );

    // ✅ BookingService calls searchBuses(source, destination) — bridge it here
    default List<Bus> searchBuses(String source, String destination) {
        return findByDepartureCityContainingIgnoreCaseAndArrivalCityContainingIgnoreCase(
            source, destination
        );
    }
}