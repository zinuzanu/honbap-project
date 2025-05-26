package com.honbap.backend.repository;

import com.honbap.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRestaurantId(Long restaurantId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId")
    Double findAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.user.id = :userId")
    Double findAverageRatingByUserId(@Param("userId") Long userId);

    @Query("SELECT r.restaurant.categoryName, COUNT(r) " +
            "FROM Review r WHERE r.user.id = :userId GROUP BY r.restaurant.categoryName")
    List<Object[]> countByCategoryForUser(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m') AS month, COUNT(r) " +
            "FROM Review r WHERE r.user.id = :userId GROUP BY month ORDER BY month")
    List<Object[]> countByMonthForUser(@Param("userId") Long userId);
}
