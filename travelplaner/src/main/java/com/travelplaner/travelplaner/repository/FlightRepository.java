package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    // Uses Spring Data derived query — no @Query needed
    // Matches whatever fields Flight.java actually has
    // OPTION A: if Flight.java has 'departureCity' and 'arrivalCity'
    List<Flight> findByDepartureCityContainingIgnoreCaseAndArrivalCityContainingIgnoreCase(
        String departureCity,
        String arrivalCity
    );

    // This method name must match what FlightController/BookingService calls
    // If they call searchFlights(source, destination), add this default method:
    default List<Flight> searchFlights(String source, String destination) {
        return findByDepartureCityContainingIgnoreCaseAndArrivalCityContainingIgnoreCase(
            source, destination
        );
    }
}