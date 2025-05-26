package com.honbap.backend.dto;

import java.util.Map;

public class UserStatsResponse {

    private int totalReviews;
    private double averageRating;
    private Map<String, Long> categoryCounts;
    private Map<String, Long> monthlyReviews;

    public int getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(int totalReviews) {
        this.totalReviews = totalReviews;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Map<String, Long> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }

    public Map<String, Long> getMonthlyReviews() {
        return monthlyReviews;
    }

    public void setMonthlyReviews(Map<String, Long> monthlyReviews) {
        this.monthlyReviews = monthlyReviews;
    }
}
