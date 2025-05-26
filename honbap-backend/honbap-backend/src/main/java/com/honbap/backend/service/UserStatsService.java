package com.honbap.backend.service;

import com.honbap.backend.dto.UserStatsResponse;
import com.honbap.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserStatsService {

    private final ReviewRepository reviewRepository;

    public UserStatsResponse getUserStats(Long userId) {
        UserStatsResponse response = new UserStatsResponse();

        // 총 리뷰 수
        response.setTotalReviews(reviewRepository.countByUserId(userId));

        // 평균 별점
        Double avg = reviewRepository.findAverageRatingByUserId(userId);
        response.setAverageRating(avg != null ? avg : 0.0);

        // 카테고리별 리뷰 수
        Map<String, Long> categoryCounts = new HashMap<>();
        for (Object[] row : reviewRepository.countByCategoryForUser(userId)) {
            categoryCounts.put((String) row[0], (Long) row[1]);
        }
        response.setCategoryCounts(categoryCounts);

        // 월별 리뷰 수
        Map<String, Long> monthlyReviews = new LinkedHashMap<>();
        for (Object[] row : reviewRepository.countByMonthForUser(userId)) {
            monthlyReviews.put((String) row[0], (Long) row[1]);
        }
        response.setMonthlyReviews(monthlyReviews);

        return response;
    }
}
