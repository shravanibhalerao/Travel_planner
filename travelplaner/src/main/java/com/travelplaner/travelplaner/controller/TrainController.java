package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Train;
import com.travelplaner.travelplaner.repository.TrainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainController {

    @Autowired
    private TrainRepository trainRepository;

    // Called by TrainsPage.jsx search (if you switch to API)
    // GET /api/trains/search?source=Mumbai&destination=Delhi
    @GetMapping("/search")
    public ResponseEntity<List<Train>> search(
            @RequestParam String source,
            @RequestParam String destination) {
        return ResponseEntity.ok(trainRepository.searchTrains(source, destination));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Train>> all() {
        return ResponseEntity.ok(trainRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Train> byId(@PathVariable Long id) {
        return trainRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}