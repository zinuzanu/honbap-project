package com.honbap.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewResponse {
    private Long id;
    private String content;
    private String imageUrl;
    private int rating;
    private boolean receiptVerified;
    private String createdAt;
    private String nickname;
    private Long userId;
    private String restaurantName;
    private String category; // ✅ 중분류 카테고리 추가

    public ReviewResponse(Long id, String content, String imageUrl, int rating, boolean receiptVerified,
                          String createdAt, String nickname, Long userId, String restaurantName, String category) {
        this.id = id;
        this.content = content;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.receiptVerified = receiptVerified;
        this.createdAt = createdAt;
        this.nickname = nickname;
        this.userId = userId;
        this.restaurantName = restaurantName;
        this.category = category; // ✅ 필드 할당
    }
}
