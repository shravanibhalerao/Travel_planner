package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.HolidayPackage;
import com.travelplaner.travelplaner.repository.HolidayPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
public class HolidayPackageController {

    @Autowired private HolidayPackageRepository packageRepository;

    @GetMapping("/search")
    public ResponseEntity<List<HolidayPackage>> search(@RequestParam String destination) {
        List<HolidayPackage> results = packageRepository
                .findByLocationContainingIgnoreCaseOrCountryContainingIgnoreCaseOrNameContainingIgnoreCase(
                        destination, destination, destination);
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<HolidayPackage>> getAll() {
        return ResponseEntity.ok(packageRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HolidayPackage> getById(@PathVariable Long id) {
        return packageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}