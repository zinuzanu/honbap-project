package com.honbap.backend.controller;

import com.honbap.backend.model.Restaurant;
import com.honbap.backend.service.KakaoMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/map")
public class KakaoMapController {

    private final KakaoMapService kakaoMapService;

    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam(defaultValue = "db") String source) {
        List<Restaurant> result = source.equals("api") ?
                kakaoMapService.getRestaurantsFromAPI() :
                kakaoMapService.getRestaurantsFromDB();
        return ResponseEntity.ok(result);
    }
}