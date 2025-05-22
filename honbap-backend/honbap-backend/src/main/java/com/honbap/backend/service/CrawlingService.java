package com.honbap.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.honbap.backend.model.Restaurant;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.JavascriptExecutor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CrawlingService {

    private final RestaurantService restaurantService;

    public void startCrawling() {
        System.out.println("\uD83D\uDEEB 크롤링 작업 시작!");

        List<Restaurant> restaurants = restaurantService.findAll();

        System.setProperty("webdriver.chrome.driver", "C:/chromedriver/chromedriver.exe");

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-gpu");

        WebDriver driver = new ChromeDriver(options);

        try {
            for (Restaurant restaurant : restaurants) {
                String dbName = restaurant.getName();
                String dbAddress = restaurant.getAddress();

                System.out.println("▶️ 검색할 음식점: " + dbName + " / " + dbAddress);

                boolean matched = searchAndMatch(driver, dbName, dbAddress, restaurant);

                if (!matched) {
                    System.out.println("❌ 최종 매칭 실패: " + dbName + " / " + dbAddress);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }

    private boolean searchAndMatch(WebDriver driver, String dbName, String dbAddress, Restaurant restaurant) throws InterruptedException {
        driver.get("https://map.naver.com/");
        Thread.sleep(1000);

        WebElement searchBox = driver.findElement(By.cssSelector("input.input_search"));
        searchBox.clear();
        searchBox.sendKeys(dbName);
        searchBox.sendKeys(Keys.ENTER);
        Thread.sleep(2000);

        List<WebElement> searchIframes = driver.findElements(By.cssSelector("iframe#searchIframe"));
        if (!searchIframes.isEmpty()) {
            driver.switchTo().frame(searchIframes.get(0));
            Thread.sleep(1500);

            List<WebElement> items = driver.findElements(By.cssSelector("li.VLTHu.OW9LQ"));
            System.out.println("🔎 리스트 결과 수: " + items.size());

            if (items.size() == 1) {
                driver.switchTo().defaultContent();
                Thread.sleep(1000);
                return checkDetailPage(driver, dbName, dbAddress, restaurant);
            }

            String dbRoadName = extractRoadName(dbAddress);

            for (WebElement item : items) {
                try {
                    String resultName = item.findElement(By.cssSelector("span.YwYLL")).getText();

                    try {
                        WebElement detailBtn = item.findElement(By.cssSelector("span._44_8"));
                        detailBtn.click();
                        Thread.sleep(300);
                    } catch (Exception ignored) {}

                    String resultRoadAddress = "";
                    try {
                        resultRoadAddress = item.findElement(By.cssSelector("span.hAvkz")).getText();
                    } catch (Exception ignored) {}

                    System.out.println("🍽️ 가게명: " + resultName + " / 도로명: " + resultRoadAddress);

                    if (resultName.contains(dbName) && (resultRoadAddress.isEmpty() ||
                            resultRoadAddress.contains(dbRoadName) || dbRoadName.contains(resultRoadAddress))) {
                        System.out.println("✅ 리스트 매칭 성공 → 상세페이지 진입");

                        WebElement link = item.findElement(By.cssSelector("a.ApCpt.k4f_J"));
                        link.click();
                        driver.switchTo().defaultContent();
                        Thread.sleep(2500);

                        return checkDetailPage(driver, dbName, dbAddress, restaurant);
                    }
                } catch (Exception e) {
                    System.out.println("❌ 리스트 아이템 파싱 실패: " + e.getMessage());
                }
            }

            driver.switchTo().defaultContent();
            return false;
        } else {
            return checkDetailPage(driver, dbName, dbAddress, restaurant);
        }
    }

    private boolean checkDetailPage(WebDriver driver, String dbName, String dbAddress, Restaurant restaurant) throws InterruptedException {
        try {
            List<WebElement> entryIframe = driver.findElements(By.cssSelector("iframe#entryIframe"));
            if (!entryIframe.isEmpty()) {
                driver.switchTo().frame(entryIframe.get(0));
                Thread.sleep(1000);

                String detailName = driver.findElement(By.cssSelector(".GHAhO")).getText();
                String detailAddress = driver.findElement(By.cssSelector(".LDgIH")).getText();

                System.out.println("🏠 상세 가게명: " + detailName + " / 상세 주소: " + detailAddress);

                boolean nameMatched = detailName.contains(dbName);
                boolean addressMatched = detailAddress.contains(dbAddress) || dbAddress.contains(detailAddress);

                if (nameMatched && addressMatched) {
                    System.out.println("✅ 상세페이지 매칭 성공!");

                    crawlAdditionalInfo(driver, restaurant);

                    driver.switchTo().defaultContent();
                    return true;
                } else {
                    System.out.println("❌ 상세페이지 매칭 실패.");
                    driver.switchTo().defaultContent();
                    return false;
                }
            } else {
                System.out.println("❌ 상세페이지 iframe 없음");
                return false;
            }
        } catch (Exception e) {
            System.out.println("❌ 상세페이지 파싱 실패: " + e.getMessage());
            return false;
        }
    }

    private void crawlAdditionalInfo(WebDriver driver, Restaurant restaurant) {
        try {
            StringBuilder openHourInfo = new StringBuilder();
            List<Map<String, String>> menuList = new ArrayList<>();
            List<String> menuImageUrls = new ArrayList<>();
            List<String> amenities = new ArrayList<>();
            List<String> imageUrls = new ArrayList<>();

            try {
                // 펼쳐보기 버튼 클릭
                List<WebElement> expandButtons = driver.findElements(By.cssSelector("span._UCia"));
                for (WebElement btn : expandButtons) {
                    try {
                        WebElement blindText = btn.findElement(By.cssSelector("span.place_blind"));
                        if (blindText.getText().contains("펼쳐보기")) {
                            btn.click();
                            Thread.sleep(1000);
                            break;
                        }
                    } catch (Exception ignored) {}
                }

                // ✅ 요일 + 운영시간을 함께 수집
                List<WebElement> dayBlocks = driver.findElements(By.cssSelector("div.w9QyJ")); // 각 요일 영역

                for (WebElement dayBlock : dayBlocks) {
                    try {
                        String day = dayBlock.findElement(By.cssSelector("span.i8cJw")).getText(); // 요일 (ex: 수)
                        String timeText = dayBlock.findElement(By.cssSelector("div.H3ua4")).getText(); // 시간 정보 (여러 줄일 수도)

                        openHourInfo.append(day).append("요일").append("\n");
                        openHourInfo.append(timeText).append("\n\n");
                    } catch (Exception ignored) {
                        // 일부 요소가 없을 수 있음 (정기 휴무 등)
                    }
                }

            } catch (Exception e) {
                System.out.println("❌ 운영시간 수집 실패: " + e.getMessage());
            }

            try {
                WebElement menuTab = driver.findElement(By.xpath("//span[text()='메뉴']"));
                JavascriptExecutor js = (JavascriptExecutor) driver;
                js.executeScript("arguments[0].click();", menuTab);
                Thread.sleep(1500);
            } catch (Exception e) {
                System.out.println("❌ 메뉴 탭 클릭 실패: " + e.getMessage());
            }

            try {
                List<WebElement> menuItems = driver.findElements(By.cssSelector("li.E2jtL"));
                for (WebElement item : menuItems) {
                    String name = item.findElement(By.cssSelector("span.lPzHi")).getText();
                    String price = "";
                    try {
                        price = item.findElement(By.cssSelector("div.GXS1X em")).getText();
                    } catch (Exception ignored) {}

                    Map<String, String> menu = new HashMap<>();
                    menu.put("name", name);
                    menu.put("price", price);
                    menuList.add(menu);
                }
            } catch (Exception e) {
                System.out.println("❌ 메뉴 수집 실패: " + e.getMessage());
            }

            try {
                List<WebElement> menuImages = driver.findElements(By.cssSelector("div.place_section img.K0PDV"));
                for (WebElement img : menuImages) {
                    String src = img.getAttribute("src");
                    if (src != null && !src.isEmpty()) {
                        menuImageUrls.add(src);
                    }
                    if (menuImageUrls.size() >= 4) break;
                }
            } catch (Exception e) {
                System.out.println("❌ 메뉴판 이미지 수집 실패: " + e.getMessage());
            }

            try {
                WebElement infoTab = driver.findElement(By.xpath("//span[text()='정보']"));
                JavascriptExecutor js = (JavascriptExecutor) driver;
                js.executeScript("arguments[0].click();", infoTab);
                Thread.sleep(1000);
            } catch (Exception e) {
                System.out.println("❌ 정보 탭 클릭 실패: " + e.getMessage());
            }

            try {
                List<WebElement> facilityItems = driver.findElements(By.cssSelector("ul.JU0iX li.c7TR6 div.owG4q"));
                for (WebElement item : facilityItems) {
                    amenities.add(item.getText().trim());
                }
            } catch (Exception e) {
                System.out.println("❌ 편의시설 수집 실패: " + e.getMessage());
            }

            try {
                List<WebElement> imageElements = driver.findElements(By.cssSelector("a.place_thumb img"));
                for (WebElement img : imageElements) {
                    String src = img.getAttribute("src");
                    if (src != null && !src.isEmpty()) {
                        imageUrls.add(src);
                    }
                    if (imageUrls.size() >= 2) break;
                }
            } catch (Exception e) {
                System.out.println("❌ 대표 이미지 수집 실패: " + e.getMessage());
            }

            updateRestaurantInfo(restaurant, openHourInfo.toString(), menuList, menuImageUrls, imageUrls, amenities);

        } catch (Exception e) {
            System.out.println("❌ 전체 크롤링 실패: " + e.getMessage());
        }
    }

    private void updateRestaurantInfo(Restaurant restaurant,
                                      String openHours,
                                      List<Map<String, String>> menuList,
                                      List<String> menuImageUrls,
                                      List<String> imageUrls,
                                      List<String> amenities) {
        restaurant.setOpenHours(openHours.trim());
        restaurant.setMenuInfo(toJson(menuList));
        restaurant.setMenuImages(toJson(menuImageUrls));
        restaurant.setImages(toJson(imageUrls));
        restaurant.setAmenities(toJson(amenities));

        restaurantService.save(restaurant);
    }

    private String toJson(Object data) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            System.out.println("❌ JSON 변환 실패: " + e.getMessage());
            return "[]";
        }
    }

    private String extractRoadName(String fullAddress) {
        if (fullAddress == null || fullAddress.isEmpty()) return "";
        String[] parts = fullAddress.split(" ");
        if (parts.length >= 3) {
            StringBuilder roadName = new StringBuilder();
            for (int i = 2; i < parts.length; i++) {
                roadName.append(parts[i]).append(" ");
            }
            return roadName.toString().trim();
        }
        return fullAddress;
    }
}