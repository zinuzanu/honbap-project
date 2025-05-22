package com.honbap.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageService {

    private final String uploadDir = "uploads"; // 저장 디렉토리

    public String saveImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            Path path = Paths.get(uploadDir, filename);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename; // 프론트에서 접근 가능한 URL 경로
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패", e);
        }
    }
}
