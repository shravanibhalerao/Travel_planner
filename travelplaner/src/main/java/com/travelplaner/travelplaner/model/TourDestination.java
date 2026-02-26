package com.travelplaner.travelplaner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "tour_destinations")
public class TourDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String state;
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;
    // Many destinations belong to one category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private TourCategory category;

    // 🔹 Default Constructor
    public TourDestination() {
    }

    // 🔹 Constructor
    public TourDestination(String name, String state, TourCategory category) {
        this.name = name;
        this.state = state;
        this.category = category;
    }

    // 🔹 Getters and Setters

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getState() {
        return state;
    }

    public TourCategory getCategory() {
        return category;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setCategory(TourCategory category) {
        this.category = category;
    }
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public TourDestination(String name, String state, String imageUrl, String description, TourCategory category) {
		super();
		this.name = name;
		this.state = state;
		this.imageUrl = imageUrl;
		this.description = description;
		this.category = category;
	}

	public void setDescription(String description) {
        this.description = description;
    }
    // 🔹 Optional toString()
    @Override
    public String toString() {
        return "TourDestination{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", state='" + state + '\'' +
                '}';
    }
}