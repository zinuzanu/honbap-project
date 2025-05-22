import { useState } from "react";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

function RestaurantDetail({ restaurantId }) {
  const userId = localStorage.getItem("userId");

  const [refreshReviews, setRefreshReviews] = useState(false);
  const [showForm, setShowForm] = useState(false); // 🔹 추가: 폼 표시 여부

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <div>
      <h2>음식점 상세 페이지</h2>

      {/* 🔘 리뷰 작성 토글 버튼 */}
      <button onClick={toggleForm} className="toggle-review-form-btn">
        {showForm ? "리뷰 작성 닫기" : "리뷰 작성하기"}
      </button>

      {/* ⬇️ 조건부로 리뷰 폼 렌더링 */}
      {showForm && (
        <ReviewForm
          restaurantId={restaurantId}
          userId={userId}
          onReviewSubmitted={() => {
            setRefreshReviews((prev) => !prev);
            setShowForm(false); // 작성 후 폼 닫기
          }}
        />
      )}

      <ReviewList restaurantId={restaurantId} refreshTrigger={refreshReviews} />
    </div>
  );
}

export default RestaurantDetail;
