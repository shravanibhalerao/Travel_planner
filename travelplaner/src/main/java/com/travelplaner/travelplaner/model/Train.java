package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "trains")
public class Train {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;           // e.g. "Rajdhani Express"
    private String operator;       // e.g. "Indian Railways"
    private String type;           // express / premium / super-fast / luxury / local

    private String source;
    private String destination;
    private String departTime;
    private String arrivalTime;
    private String duration;
    private String distance;

    private Double price;
    private Double originalPrice;
    private Integer availability;  // seats available
    private Integer totalSeats;

    private Double rating;
    private Integer reviews;

    private String image;

    @Column(columnDefinition = "TEXT")
    private String amenities;      // comma-separated: "AC,WiFi,Food,Charging"

    public Train() {}

    @Transient
    public List<String> getAmenitiesList() {
        if (amenities == null || amenities.trim().isEmpty()) return List.of();
        return Arrays.stream(amenities.split(","))
                .map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ─── Getters and Setters ───

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDepartTime() { return departTime; }
    public void setDepartTime(String departTime) { this.departTime = departTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }
    public Integer getAvailability() { return availability; }
    public void setAvailability(Integer availability) { this.availability = availability; }
    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}