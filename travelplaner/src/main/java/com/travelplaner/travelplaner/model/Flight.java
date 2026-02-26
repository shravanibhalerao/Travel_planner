package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String airline;          // e.g. "IndiGo"
    private String flightCode;       // e.g. "6E-204"
    private String logoUrl;          // airline logo image URL

    private String departureCity;
    private String arrivalCity;
    private String departureAirport; // e.g. "DEL"
    private String arrivalAirport;   // e.g. "BLR"
    private String departureTime;    // e.g. "06:30"
    private String arrivalTime;      // e.g. "09:00"
    private String duration;         // e.g. "2h 30m"
    private Integer durationMinutes; // e.g. 150 (for sorting)

    private Integer stops;           // 0 = non-stop, 1 = 1 stop
    private String stopInfo;         // e.g. "Non Stop" or "1 Stop"

    private Double price;
    private Double originalPrice;
    private String cabinClass;       // economy / business / premium

    private Boolean refundable;
    private Double rating;
    private Integer reviews;
    private Integer availableSeats;
    private Integer totalSeats;

    @Column(columnDefinition = "TEXT")
    private String amenities;        // comma-separated: "Meal,USB,WiFi"

    private String image;            // flight image URL

    // ─── JPA required ───
    public Flight() {}

    // ─── Converts "Meal,USB,WiFi" → ["Meal","USB","WiFi"] for React ───
    @Transient
    public List<String> getAmenitiesList() {
        if (amenities == null || amenities.trim().isEmpty()) return List.of();
        return Arrays.stream(amenities.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ─── Getters and Setters ───

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAirline() { return airline; }
    public void setAirline(String airline) { this.airline = airline; }

    public String getFlightCode() { return flightCode; }
    public void setFlightCode(String flightCode) { this.flightCode = flightCode; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getDepartureCity() { return departureCity; }
    public void setDepartureCity(String departureCity) { this.departureCity = departureCity; }

    public String getArrivalCity() { return arrivalCity; }
    public void setArrivalCity(String arrivalCity) { this.arrivalCity = arrivalCity; }

    public String getDepartureAirport() { return departureAirport; }
    public void setDepartureAirport(String departureAirport) { this.departureAirport = departureAirport; }

    public String getArrivalAirport() { return arrivalAirport; }
    public void setArrivalAirport(String arrivalAirport) { this.arrivalAirport = arrivalAirport; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getStops() { return stops; }
    public void setStops(Integer stops) { this.stops = stops; }

    public String getStopInfo() { return stopInfo; }
    public void setStopInfo(String stopInfo) { this.stopInfo = stopInfo; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public String getCabinClass() { return cabinClass; }
    public void setCabinClass(String cabinClass) { this.cabinClass = cabinClass; }

    public Boolean getRefundable() { return refundable; }
    public void setRefundable(Boolean refundable) { this.refundable = refundable; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}