import { useState } from "react";
import axios from "axios";

function ReviewForm({ restaurantId, userId, onReviewSubmitted }) {
  const token = localStorage.getItem("token");
  const nickname = localStorage.getItem("nickname");

  
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [receiptVerified, setReceiptVerified] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  if (!token) {
    return (
      <p className="review-login-block">
        🛑 리뷰 작성을 위해 로그인이 필요합니다.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let imageUrl = ""; // 초기값은 빈 문자열
  
    // ✅ 1. 이미지 업로드 요청 (파일이 있는 경우에만)
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
  
      try {
        const uploadRes = await axios.post(
          "http://localhost:8080/api/uploads/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        imageUrl = uploadRes.data; // 서버가 반환한 이미지 URL
      } catch (err) {
        console.error("이미지 업로드 실패:", err);
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    }
  
    // ✅ 2. 리뷰 저장 요청
    try {
      await axios.post(
        "http://localhost:8080/api/reviews",
        {
          restaurantId,
          rating,
          content,
          imageUrl, // ✅ 업로드 성공 시 URL, 실패 or 없음 시 빈 문자열
          receiptVerified,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert("리뷰가 등록되었습니다!");
      setRating(5);
      setContent("");
      setImageFile(null);
      setReceiptVerified(false);
      setIsFormVisible(false);
      if (onReviewSubmitted) onReviewSubmitted(); // 목록 새로고침
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert("리뷰 등록 실패");
    }
  };
  
  return (
    <div className="review-form-wrapper">
      <button className="review-toggle-btn" onClick={() => setIsFormVisible((prev) => !prev)}>
        {isFormVisible ? "작성 취소" : "리뷰 작성하기"}
      </button>

      {isFormVisible && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3 className="review-title">리뷰 작성</h3>
          {nickname && <p className="review-subtitle">{nickname}님, 이 음식점에 대한 리뷰를 작성해보세요!</p>}

          <div className="review-field">
            <label>별점:</label>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={star <= rating ? "star active" : "star"}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="review-field">
            <label>내용:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="review-textarea"
            />
          </div>

          <div className="review-field">
            <label>이미지 업로드:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="review-file" 
            />
          </div>

          <div className="review-field checkbox">
            <label>
              <input
                type="checkbox"
                checked={receiptVerified}
                onChange={(e) => setReceiptVerified(e.target.checked)}
              />
              영수증 인증
            </label>
          </div>

          <button className="review-submit-btn" type="submit">리뷰 등록</button>
        </form>
      )}
    </div>
  );
}

export default ReviewForm;
