package com.honbap.backend.service;

import com.honbap.backend.dto.ReviewRequest;
import com.honbap.backend.model.Review;
import com.honbap.backend.model.User;
import com.honbap.backend.model.Restaurant;
import com.honbap.backend.repository.ReviewRepository;
import com.honbap.backend.repository.UserRepository;
import com.honbap.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    // ✅ 리뷰 저장
    public Review saveReview(ReviewRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 음식점입니다."));

        Review review = new Review();
        review.setUser(user);
        review.setRestaurant(restaurant);
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setImageUrl(request.getImageUrl());
        review.setReceiptVerified(request.isReceiptVerified());
        // createdAt은 @PrePersist로 자동 처리됨

        return reviewRepository.save(review);
    }

    // ✅ 특정 음식점 리뷰 조회
    public List<Review> getReviewsByRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurantId(restaurantId);
    }

    // ✅ 평균 별점 조회
    public Double getAverageRating(Long restaurantId) {
        Double avg = reviewRepository.findAverageRatingByRestaurantId(restaurantId);
        return avg != null ? Math.round(avg * 10) / 10.0 : 0.0; // 소수점 첫째자리 반올림
    }


    public Review findById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }

    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰가 존재하지 않습니다."));

        if (!review.getUser().getId().equals(userId)) {
            throw new SecurityException("리뷰 삭제 권한이 없습니다.");
        }

        // ✅ 이미지 파일이 존재하면 삭제
        String imageUrl = review.getImageUrl();
        if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
            String fileName = imageUrl.replace("/uploads/", "");
            Path path = Paths.get("uploads", fileName);
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                System.err.println("⚠️ 이미지 삭제 실패: " + path.toString());
                // 실패해도 리뷰 삭제는 진행함
            }
        }

        // ✅ 리뷰 DB에서 삭제
        reviewRepository.delete(review);
    }

    // ✅ 수정
    public Review updateReview(Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰가 존재하지 않습니다."));
        if (!review.getUser().getId().equals(request.getUserId())) {
            throw new SecurityException("리뷰 수정 권한이 없습니다.");
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setImageUrl(request.getImageUrl());
        review.setReceiptVerified(request.isReceiptVerified());
        return reviewRepository.save(review);
    }


}
