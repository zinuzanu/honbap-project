package com.honbap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String content;
    private String imageUrl;
    private int rating;
    private boolean receiptVerified;
    private String createdAt;
    private String nickname;
    private Long userId;
}
