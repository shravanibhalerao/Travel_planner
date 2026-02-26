package com.travelplaner.travelplaner.model;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "tour_categories")
public class TourCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name", nullable = false, length = 100)
    private String categoryName;

    // One category can have many destinations
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<TourDestination> destinations;

    // 🔹 Default Constructor
    public TourCategory() {
    }

    // 🔹 Constructor
    public TourCategory(String categoryName) {
        this.categoryName = categoryName;
    }

    // 🔹 Getters & Setters

    public Long getId() {
        return id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public TourCategory(String categoryName, List<TourDestination> destinations) {
		super();
		this.categoryName = categoryName;
		this.destinations = destinations;
	}

	public List<TourDestination> getDestinations() {
        return destinations;
    }

    public void setDestinations(List<TourDestination> destinations) {
        this.destinations = destinations;
    }

    // 🔹 Optional: toString()
    @Override
    public String toString() {
        return "TourCategory{" +
                "id=" + id +
                ", categoryName='" + categoryName + '\'' +
                '}';
    }
}