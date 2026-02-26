package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Bus;
import com.travelplaner.travelplaner.repository.BusRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "http://localhost:5173") // your React dev port
public class BusController {

    private final BusRepository busRepository;
    private Long getUserIdFromToken(String authHeader) {
        return 1L;  // ← this needs to be real
    }
    public BusController(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    // ─── Search buses by source and destination ───
    // Uses LIKE so "Delhi" matches "New Delhi, India" in DB
    @GetMapping("/search")
    public ResponseEntity<List<Bus>> searchBuses(
            @RequestParam String source,
            @RequestParam String destination) {

        List<Bus> buses = busRepository.searchBuses(source, destination);
        return ResponseEntity.ok(buses);
    }

    // ─── Get all buses (optional — useful for admin or testing) ───
    @GetMapping("/all")
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(busRepository.findAll());
    }

    // ─── Get single bus by ID (optional — for detail page) ───
    @GetMapping("/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable Long id) {
        return busRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}