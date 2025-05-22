package com.honbap.backend.service;

import com.honbap.backend.model.User;
import com.honbap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class KakaoAuthService {

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    @Value("${kakao.token-url}")
    private String tokenUrl;

    @Value("${kakao.user-info-url}")
    private String userInfoUrl;

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public KakaoAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 🔹 카카오에서 액세스 토큰 가져오기
    public String getKakaoAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=authorization_code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&code=" + code;

        System.out.println("🚀 요청하는 인가 코드: " + code);

        HttpEntity<String> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, requestEntity, String.class);
            System.out.println("✅ 카카오 토큰 응답: " + response.getBody());
            JSONObject json = new JSONObject(response.getBody());
            return json.getString("access_token");
        } catch (HttpClientErrorException e) {
            String errorResponse = e.getResponseBodyAsString();
            System.out.println("❌ 카카오 토큰 요청 실패: " + errorResponse);

            if (errorResponse.contains("invalid_grant")) {
                throw new RuntimeException("인가 코드가 잘못되었거나 만료되었습니다. 새로운 인가 코드를 요청하세요.");
            }

            throw new RuntimeException("카카오 토큰 요청 실패", e);
        }
    }

    // 🔹 카카오에서 사용자 정보 가져오기
    public Map<String, Object> getKakaoUserInfo(String code) {
        String accessToken = getKakaoAccessToken(code);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, String.class);
            JSONObject json = new JSONObject(response.getBody());

            Long kakaoId = json.getLong("id");
            String nickname = "닉네임 없음";
            String email = "no-email";

            if (json.has("kakao_account")) {
                JSONObject kakaoAccount = json.getJSONObject("kakao_account");

                if (kakaoAccount.has("profile")) {
                    nickname = kakaoAccount.getJSONObject("profile").optString("nickname", nickname);
                }

                email = kakaoAccount.optString("email", email);
            }

            System.out.println("✅ 사용자 정보: 카카오 ID=" + kakaoId + ", 이메일=" + email + ", 닉네임=" + nickname);

            // 🔹 DB에 사용자 정보 저장 또는 조회
            User user;
            Optional<User> existingUser = userRepository.findByKakaoId(kakaoId);
            if (existingUser.isEmpty()) {
                user = new User(kakaoId, email, nickname);
                userRepository.save(user);
                System.out.println("✅ 새로운 사용자 저장 완료: " + user);
            } else {
                user = existingUser.get();
                System.out.println("✅ 기존 사용자 로그인: " + user);
            }

            // ✅ 사용자 정보 Map 생성 (user.id 포함)
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("kakaoId", kakaoId);
            userInfo.put("email", email);
            userInfo.put("nickname", nickname);

            return userInfo;

        } catch (HttpClientErrorException e) {
            System.out.println("❌ 카카오 사용자 정보 요청 실패: " + e.getResponseBodyAsString());
            throw new RuntimeException("카카오 사용자 정보 요청 실패", e);
        }
    }
}
