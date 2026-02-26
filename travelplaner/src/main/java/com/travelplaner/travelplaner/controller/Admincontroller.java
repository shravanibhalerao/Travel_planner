package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Booking;
import com.travelplaner.travelplaner.model.User;
import com.travelplaner.travelplaner.repository.BookingRepository;
import com.travelplaner.travelplaner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ─── Add these two endpoints to your existing controllers ───────────────────

// 1. In BookingController.java  →  add this method:
//
//    @GetMapping("/all")
//    public ResponseEntity<List<Booking>> getAllBookings() {
//        return ResponseEntity.ok(bookingRepository.findAll());
//    }

// 2. In AuthController.java  →  add this method:
//
//    @GetMapping("/users")
//    public ResponseEntity<List<User>> getAllUsers() {
//        return ResponseEntity.ok(userRepository.findAll());
//    }

// ─── OR create this new AdminController.java ────────────────────────────────

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class Admincontroller {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository    userRepository;

    // GET /api/admin/bookings  →  all bookings
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    // GET /api/admin/users  →  all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}