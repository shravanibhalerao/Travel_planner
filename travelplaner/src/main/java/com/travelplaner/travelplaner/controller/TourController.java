package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.dto.CategoryWithDestinationsDTO;
import com.travelplaner.travelplaner.dto.DestinationDTO;
import com.travelplaner.travelplaner.model.TourCategory;
import com.travelplaner.travelplaner.model.TourDestination;
import com.travelplaner.travelplaner.repository.TourCategoryRepository;
import com.travelplaner.travelplaner.repository.TourDestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;  // ✅ ADD THIS IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    @Autowired
    private TourCategoryRepository categoryRepo;

    @Autowired
    private TourDestinationRepository destinationRepo;

    @GetMapping("/categories")
    public List<TourCategory> getAllCategories() {
        return categoryRepo.findAll();
    }

    @GetMapping("/destinations/{categoryId}")
    public List<TourDestination> getDestinationsByCategory(
            @PathVariable Long categoryId) {
        return destinationRepo.findByCategoryId(categoryId);
    }

    @GetMapping("/full")
    @Transactional(readOnly = true)   // ✅ ADD THIS LINE HERE
    public List<CategoryWithDestinationsDTO> getCategoriesWithDestinations() {
        List<TourCategory> categories = categoryRepo.findAll();
        return categories.stream().map(category -> {
            List<DestinationDTO> destinationDTOs =
                    category.getDestinations()
                            .stream()
                            .map(dest -> new DestinationDTO(
                                    dest.getId(),
                                    dest.getName(),
                                    dest.getState(),
                                    dest.getImageUrl(),
                                    dest.getDescription()
                            ))
                            .collect(Collectors.toList());
            return new CategoryWithDestinationsDTO(
                    category.getId(),
                    category.getCategoryName(),
                    destinationDTOs
            );
        }).collect(Collectors.toList());
    }
}