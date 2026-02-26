package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Hotel;
import com.travelplaner.travelplaner.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    @Autowired private HotelRepository hotelRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Hotel>> search(@RequestParam String destination) {
        List<Hotel> results = hotelRepository
                .findByLocationContainingIgnoreCaseOrCountryContainingIgnoreCaseOrAreaContainingIgnoreCase(
                        destination, destination, destination);
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<Hotel>> getAll() {
        return ResponseEntity.ok(hotelRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getById(@PathVariable Long id) {
        return hotelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}