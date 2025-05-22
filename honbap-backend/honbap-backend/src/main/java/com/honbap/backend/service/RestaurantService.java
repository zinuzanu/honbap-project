package com.honbap.backend.service;

import com.honbap.backend.model.Restaurant;
import com.honbap.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<Restaurant> findAll() {
        return restaurantRepository.findAll();
    }

    // ✅ 개별 저장용 메서드
    public Restaurant save(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> findOrFetchRestaurants(List<Map<String, Object>> kakaoDocs) {
        List<Restaurant> saved = new ArrayList<>();

        for (Map<String, Object> place : kakaoDocs) {
            String kakaoPlaceId = (String) place.get("id");

            Optional<Restaurant> optionalRestaurant = restaurantRepository.findByKakaoPlaceId(kakaoPlaceId);

            String newName = (String) place.get("place_name");
            String newAddress = (String) place.get("road_address_name");
            String newPhone = (String) place.get("phone");
            String newCategoryName = (String) place.get("category_name");  // ✅ 세부 카테고리 사용

            if (optionalRestaurant.isPresent()) {
                Restaurant existing = optionalRestaurant.get();
                boolean isUpdated = false;

                if (!Objects.equals(existing.getName(), newName)) {
                    existing.setName(newName);
                    isUpdated = true;
                }
                if (!Objects.equals(existing.getAddress(), newAddress)) {
                    existing.setAddress(newAddress);
                    isUpdated = true;
                }
                if (!Objects.equals(existing.getPhone(), newPhone)) {
                    existing.setPhone(newPhone);
                    isUpdated = true;
                }
                if (!Objects.equals(existing.getCategoryName(), newCategoryName)) {
                    existing.setCategoryName(newCategoryName);
                    isUpdated = true;
                }

                if (isUpdated) {
                    restaurantRepository.save(existing);
                    System.out.println("🔄 업데이트된 가게: " + existing.getName());
                }

                saved.add(existing);
            } else {
                Restaurant newRestaurant = new Restaurant();
                newRestaurant.setKakaoPlaceId(kakaoPlaceId);
                newRestaurant.setName(newName);
                newRestaurant.setCategoryName(newCategoryName);  // ✅ 여기
                newRestaurant.setAddress(newAddress);
                newRestaurant.setLat(Double.parseDouble((String) place.get("y")));
                newRestaurant.setLng(Double.parseDouble((String) place.get("x")));
                newRestaurant.setPhone(newPhone);
                newRestaurant.setCreatedAt(LocalDateTime.now());

                restaurantRepository.save(newRestaurant);
                saved.add(newRestaurant);
                System.out.println("🆕 새로 저장된 가게: " + newRestaurant.getName());
            }
        }

        return saved;
    }
}