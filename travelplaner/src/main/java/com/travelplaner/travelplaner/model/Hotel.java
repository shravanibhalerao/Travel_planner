package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hotels")
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String country;
    private String area;

    private double rating;
    private int reviews;

    private double price;
    private double taxes;
    private Double originalPrice;

    private String image;
    private String stars;
    private String type;         // 5star / budget / resort

    @Column(length = 1000)
    private String amenities;    // comma-separated

    @Column(length = 2000)
    private String fullDescription;

	public Hotel(String name, String location, String country, String area, double rating, int reviews, double price,
			double taxes, Double originalPrice, String image, String stars, String type, String amenities,
			String fullDescription) {
		super();
		this.name = name;
		this.location = location;
		this.country = country;
		this.area = area;
		this.rating = rating;
		this.reviews = reviews;
		this.price = price;
		this.taxes = taxes;
		this.originalPrice = originalPrice;
		this.image = image;
		this.stars = stars;
		this.type = type;
		this.amenities = amenities;
		this.fullDescription = fullDescription;
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

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getArea() {
		return area;
	}

	public void setArea(String area) {
		this.area = area;
	}

	public Hotel() {
		super();
		// TODO Auto-generated constructor stub
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

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public double getTaxes() {
		return taxes;
	}

	public void setTaxes(double taxes) {
		this.taxes = taxes;
	}

	public Double getOriginalPrice() {
		return originalPrice;
	}

	public void setOriginalPrice(Double originalPrice) {
		this.originalPrice = originalPrice;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getStars() {
		return stars;
	}

	public void setStars(String stars) {
		this.stars = stars;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getAmenities() {
		return amenities;
	}

	public void setAmenities(String amenities) {
		this.amenities = amenities;
	}

	public String getFullDescription() {
		return fullDescription;
	}

	public void setFullDescription(String fullDescription) {
		this.fullDescription = fullDescription;
	}
}