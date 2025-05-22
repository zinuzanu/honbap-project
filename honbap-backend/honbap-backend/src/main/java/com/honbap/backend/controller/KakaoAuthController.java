package com.honbap.backend.controller;

import com.honbap.backend.security.JwtTokenProvider;
import com.honbap.backend.service.KakaoAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    public KakaoAuthController(KakaoAuthService kakaoAuthService, JwtTokenProvider jwtTokenProvider) {
        this.kakaoAuthService = kakaoAuthService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<Map<String, Object>> kakaoLogin(@RequestParam("code") String code) {
        System.out.println("🔹 [카카오 콜백] 인가 코드: " + code);

        Map<String, Object> userInfo = kakaoAuthService.getKakaoUserInfo(code);

        System.out.println("✅ [카카오 콜백] 유저 정보 조회 성공: " + userInfo);

        Long userId = (Long) userInfo.get("id");
        String token = jwtTokenProvider.createToken(userId.toString());

        System.out.println("🛡️ [카카오 콜백] JWT 발급 완료: " + token);

        userInfo.put("token", token);

        return ResponseEntity.ok(userInfo);
    }

}