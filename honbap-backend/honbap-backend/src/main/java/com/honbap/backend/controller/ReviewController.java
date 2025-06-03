package com.honbap.backend.controller;

import com.honbap.backend.dto.ReviewRequest;
import com.honbap.backend.dto.ReviewResponse;
import com.honbap.backend.model.Review;
import com.honbap.backend.service.ImageService;
import com.honbap.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ImageService imageService;

    // ✅ 리뷰 작성 (POST 요청)
    @PostMapping
    public ResponseEntity<Review> writeReview(
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        request.setUserId(userId); // ⭐ Request에 userId 직접 세팅
        Review savedReview = reviewService.saveReview(request);
        return ResponseEntity.ok(savedReview);
    }

    // ✅ 특정 음식점의 리뷰 목록 조회 (GET 요청)
    @GetMapping("/{restaurantId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRestaurant(@PathVariable Long restaurantId) {
        List<Review> reviews = reviewService.getReviewsByRestaurant(restaurantId);

        List<ReviewResponse> result = reviews.stream()
                .map(r -> new ReviewResponse(
                        r.getId(),
                        r.getContent(),
                        r.getImageUrl(),
                        r.getRating(),
                        r.isReceiptVerified(),
                        r.getCreatedAt().toString(),
                        r.getUser().getNickname(),
                        r.getUser().getId(),
                        r.getRestaurant().getName(),
                        r.getRestaurant().getCategoryName()
                ))
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ 특정 사용자의 리뷰 전체 조회 (마이페이지 용)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId)); // 🔥 여기서 변환 안 함!
    }


    @GetMapping("/average/{restaurantId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long restaurantId) {
        Double average = reviewService.getAverageRating(restaurantId);
        return ResponseEntity.ok(average);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal Long userId  // ✅ 로그인 사용자 ID 주입
    ) {
        Review review = reviewService.findById(reviewId);
        if (review == null) return ResponseEntity.notFound().build();

        // 업로드된 이미지가 있을 경우 파일도 삭제
        if (review.getImageUrl() != null && !review.getImageUrl().isEmpty()) {
            String relativePath = review.getImageUrl().replace("/uploads/", "");
            Path filePath = Paths.get("uploads", relativePath);
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("이미지 삭제 실패: " + filePath);
            }
        }

        // ✅ 사용자 권한 검증 포함한 삭제
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.ok().build();
    }



    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        request.setUserId(userId);
        Review updatedReview = reviewService.updateReview(reviewId, request);
        return ResponseEntity.ok(updatedReview);
    }
}
