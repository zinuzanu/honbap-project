package com.honbap.backend.dto;

import com.honbap.backend.model.Restaurant;
import lombok.Getter;

@Getter
public class RestaurantSearchResponse {
    private Long id;
    private String name;
    private String categoryName;
    private String address;
    private Double lat;
    private Double lng;
    private double averageRating;
    private int reviewCount;

    public RestaurantSearchResponse(Restaurant r, double averageRating, int reviewCount) {
        this.id = r.getId();
        this.name = r.getName();
        this.categoryName = r.getCategoryName();
        this.address = r.getAddress();
        this.lat = r.getLat();
        this.lng = r.getLng();
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }
}