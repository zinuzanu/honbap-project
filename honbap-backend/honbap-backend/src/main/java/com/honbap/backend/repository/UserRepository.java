package com.honbap.backend.repository;

import com.honbap.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 기존: Optional<User> findByKakaoId(String kakaoId);
    Optional<User> findByKakaoId(Long kakaoId); // ✅ String → Long 타입으로 변경
}
