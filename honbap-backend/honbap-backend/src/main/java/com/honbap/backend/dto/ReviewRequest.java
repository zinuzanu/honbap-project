package com.honbap.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {
    private Long userId;
    private Long restaurantId;
    private int rating;
    private String content;
    private String imageUrl;
    private boolean receiptVerified;
}
