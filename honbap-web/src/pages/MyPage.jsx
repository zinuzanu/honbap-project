import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import axios from "axios";
import "./MyPage.css";

const COLORS = ["#FF8042", "#00C49F", "#0088FE", "#FFBB28", "#AF19FF", "#FF5678"];

const CATEGORIES = [
  { name: "전체", emoji: "📌" },
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
];

function MyPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) return;

    axios.get(`http://localhost:8080/api/users/${userId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("❌ 통계 불러오기 실패:", err);
        alert("마이페이지 통계 조회에 실패했습니다.");
      });

    axios.get(`http://localhost:8080/api/reviews/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setMyReviews(res.data))
      .catch((err) => {
        console.error("❌ 리뷰 불러오기 실패:", err);
      });
  }, [userId, token]);

  const handleReviewClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
      alert("삭제되었습니다!");
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("리뷰 삭제 실패");
    }
  };

  if (!stats) return <p>📡 로딩 중입니다...</p>;

  const categoryData = Object.entries(stats.categoryCounts).reduce((acc, [fullName, count]) => {
    const parts = fullName.split(">").map(p => p.trim());
    const mid = parts[1] || parts[0];
    acc[mid] = (acc[mid] || 0) + count;
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const monthlyData = Object.entries(stats.monthlyReviews).map(
    ([month, count]) => ({ month, count })
  );
  
  const averageCount = monthlyData.reduce((acc, cur) => acc + cur.count, 0) / monthlyData.length;
  const peakMonth = monthlyData.reduce((max, cur) => cur.count > max.count ? cur : max, monthlyData[0]).month;

  const filteredReviews = selectedCategory === "전체"
    ? myReviews
    : myReviews.filter((r) => r.category === selectedCategory);

  return (
    <div className="mypage-container">
      <div className="top-bar">
        <button className="back-btn" onClick={() => window.location.href = "/"}>
          ⬅ 메인 페이지로
        </button>
      </div>

      <h2>👤 마이페이지 – 내 활동 통계</h2>

      <div className="summary-cards">
        <div className="card">
          <h3>📝 총 리뷰 수</h3>
          <p>{stats.totalReviews}개</p>
        </div>
        <div className="card">
          <h3>⭐ 평균 별점</h3>
          <p>{stats.averageRating.toFixed(1)} / 5</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>🍽️ 내가 리뷰한 <u>카테고리 비율</u></h3>
        <div className="chart-center">
          <PieChart width={800} height={350}>
            <Pie
              data={categoryChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {categoryChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}개`, name]} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </div>
      </div>

      <div className="chart-section">
        <h3>📅 <u>월별 리뷰 수</u></h3>
        <div className="chart-center">
          <ComposedChart width={600} height={300} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value, name, props) => {
                const isPeak = props.payload.month === peakMonth;
                return [`${value}개${isPeak ? " 📈 (최다 활동)" : ""}`, "리뷰 수"];
              }}
            />
            <ReferenceLine y={averageCount} stroke="red" label="평균" strokeDasharray="3 3" />
            <Bar dataKey="count" barSize={40} fill="#8884d8" />
            <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={2} />
          </ComposedChart>
        </div>
      </div>

      <div className="chart-section">
        <h3>🗂 내가 작성한 리뷰</h3>

        <div className="category-filter">
          {CATEGORIES.map(({ name, emoji }) => (
            <button
              key={name}
              className={`category-btn ${selectedCategory === name ? "active" : ""}`}
              onClick={() => setSelectedCategory(name)}
            >
              {emoji} {name}
            </button>
          ))}
        </div>

        <div className="review-list">
          {filteredReviews.length === 0 ? (
            <p>해당 카테고리의 리뷰가 없습니다.</p>
          ) : (
            filteredReviews.map((r) => (
              <div key={r.id} className="review-card" style={{ cursor: "pointer" }}>
                <div onClick={() => handleReviewClick(r.restaurantId)}>
                  <div className="review-title">📍 {r.restaurantName}</div>
                  <div className="review-meta">⭐ {r.rating}점 | {new Date(r.createdAt).toLocaleDateString()}</div>
                  <div className="review-content">{r.content}</div>
                </div>
                <div className="review-actions">
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReview(r.id);
                    }}
                  >
                    🗑 삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
