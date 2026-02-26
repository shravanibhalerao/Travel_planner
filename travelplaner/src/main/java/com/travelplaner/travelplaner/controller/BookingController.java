package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.dto.BookingRequest;
import com.travelplaner.travelplaner.model.Booking;
import com.travelplaner.travelplaner.repository.BookingRepository;
import com.travelplaner.travelplaner.service.BookingService;
import com.travelplaner.travelplaner.service.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired private BookingService    bookingService;
    @Autowired private BookingRepository bookingRepository;
    @Autowired
    private JwtService jwtService;
    // ── ALL BOOKINGS (admin) ──────────────────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    // ── MY BOOKINGS (for AlertPage) ───────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null) return ResponseEntity.badRequest().body(Map.of("error", "No auth header"));
        try {
            return ResponseEntity.ok(bookingService.getUserBookings(extractEmail(authHeader)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── DEBUG TOKEN ───────────────────────────────────────────────────────────
    @GetMapping("/debug-token")
    public ResponseEntity<Map<String, String>> debugToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, String> info = new HashMap<>();
        info.put("received_header", String.valueOf(authHeader));
        if (authHeader != null) {
            try {
                String email = extractEmail(authHeader);
                info.put("extracted_email", email);
                info.put("status", "OK");
            } catch (Exception e) {
                info.put("error", e.getMessage());
                info.put("status", "FAILED");
            }
        } else {
            info.put("status", "NO_HEADER");
        }
        return ResponseEntity.ok(info);
    }

    // ── BOOK ──────────────────────────────────────────────────────────────────
    @PostMapping("/book")
    public ResponseEntity<?> book(
            @RequestBody BookingRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> debug = new HashMap<>();
        debug.put("step",        "1_received");
        debug.put("authHeader",  String.valueOf(authHeader));
        debug.put("bookingType", request.getBookingType());
        debug.put("flightId",    request.getFlightId());
        debug.put("busId",       request.getBusId());
        debug.put("passengers",  request.getPassengers());
        debug.put("totalAmount", request.getTotalAmount());
        System.out.println("=== BOOK CALLED === " + debug);

        if (authHeader == null || authHeader.isBlank()) {
            debug.put("error", "Authorization header missing");
            return ResponseEntity.badRequest().body(debug);
        }

        String userEmail;
        try {
            userEmail = extractEmail(authHeader);
            debug.put("step",  "2_email_ok");
            debug.put("email", userEmail);
        } catch (Exception e) {
            debug.put("error", "Token parse error: " + e.getMessage());
            return ResponseEntity.badRequest().body(debug);
        }

        try {
            Booking booking = bookingService.book(request, userEmail);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            debug.put("step",  "3_service_error");
            debug.put("error", e.getMessage());
            System.err.println("Service error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(debug);
        }
    }

    // ── MY TICKETS ────────────────────────────────────────────────────────────
    @GetMapping("/my-tickets")
    public ResponseEntity<?> myTickets(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null) return ResponseEntity.badRequest().body(Map.of("error", "No auth header"));
        try {
            return ResponseEntity.ok(bookingService.getUserBookings(extractEmail(authHeader)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────
    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancel(
            @PathVariable Long bookingId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null) return ResponseEntity.badRequest().body(Map.of("error", "No auth header"));
        try {
            return ResponseEntity.ok(bookingService.cancel(bookingId, extractEmail(authHeader)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── TOKEN PARSER ──────────────────────────────────────────────────────────
 // ── TOKEN PARSER ──────────────────────────────────────────────────────────
    private String extractEmail(String authHeader) {
        String token = authHeader.replaceFirst("(?i)^Bearer\\s+", "").trim();
        return jwtService.extractUsername(token);
    }
    }
