package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Flight;
import com.travelplaner.travelplaner.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class FlightController {

    @Autowired private FlightRepository flightRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Flight>> search(
            @RequestParam String source,
            @RequestParam String destination) {
        List<Flight> results = flightRepository.searchFlights(source, destination);
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<Flight>> getAll() {
        return ResponseEntity.ok(flightRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getById(@PathVariable Long id) {
        return flightRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}