package com.honbap.backend.repository;

import com.honbap.backend.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // ✅ kakaoPlaceId로 중복 여부 확인용
    Optional<Restaurant> findByKakaoPlaceId(String kakaoPlaceId);

    // ✅ 지역 + 키워드로 DB 검색 (ex: 인천 + 맛집)
    List<Restaurant> findByAddressContainingAndNameContaining(String address, String name);

    List<Restaurant> findByAddressContaining(String regionName);
}
