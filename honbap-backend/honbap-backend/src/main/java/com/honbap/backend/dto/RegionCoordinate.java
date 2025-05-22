package com.honbap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegionCoordinate {
    private String name;
    private double x; // 경도
    private double y; // 위도
}
