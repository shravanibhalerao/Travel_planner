package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;

@Entity
@Table(name = "holiday_packages")
public class HolidayPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String country;

    private double rating;
    private int reviews;

    private double price;
    private Double originalPrice;

    private String duration;     // "7 Days / 6 Nights"
    private String travelers;    // "2 Adults"
    private String category;     // Beach / Luxury / Adventure / Family / Cultural

    private String image;
    private String bestSeason;
    private String type;         // couple / honeymoon / adventure / family / cultural

    @Column(length = 500)
    private String highlights;   // comma-separated

    @Column(length = 2000)
    private String fullDescription;

    @Column(length = 3000)
    private String inclusions;   // comma-separated

    @Column(length = 2000)
    private String exclusions;   // comma-separated

	public HolidayPackage(String name, String location, String country, double rating, int reviews, double price,
			Double originalPrice, String duration, String travelers, String category, String image, String bestSeason,
			String type, String highlights, String fullDescription, String inclusions, String exclusions) {
		super();
		this.name = name;
		this.location = location;
		this.country = country;
		this.rating = rating;
		this.reviews = reviews;
		this.price = price;
		this.originalPrice = originalPrice;
		this.duration = duration;
		this.travelers = travelers;
		this.category = category;
		this.image = image;
		this.bestSeason = bestSeason;
		this.type = type;
		this.highlights = highlights;
		this.fullDescription = fullDescription;
		this.inclusions = inclusions;
		this.exclusions = exclusions;
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

	public Double getOriginalPrice() {
		return originalPrice;
	}

	public void setOriginalPrice(Double originalPrice) {
		this.originalPrice = originalPrice;
	}

	public String getDuration() {
		return duration;
	}

	public void setDuration(String duration) {
		this.duration = duration;
	}

	public String getTravelers() {
		return travelers;
	}

	public void setTravelers(String travelers) {
		this.travelers = travelers;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getBestSeason() {
		return bestSeason;
	}

	public void setBestSeason(String bestSeason) {
		this.bestSeason = bestSeason;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getHighlights() {
		return highlights;
	}

	public void setHighlights(String highlights) {
		this.highlights = highlights;
	}

	public String getFullDescription() {
		return fullDescription;
	}

	public HolidayPackage() {
		super();
		// TODO Auto-generated constructor stub
	}

	public void setFullDescription(String fullDescription) {
		this.fullDescription = fullDescription;
	}

	public String getInclusions() {
		return inclusions;
	}

	public void setInclusions(String inclusions) {
		this.inclusions = inclusions;
	}

	public String getExclusions() {
		return exclusions;
	}

	public void setExclusions(String exclusions) {
		this.exclusions = exclusions;
	}
}