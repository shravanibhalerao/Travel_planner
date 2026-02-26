package com.travelplaner.travelplaner.dto;

public class DestinationDTO {

    private Long id;
    private String name;
    private String state;
    private String imageUrl;
    private String description;

    public DestinationDTO(Long id, String name, String state,
                          String imageUrl, String description) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getState() { return state; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
}