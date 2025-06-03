package com.honbap.backend.controller;

import com.honbap.backend.dto.RestaurantSearchResponse;
import com.honbap.backend.model.Restaurant;
import com.honbap.backend.service.KakaoMapService;
import com.honbap.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/map")
public class KakaoMapController {

    private final KakaoMapService kakaoMapService;
    private final ReviewService reviewService;  // ✅ 추가

    @GetMapping("/search")
    public ResponseEntity<List<RestaurantSearchResponse>> searchRestaurants(
            @RequestParam(defaultValue = "db") String source
    ) {
        List<Restaurant> restaurants = source.equals("api") ?
                kakaoMapService.getRestaurantsFromAPI() :
                kakaoMapService.getRestaurantsFromDB();

        // ✅ Restaurant → RestaurantSearchResponse 변환하면서 리뷰 정보 포함
        List<RestaurantSearchResponse> result = restaurants.stream()
                .map(r -> {
                    double avg = reviewService.getAverageRating(r.getId());
                    int count = reviewService.getReviewsByRestaurant(r.getId()).size();
                    return new RestaurantSearchResponse(r, avg, count);
                })
                .toList();

        return ResponseEntity.ok(result);
    }
}
