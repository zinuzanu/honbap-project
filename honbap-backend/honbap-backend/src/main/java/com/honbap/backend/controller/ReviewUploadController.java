package com.honbap.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class ReviewUploadController {

    private static final String UPLOAD_DIR = Paths.get("uploads").toFile().getAbsolutePath();

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            // 이미지 없이 리뷰만 작성
            return ResponseEntity.ok("");
        }

        // 파일 이름 처리
        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String uniqueName = UUID.randomUUID() + "." + extension;

        // 경로 생성
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        File dest = new File(UPLOAD_DIR + File.separator + uniqueName);
        file.transferTo(dest);

        // 정적 리소스 접근용 URL 반환
        return ResponseEntity.ok("/uploads/" + uniqueName);
    }
}
