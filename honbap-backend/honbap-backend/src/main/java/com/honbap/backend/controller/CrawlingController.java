package com.honbap.backend.controller;

import com.honbap.backend.service.CrawlingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crawling")
@RequiredArgsConstructor
public class CrawlingController {

    private final CrawlingService crawlingService;

    @GetMapping("/start")
    public String startCrawling() {
        crawlingService.startCrawling();
        return "크롤링 작업을 시작했습니다!";
    }
}
