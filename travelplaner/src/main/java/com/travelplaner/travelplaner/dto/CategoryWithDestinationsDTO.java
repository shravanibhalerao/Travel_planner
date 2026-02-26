package com.travelplaner.travelplaner.dto;

import java.util.List;

public class CategoryWithDestinationsDTO {

    private Long id;
    private String categoryName;
    private List<DestinationDTO> destinations;

    public CategoryWithDestinationsDTO(Long id, String categoryName,
                                       List<DestinationDTO> destinations) {
        this.id = id;
        this.categoryName = categoryName;
        this.destinations = destinations;
    }

    public Long getId() { return id; }
    public String getCategoryName() { return categoryName; }
    public List<DestinationDTO> getDestinations() { return destinations; }
}