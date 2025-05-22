//package com.honbap.backend.controller;
//
//import com.honbap.backend.service.KakaoAuthService;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.http.ResponseEntity;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/auth")
//public class AuthController {
//    private final KakaoAuthService kakaoAuthService;
//
//    public AuthController(KakaoAuthService kakaoAuthService) {
//        this.kakaoAuthService = kakaoAuthService;
//    }
//
//    // 🔹 프론트에서 카카오 로그인 요청을 받을 엔드포인트
//    @GetMapping("/kakao")
//    public ResponseEntity<?> kakaoLogin(@RequestParam("code") String code) {
//        Map<String, Object> userInfo = kakaoAuthService.getKakaoUserInfo(code);
//        return ResponseEntity.ok(userInfo);
//    }
//}