import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import MyPage from "./pages/MyPage";
import KakaoCallback from "./pages/KakaoCallback";
import KakaoMap from "./components/KakaoMap";
import LogoutButton from "./components/KakaoLogoutButton";
import OpenHoursDisplay from "./components/OpenHoursDisplay";
import RestaurantDetail from "./pages/RestaurantDetail";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import "./App.css";

function App() { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/kakao/callback" element={<KakaoCallback />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </Router>
  );
}

function Main() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [preSearchState, setPreSearchState] = useState(null);
  const [afterCardClick, setAfterCardClick] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [averageRating, setAverageRating] = useState(null);
  const sidebarContentRef = useRef(null);
  const mapRef = useRef(null);
  const [refreshReviews, setRefreshReviews] = useState(false);
  const handleResetToDefault = () => {
    setSelectedRestaurant(null);
    setSearchKeyword("");
    setSearched(false);
    setSearchResults([]);
    setPreSearchState(null);
    setAfterCardClick(false);
  };

  const handleRestaurantClick = (restaurant) => {
    if (!preSearchState) {
      setPreSearchState({ selectedRestaurant, searchResults, keyword: searchKeyword });
    }
    setAfterCardClick(true);
    setSelectedRestaurant(restaurant);
    setActiveTab("home");
    if (mapRef.current) {
      mapRef.current.highlightMarkerByRestaurant(restaurant);
    }
  };

  const handleSearch = (customKeyword = null) => {
  const keyword = (customKeyword ?? searchKeyword).trim().toLowerCase();
  if (!keyword) {
    setSearchResults([]);
    setSearched(false);
    return;
  }

  if (!preSearchState) {
    setPreSearchState({ selectedRestaurant, searchResults, keyword: searchKeyword });
  }

  setAfterCardClick(false);
  setSearched(true);

  const matched = restaurants.map((r) => {
    const name = (r.name || "").toLowerCase();
    const categoryName = (r.categoryName || "").toLowerCase();
    const categoryParts = categoryName.split(">").map((part) => part.trim()).filter(Boolean);
    let mainCategory = categoryParts.length > 1 ? categoryParts[1] : "";
    let subCategories = categoryParts.slice(2).join(",");

    mainCategory = mainCategory.toLowerCase();
    subCategories = subCategories.toLowerCase();

    let score = 0;
    if (mainCategory.includes(keyword)) score += 150;
    if (subCategories.includes(keyword)) score += 100;
    if (name.startsWith(keyword)) score += 80;
    if (name.includes(keyword)) score += 60;

    return { ...r, score };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);

  setSearchResults(matched);
  setSelectedRestaurant(null);
};


  const handleGoBack = () => {
    if (!preSearchState) return;
    if (afterCardClick) {
      setSelectedRestaurant(null);
      setAfterCardClick(false);
    } else {
      setSelectedRestaurant(preSearchState.selectedRestaurant);
      setSearchResults(preSearchState.searchResults);
      setSearchKeyword("");
      setPreSearchState(null);
      setSearched(false);
    }
  };

  const [showScrollBtn, setShowScrollBtn] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    if (sidebarContentRef.current.scrollTop > 300) {
      setShowScrollBtn(true);
    } else {
      setShowScrollBtn(false);
    }
  };

  const el = sidebarContentRef.current;
  if (el) {
    el.addEventListener("scroll", handleScroll);
  }

  return () => {
    if (el) el.removeEventListener("scroll", handleScroll);
  };
}, []);

  useEffect(() => {
    axios.get("http://localhost:8080/api/map/search", {
      params: { keyword: "음식점", region: "인천", source: "db" },
    })
      .then((res) => setRestaurants(res.data))
      .catch((err) => console.error("음식점 데이터 로드 실패:", err));
  }, []);

  // ✅ 평균 별점 조회용 useEffect
  useEffect(() => {
    if (!selectedRestaurant) {
      setAverageRating(null);
      return;
    }

    axios.get(`http://localhost:8080/api/reviews/average/${selectedRestaurant.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => setAverageRating(res.data))
      .catch((err) => {
        console.error("⭐ 평균 별점 조회 실패:", err);
        setAverageRating(null);
      });
  }, [selectedRestaurant]);

    return (
      <div className="full-page">
        <div className="top-right">
    {localStorage.getItem("token") ? (
      <>
        <LogoutButton />
        <button
          className="common-btn mypage-btn"
          onClick={() => window.location.href = "/mypage"}
        >
          마이페이지 📈
        </button>
      </>
    ) : (
      <button
        onClick={() => {
          const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=1e8516a460e4142752311c85872fdeb6&redirect_uri=http://localhost:5173/kakao/callback&response_type=code`;
          window.location.href = kakaoAuthURL;
        }}
        className="kakao-login-btn"
      >
        카카오 로그인
      </button>
    )}
  </div>


      <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "<" : ">"}
      </button>

      <div className={`sidebar ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {isSidebarOpen && (
          <>
            <div className="sidebar-top-bar">
              <input
                className="sidebar-search-input"
                type="text"
                placeholder="검색어 입력"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              />
              {selectedRestaurant || searched ? (
              <div className="reset-wrapper">
                <button className="reset-btn" onClick={handleResetToDefault}>
                  🏠
                </button>
              </div>
            ) : null}
              <button className="search-button" onClick={handleSearch}>🔍</button>
            </div>
            
            {preSearchState && (
              <div className="go-back-wrapper">
                <button className="go-back-btn" onClick={handleGoBack}>
                  {afterCardClick ? "← 뒤로가기" : "← 돌아가기"}
                </button>
              </div>
            )}

            
            <div className="sidebar-content" ref={sidebarContentRef}>
              {!selectedRestaurant && !searched && (
                <div className="category-buttons">
                  {[
                    { name: "한식", emoji: "🍚" },
                    { name: "중식", emoji: "🥡" },
                    { name: "일식", emoji: "🍣" },
                    { name: "양식", emoji: "🍝" },
                    { name: "분식", emoji: "🍜" },
                    { name: "패스트푸드", emoji: "🍔" },
                    { name: "치킨", emoji: "🍗" },
                    { name: "피자", emoji: "🍕" },
                    { name: "고기", emoji: "🥩" },
                    { name: "술집", emoji: "🍺" },
                    { name: "뷔페", emoji: "🍽️" },
                    { name: "카페", emoji: "☕" },
                  ].map(({ name, emoji }) => (
                    <button
                      key={name}
                      className="category-btn"
                      onClick={() => handleSearch(name)}
                    >
                      {emoji} {name}
                    </button>
                  ))}
                </div>
              )}
              {selectedRestaurant ? (
                <>
                  <div className="tab-buttons">
                    <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>홈</button>
                    {selectedRestaurant.menuInfo && JSON.parse(selectedRestaurant.menuInfo).length > 0 && (
                      <button className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}>메뉴</button>
                    )}
                    {selectedRestaurant.images && JSON.parse(selectedRestaurant.images).length > 0 && (
                      <button className={activeTab === "photos" ? "active" : ""} onClick={() => setActiveTab("photos")}>사진</button>
                    )}
                    {selectedRestaurant.amenities && JSON.parse(selectedRestaurant.amenities).length > 0 && (
                      <button className={activeTab === "amenities" ? "active" : ""} onClick={() => setActiveTab("amenities")}>서비스</button>
                    )}
                    <button className={activeTab === "review" ? "active" : ""} onClick={() => setActiveTab("review")}>리뷰</button>
                  </div>

                  {activeTab === "home" && (
                    <div className="info-section">
                      <h3>{selectedRestaurant.name}</h3>
                      <p className="address">{selectedRestaurant.address}</p>
                      <p className="phone">{selectedRestaurant.phone || "전화번호 없음"}</p>
                      {averageRating !== null && (
                        <p className="rating"><span className="star">⭐</span> 평균 별점: {averageRating.toFixed(1)} / 5</p>
                      )}  
                      {selectedRestaurant.openHours && (
                        <OpenHoursDisplay rawOpenHours={selectedRestaurant.openHours} />
                      )}
                    </div>
                  )}

                  {activeTab === "menu" && selectedRestaurant.menuInfo && (
                    <div className="info-section">
                      <ul>
                        {JSON.parse(selectedRestaurant.menuInfo).map((menu, idx) => (
                          <li key={idx}>{menu.name} {menu.price && `- ${menu.price}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "photos" && (
                    <div className="info-section">
                      
                      {/* 메뉴판 이미지 */}
                      {selectedRestaurant.menuImages && JSON.parse(selectedRestaurant.menuImages).length > 0 && (
                        <>
                          <h4 style={{ marginTop: "20px" }}>📋 메뉴판 사진</h4>
                          <div className="image-grid">
                            {JSON.parse(selectedRestaurant.menuImages).map((url, idx) => (
                              <img
                                key={`menu-${idx}`}
                                src={url}
                                alt={`메뉴판 이미지 ${idx + 1}`}
                                className="menu-image"
                                onClick={() => setLightboxImage(url)}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* 대표 이미지 */}
                      {selectedRestaurant.images && JSON.parse(selectedRestaurant.images).length > 0 && (
                        <>
                        <hr></hr>
                          <h4>📸 대표 사진</h4>
                          <div className="image-grid">
                            {JSON.parse(selectedRestaurant.images).map((url, idx) => (
                              <img
                                key={`main-${idx}`}
                                src={url}
                                alt={`대표 이미지 ${idx + 1}`}
                                className="main-image"
                                onClick={() => setLightboxImage(url)}
                              />
                            ))}
                          </div>
                        </>
                      )}

                    </div>
                  )}

                  {activeTab === "amenities" && selectedRestaurant.amenities && (
                    <div className="info-section">
                      <ul>
                        {JSON.parse(selectedRestaurant.amenities).map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "review" && (
                    <div className="info-section">
                      {/* ✅ 항상 리뷰 리스트는 표시 */}
                      <ReviewList
                        restaurantId={selectedRestaurant.id}
                        refreshTrigger={refreshReviews}
                        setLightboxImage={setLightboxImage}
                      />

                      {/* ✅ 로그인한 사용자만 리뷰 작성 폼 표시 */}
                      {localStorage.getItem("token") ? (
                        <ReviewForm
                          restaurantId={selectedRestaurant.id}
                          userId={localStorage.getItem("userId")}
                          onReviewSubmitted={() => setRefreshReviews(!refreshReviews)}
                        />
                      ) : (
                        <p style={{ padding: "1rem", color: "gray" }}>
                          ✍️ 로그인 시 리뷰 작성을 하실 수 있습니다.
                        </p>
                      )}
                    </div>
                  )}

        

                </>
              ) : searched ? (
                searchResults.length > 0 ? (
                  searchResults.map((r, idx) => (
                    <div
                      key={r.kakaoPlaceId}
                      className="restaurant-card"
                      onMouseEnter={() => {
                        if (mapRef.current?.highlightMarkerByRestaurant) {
                          mapRef.current.highlightMarkerByRestaurant(r);
                        }
                      }}
                      onMouseLeave={() => {
                        if (mapRef.current?.clearHighlightedMarker) {
                          mapRef.current.clearHighlightedMarker();
                        }
                      }}
                      onClick={() => handleRestaurantClick(r)}
                    >
                      <div className="restaurant-rank">{idx + 1}.</div>
                      <div className="restaurant-name">{r.name}</div>
                      <div className="restaurant-category">{r.categoryName}</div>
                    </div>
                  ))
                ) : (
                  <div className="empty-result">😥 검색 결과가 없습니다</div>
                )
              ) : (
                <p className="hint-text">검색어를 입력하고 🔍 버튼을 누르세요!</p>
              )}
              {showScrollBtn && (
                <button
                  className="scroll-to-top-btn-inside"
                  onClick={() => {
                    sidebarContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ⬆ 위로
                </button>
              )}
            </div>
          </>
        )}
      </div>
      
      <KakaoMap
        ref={mapRef}
        restaurants={searchResults.length > 0 ? searchResults : restaurants}
        onSelect={(r) => {
          setSelectedRestaurant(r);
          setActiveTab("home");
          setIsSidebarOpen(true);
        }}
      />

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="확대 이미지" className="lightbox-image" />
        </div>
      )}
    </div>
  );
}

export default App;
