package com.honbap.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/health")
    public String healthCheck() {
        return "서버 정상 작동 중!";
    }

    @GetMapping("/test")
    public Map<String, String> testApi() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "API 테스트 성공!");
        return response;
    }
}
