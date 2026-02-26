package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.dto.RegisterRequest;
import com.travelplaner.travelplaner.model.User;
import com.travelplaner.travelplaner.repository.UserRepository;
import com.travelplaner.travelplaner.service.JwtService;
import com.travelplaner.travelplaner.service.CustomUserDetailsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private CustomUserDetailsService customUserDetailsService; // ✅ added

    // ─── REGISTER ────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            response.put("success", false);
            response.put("message", "Email already registered. Please login.");
            return ResponseEntity.badRequest().body(response);
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            response.put("success", false);
            response.put("message", "Passwords do not match.");
            return ResponseEntity.badRequest().body(response);
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Registration successful! Please login.");
        return ResponseEntity.ok(response);
    }

    // ─── LOGIN ────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String email    = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "No account found with this email.");
            return ResponseEntity.badRequest().body(response);
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("success", false);
            response.put("message", "Incorrect password. Please try again.");
            return ResponseEntity.badRequest().body(response);
        }

        // ✅ Generate REAL JWT token using JwtService
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        // Build user data
        Map<String, Object> userData = new HashMap<>();
        userData.put("id",        user.getId());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName",  user.getLastName());
        userData.put("email",     user.getEmail());
        userData.put("name",      user.getFirstName() + " " + user.getLastName());
        userData.put("role",      user.getRole());

        response.put("success", true);
        response.put("message", "Login successful!");
        response.put("token",   token);  // ✅ Real JWT like eyJhbGci...
        response.put("data",    userData);

        return ResponseEntity.ok(response);
    }

    // ─── GET ALL USERS (for admin dashboard) ─────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}