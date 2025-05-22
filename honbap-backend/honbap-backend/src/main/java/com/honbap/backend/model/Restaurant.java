// ✅ Restaurant.java
package com.honbap.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "restaurant")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kakao_place_id", nullable = false)
    private String kakaoPlaceId;

    private String name;
    private String categoryName;
    private String address;
    private Double lat;
    private Double lng;
    private String phone;

    // ✅ 크롤링을 통한 통합 데이터
    @Column(columnDefinition = "TEXT")
    private String openHours; // 운영시간 + 브레이크타임 포함

    @Column(columnDefinition = "TEXT")
    private String menuInfo; // 메뉴 리스트 (name, price 포함한 JSON 형태 문자열)

    @Column(columnDefinition = "TEXT")
    private String menuImages; // 메뉴판 이미지 URL 리스트 (JSON 배열)

    @Column(columnDefinition = "TEXT")
    private String images; // 대표 이미지 URL 리스트 (JSON 배열)

    @Column(columnDefinition = "TEXT")
    private String amenities; // 편의시설 리스트 (JSON 배열)

    // 데이터 생성 시점
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
