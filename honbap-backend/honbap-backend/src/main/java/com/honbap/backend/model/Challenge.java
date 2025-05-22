package com.honbap.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "challenge")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Challenge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String conditionType; // ex: "REVIEW_COUNT"
    private int conditionValue;
    private String badgeImageUrl;
}