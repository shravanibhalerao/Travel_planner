package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String operator;
    private String busType;
    private String category;

    private String departureTime;
    private String arrivalTime;
    private String departureCity;
    private String arrivalCity;
    private String duration;
    private String distance;

    private Double price;
    private Double originalPrice;
    private Double rating;
    private Integer reviews;
    private Integer availableSeats;
    private Integer totalSeats;
    private String seatsLayout;
    private String image;

    @Column(columnDefinition = "TEXT")
    private String amenities; // stored as comma-separated e.g. "WiFi,AC,Blanket"

    // ─── Required by JPA — DO NOT REMOVE ───
    public Bus() {}

    // ─── Full constructor ───
    public Bus(String name, String operator, String busType, String category,
               String departureTime, String arrivalTime,
               String departureCity, String arrivalCity,
               String duration, String distance,
               Double price, Double originalPrice,
               Double rating, Integer reviews,
               Integer availableSeats, Integer totalSeats,
               String seatsLayout, String image, String amenities) {
        this.name = name;
        this.operator = operator;
        this.busType = busType;
        this.category = category;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.departureCity = departureCity;
        this.arrivalCity = arrivalCity;
        this.duration = duration;
        this.distance = distance;
        this.price = price;
        this.originalPrice = originalPrice;
        this.rating = rating;
        this.reviews = reviews;
        this.availableSeats = availableSeats;
        this.totalSeats = totalSeats;
        this.seatsLayout = seatsLayout;
        this.image = image;
        this.amenities = amenities;
    }

    // ─── This converts "WiFi,AC,Blanket" → ["WiFi","AC","Blanket"] for React ───
    // @Transient means JPA ignores this column, but Jackson includes it in JSON
    @Transient
    public List<String> getAmenitiesList() {
        if (amenities == null || amenities.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(amenities.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ─── Getters and Setters ───

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDepartureCity() { return departureCity; }
    public void setDepartureCity(String departureCity) { this.departureCity = departureCity; }

    public String getArrivalCity() { return arrivalCity; }
    public void setArrivalCity(String arrivalCity) { this.arrivalCity = arrivalCity; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public String getSeatsLayout() { return seatsLayout; }
    public void setSeatsLayout(String seatsLayout) { this.seatsLayout = seatsLayout; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}