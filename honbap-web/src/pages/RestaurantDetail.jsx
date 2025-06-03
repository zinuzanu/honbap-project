import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

function RestaurantDetail() {
  const { id } = useParams(); // 📌 /restaurant/:id 주소에서 id 추출
  const restaurantId = Number(id); // 문자열 → 숫자 변환
  const userId = localStorage.getItem("userId");
  const location = useLocation();

  const [refreshReviews, setRefreshReviews] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "review") {
      setShowForm(true); // URL에 ?tab=review → 폼 자동 열림
    }
  }, [location.search]);

  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <div className="restaurant-detail-container">
      <h2>🍽️ 음식점 상세 페이지</h2>

      <button onClick={toggleForm} className="toggle-review-form-btn">
        {showForm ? "리뷰 작성 닫기" : "리뷰 작성하기"}
      </button>

      {showForm && (
        <ReviewForm
          restaurantId={restaurantId}
          userId={userId}
          onReviewSubmitted={() => {
            setRefreshReviews((prev) => !prev); // 새로고침 트리거
            setShowForm(false); // 폼 닫기
          }}
        />
      )}

      <ReviewList
        restaurantId={restaurantId}
        refreshTrigger={refreshReviews}
      />
    </div>
  );
}

export default RestaurantDetail;
