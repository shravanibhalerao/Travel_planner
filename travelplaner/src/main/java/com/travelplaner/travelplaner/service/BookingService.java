package com.travelplaner.travelplaner.service;

import com.travelplaner.travelplaner.dto.BookingRequest;
import com.travelplaner.travelplaner.model.*;
import com.travelplaner.travelplaner.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BusRepository busRepository;
    @Autowired private FlightRepository flightRepository;
    @Autowired private HotelRepository hotelRepository;
    @Autowired private CabRepository cabRepository;
    @Autowired private HolidayPackageRepository packageRepository;
    @Autowired private TrainRepository trainRepository;
    @Autowired private EmailService emailService;
    @Autowired private AlertService alertService;   // ← already injected ✓

    // ─────────────────────────────────────────────────────────────
    // BOOK
    // ─────────────────────────────────────────────────────────────
    public Booking book(BookingRequest req, String userEmail) {

        System.out.println("BookingService.book() called for: " + userEmail);
        System.out.println("bookingType = " + req.getBookingType());

        // 1️⃣ Load user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        if (req.getBookingType() == null || req.getBookingType().isBlank()) {
            throw new RuntimeException("bookingType is required");
        }

        // 2️⃣ Create booking object
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setBookingType(req.getBookingType().toUpperCase().trim());
        booking.setPassengerName(req.getPassengerName());
        booking.setPassengerEmail(req.getPassengerEmail());
        booking.setPassengerPhone(req.getPassengerPhone());
        booking.setPassengers(req.getPassengers());
        booking.setSource(req.getSource());
        booking.setDestination(req.getDestination());
        booking.setTravelDate(req.getTravelDate());
        booking.setReturnDate(req.getReturnDate());
        booking.setCabinClass(req.getCabinClass());
        booking.setTotalAmount(req.getTotalAmount());
        booking.setStatus("CONFIRMED");

        String prefix  = "TKT";
        String itemName = "Travel";

        // 3️⃣ Handle Booking Type
        switch (booking.getBookingType()) {

            case "BUS":
                if (req.getBusId() == null)
                    throw new RuntimeException("busId required");
                booking.setBusId(req.getBusId());
                prefix = "BUS";
                itemName = busRepository.findById(req.getBusId())
                        .map(Bus::getName)
                        .orElse("Bus #" + req.getBusId());
                break;

            case "FLIGHT":
                if (req.getFlightId() == null)
                    throw new RuntimeException("flightId required");
                booking.setFlightId(req.getFlightId());
                prefix = "FL";
                Flight flight = flightRepository.findById(req.getFlightId())
                        .orElseThrow(() -> new RuntimeException("Flight not found"));
                itemName = flight.getAirline() + " " + flight.getFlightCode();
                int seats = flight.getAvailableSeats() != null ? flight.getAvailableSeats() : 999;
                if (seats < req.getPassengers())
                    throw new RuntimeException("Not enough seats available");
                flight.setAvailableSeats(seats - req.getPassengers());
                flightRepository.save(flight);
                break;

            case "HOTEL":
                if (req.getHotelId() == null)
                    throw new RuntimeException("hotelId required");
                booking.setHotelId(req.getHotelId());
                prefix = "HTL";
                itemName = hotelRepository.findById(req.getHotelId())
                        .map(Hotel::getName)
                        .orElse("Hotel #" + req.getHotelId());
                break;

            case "CAB":
                if (req.getCabId() == null)
                    throw new RuntimeException("cabId required");
                booking.setCabId(req.getCabId());
                prefix = "CAB";
                itemName = cabRepository.findById(req.getCabId())
                        .map(Cab::getName)
                        .orElse("Cab #" + req.getCabId());
                break;

            case "PACKAGE":
                if (req.getPackageId() == null)
                    throw new RuntimeException("packageId required");
                booking.setPackageId(req.getPackageId());
                prefix = "PKG";
                itemName = packageRepository.findById(req.getPackageId())
                        .map(HolidayPackage::getName)
                        .orElse("Package #" + req.getPackageId());
                break;

            case "TRAIN":
                if (req.getBusId() == null)
                    throw new RuntimeException("trainId required");
                booking.setBusId(req.getBusId());
                prefix = "TRN";
                itemName = trainRepository.findById(req.getBusId())
                        .map(Train::getName)
                        .orElse("Train #" + req.getBusId());
                break;

            default:
                throw new RuntimeException("Invalid bookingType: " + booking.getBookingType());
        }

        // 4️⃣ Generate Ticket ID
        String date = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String shortUUID = UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();
        booking.setTicketId("TKT-" + prefix + "-" + date + "-" + shortUUID);

        // 5️⃣ Save booking
        Booking saved = bookingRepository.save(booking);
        System.out.println("✅ Booking saved: " + saved.getTicketId());

        // 6️⃣ Send email confirmation
        try {
            emailService.sendConfirmationEmail(saved, itemName);
            System.out.println("✅ Email sent for: " + saved.getTicketId());
        } catch (Exception e) {
            System.out.println("⚠️ Email failed (booking still saved): " + e.getMessage());
        }

        // 7️⃣ Send real-time alert  ← THIS WAS MISSING
        try {
            alertService.sendBookingAlert(saved);
            System.out.println("✅ Alert sent for: " + saved.getTicketId());
        } catch (Exception e) {
            System.out.println("⚠️ Alert failed (booking still saved): " + e.getMessage());
        }

        return saved;
    }

    // ─────────────────────────────────────────────────────────────
    // GET USER BOOKINGS
    // ─────────────────────────────────────────────────────────────
    public List<Booking> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserOrderByBookedAtDesc(user);
    }

    // ─────────────────────────────────────────────────────────────
    // CANCEL
    // ─────────────────────────────────────────────────────────────
    public Booking cancel(Long bookingId, String userEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail))
            throw new RuntimeException("Unauthorized");

        if ("CANCELLED".equals(booking.getStatus()))
            throw new RuntimeException("Already cancelled");

        booking.setStatus("CANCELLED");
        Booking cancelled = bookingRepository.save(booking);

        // Send cancellation alert  ← also trigger alert on cancel
        try {
            alertService.sendBookingAlert(cancelled);
            System.out.println("✅ Cancellation alert sent for: " + cancelled.getTicketId());
        } catch (Exception e) {
            System.out.println("⚠️ Cancellation alert failed: " + e.getMessage());
        }

        return cancelled;
    }
}