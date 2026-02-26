package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Booking;
import com.travelplaner.travelplaner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Used by BookingService.getUserBookings()
    List<Booking> findByUser(User user);

    // Ordered — latest first
    List<Booking> findByUserOrderByBookedAtDesc(User user);

    // Find by ticket ID
    Optional<Booking> findByTicketId(String ticketId);
}