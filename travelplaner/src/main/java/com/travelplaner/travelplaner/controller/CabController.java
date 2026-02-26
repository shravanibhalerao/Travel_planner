package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Cab;
import com.travelplaner.travelplaner.repository.CabRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cabs")
@CrossOrigin(origins = "*")
public class CabController {

    @Autowired private CabRepository cabRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Cab>> search(
            @RequestParam String source,
            @RequestParam String destination) {
        List<Cab> results = cabRepository
                .findByDepartureCityContainingIgnoreCaseAndArrivalCityContainingIgnoreCase(
                        source, destination);
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<Cab>> getAll() {
        return ResponseEntity.ok(cabRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cab> getById(@PathVariable Long id) {
        return cabRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}