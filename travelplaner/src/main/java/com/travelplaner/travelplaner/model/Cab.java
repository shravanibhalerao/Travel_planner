package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cabs")
public class Cab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String operator;
    private String cabType;
    private String category;    // economy / sedan / suv / premium

    private String departure;
    private String departureCity;
    private String arrival;
    private String arrivalCity;

    private String duration;
    private String distance;

    private double price;
    private Double originalPrice;

    private double rating;
    private int reviews;
    private int availability;

    @Column(length = 500)
    private String amenities;   // comma-separated

    private String seatsLayout;
    private int totalSeats;

    private String image;
    private String driver;
    private double driverRating;
	public Cab() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Cab(String name, String operator, String cabType, String category, String departure, String departureCity,
			String arrival, String arrivalCity, String duration, String distance, double price, Double originalPrice,
			double rating, int reviews, int availability, String amenities, String seatsLayout, int totalSeats,
			String image, String driver, double driverRating) {
		super();
		this.name = name;
		this.operator = operator;
		this.cabType = cabType;
		this.category = category;
		this.departure = departure;
		this.departureCity = departureCity;
		this.arrival = arrival;
		this.arrivalCity = arrivalCity;
		this.duration = duration;
		this.distance = distance;
		this.price = price;
		this.originalPrice = originalPrice;
		this.rating = rating;
		this.reviews = reviews;
		this.availability = availability;
		this.amenities = amenities;
		this.seatsLayout = seatsLayout;
		this.totalSeats = totalSeats;
		this.image = image;
		this.driver = driver;
		this.driverRating = driverRating;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getOperator() {
		return operator;
	}
	public void setOperator(String operator) {
		this.operator = operator;
	}
	public String getCabType() {
		return cabType;
	}
	public void setCabType(String cabType) {
		this.cabType = cabType;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public String getDeparture() {
		return departure;
	}
	public void setDeparture(String departure) {
		this.departure = departure;
	}
	public String getDepartureCity() {
		return departureCity;
	}
	public void setDepartureCity(String departureCity) {
		this.departureCity = departureCity;
	}
	public String getArrival() {
		return arrival;
	}
	public void setArrival(String arrival) {
		this.arrival = arrival;
	}
	public String getArrivalCity() {
		return arrivalCity;
	}
	public void setArrivalCity(String arrivalCity) {
		this.arrivalCity = arrivalCity;
	}
	public String getDuration() {
		return duration;
	}
	public void setDuration(String duration) {
		this.duration = duration;
	}
	public String getDistance() {
		return distance;
	}
	public void setDistance(String distance) {
		this.distance = distance;
	}
	public double getPrice() {
		return price;
	}
	public void setPrice(double price) {
		this.price = price;
	}
	public Double getOriginalPrice() {
		return originalPrice;
	}
	public void setOriginalPrice(Double originalPrice) {
		this.originalPrice = originalPrice;
	}
	public double getRating() {
		return rating;
	}
	public void setRating(double rating) {
		this.rating = rating;
	}
	public int getReviews() {
		return reviews;
	}
	public void setReviews(int reviews) {
		this.reviews = reviews;
	}
	public int getAvailability() {
		return availability;
	}
	public void setAvailability(int availability) {
		this.availability = availability;
	}
	public String getAmenities() {
		return amenities;
	}
	public void setAmenities(String amenities) {
		this.amenities = amenities;
	}
	public String getSeatsLayout() {
		return seatsLayout;
	}
	public void setSeatsLayout(String seatsLayout) {
		this.seatsLayout = seatsLayout;
	}
	public int getTotalSeats() {
		return totalSeats;
	}
	public void setTotalSeats(int totalSeats) {
		this.totalSeats = totalSeats;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public String getDriver() {
		return driver;
	}
	public void setDriver(String driver) {
		this.driver = driver;
	}
	public double getDriverRating() {
		return driverRating;
	}
	public void setDriverRating(double driverRating) {
		this.driverRating = driverRating;
	}
}