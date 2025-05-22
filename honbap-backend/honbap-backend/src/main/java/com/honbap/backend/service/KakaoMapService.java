package com.honbap.backend.service;

import com.honbap.backend.dto.RegionCoordinate;
import com.honbap.backend.model.Restaurant;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class KakaoMapService {

    @Value("${kakao.rest-api-key}")
    private String KAKAO_REST_API_KEY;

    private final RestaurantService restaurantService;

    // DB에서 불러오기
    public List<Restaurant> getRestaurantsFromDB() {
        return restaurantService.findAll();
    }

    // Kakao API에서 불러오기
    public List<Restaurant> getRestaurantsFromAPI() {
        List<RegionCoordinate> incheonRegions = List.of(
                new RegionCoordinate("인하대", 126.653850, 37.450430),
                new RegionCoordinate("인하공전", 126.657790, 37.448830),
                new RegionCoordinate("인하대역", 126.653144, 37.448457),
                new RegionCoordinate("인하 후문1", 126.655010, 37.452329),
                new RegionCoordinate("인하 후문2", 126.656139, 37.452516),
                new RegionCoordinate("인하 후문3", 126.657234, 37.451725),
                new RegionCoordinate("인하 후문4", 126.657458, 37.452217),
                new RegionCoordinate("인하 후문5", 126.657788, 37.453004),
                new RegionCoordinate("인하 후문6", 126.658603, 37.451342),
                new RegionCoordinate("인하 후문7", 126.659474, 37.451108),
                new RegionCoordinate("인하 후문8", 126.660145, 37.450934),
                new RegionCoordinate("인하대역 오피스텔1", 126.647501, 37.447390),
                new RegionCoordinate("인하대역 오피스텔2", 126.647097, 37.446848),
                new RegionCoordinate("인하대역 오피스텔3", 126.646819, 37.447642),
                new RegionCoordinate("인하대역 오피스텔4", 126.647826, 37.448062),
                new RegionCoordinate("인하대역 오피스텔5", 126.648152, 37.447088),
                new RegionCoordinate("인하대역헤리움1", 126.648571, 37.447580),
                new RegionCoordinate("인하대역헤리움2", 126.649464, 37.447416),
                new RegionCoordinate("인하대역헤리움3", 126.649224, 37.448159),
                new RegionCoordinate("인하대역헤리움4", 126.648117, 37.448038),
                new RegionCoordinate("인하대역헤리움5", 126.648369, 37.447160),
                new RegionCoordinate("인하아리스타", 126.651546, 37.447492)
        );

        List<Restaurant> allRestaurants = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate();

        for (RegionCoordinate region : incheonRegions) {
            for (int page = 1; page <= 3; page++) {
                String url = "https://dapi.kakao.com/v2/local/search/category.json?" +
                        "category_group_code=FD6" +
                        "&x=" + region.getX() +
                        "&y=" + region.getY() +
                        "&radius=500" +
                        "&size=15" +
                        "&page=" + page;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "KakaoAK " + KAKAO_REST_API_KEY);
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

                Map body = response.getBody();
                if (body == null) continue;

                List<Map<String, Object>> docs = (List<Map<String, Object>>) body.get("documents");
                Map meta = (Map) body.get("meta");

                List<Restaurant> saved = restaurantService.findOrFetchRestaurants(docs);
                allRestaurants.addAll(saved);

                if ((Boolean) meta.get("is_end")) break;
            }
        }
        return allRestaurants;
    }
}