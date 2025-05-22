import { useEffect, useState } from "react";
import axios from "axios";

function ReviewList({ restaurantId, refreshTrigger, setLightboxImage }) {
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 리뷰 ID
  const [editedContent, setEditedContent] = useState(""); // 수정 내용

  const token = localStorage.getItem("token");
  const currentUserId = Number(localStorage.getItem("userId"));


  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/reviews/${restaurantId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("리뷰 조회 실패:", err));
  }, [restaurantId, refreshTrigger]);

  const handleDelete = async (reviewId) => {
    const confirmDelete = window.confirm("정말 이 리뷰를 삭제하시겠습니까?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("삭제되었습니다!");
      if (refreshTrigger) refreshTrigger(); // 새로고침 트리거
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제 실패");
    }
  };
  

  const handleEdit = (review) => {
    setEditingId(review.id);
    setEditedContent(review.content); // 기존 내용 불러오기
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedContent("");
  };

  const handleUpdate = async (reviewId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/reviews/${reviewId}`,
        { content: editedContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("수정 완료되었습니다!");
      setEditingId(null);
      setEditedContent("");
      if (refreshTrigger) refreshTrigger(); // 상태 갱신
    } catch (err) {
      console.error("리뷰 수정 실패:", err);
      alert("리뷰 수정 실패");
    }
  };

  return (
    <div className="review-list-container">
      <h3>리뷰 목록</h3>
      {reviews.length === 0 ? (
        <p className="no-review">아직 리뷰가 없습니다.</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <span className="review-rating">⭐ {r.rating}점</span>
              <span className="review-date">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <p className="review-nickname">👤 {r.nickname || "닉네임 없음"}</p>

            {editingId === r.id ? (
              <textarea
                className="review-textarea"
                rows={4}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            ) : (
              <p className="review-content">{r.content}</p>
            )}

            {r.imageUrl && (
              <img
                src={`http://localhost:8080${r.imageUrl}`}
                alt="리뷰 이미지"
                className="review-image"
                onClick={() => setLightboxImage(`http://localhost:8080${r.imageUrl}`)}
              />
            )}

            <p className="review-receipt">
              영수증 인증: {r.receiptVerified ? "✅ 인증됨" : "❌ 미인증"}
            </p>

            {r.userId === Number(currentUserId) && (
              <div className="review-actions">
                {editingId === r.id ? (
                  <>
                    <button onClick={() => handleUpdate(r.id)}>💾 저장</button>
                    <button onClick={handleCancelEdit}>❌ 취소</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(r)}>✏️ 수정</button>
                    <button onClick={() => handleDelete(r.id)}>🗑 삭제</button>
                  </>
                )}
              </div>
            )}

          </div>
        ))
      )}
    </div>
  );
}

export default ReviewList;