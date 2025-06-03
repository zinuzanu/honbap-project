import React, { useEffect, useState } from "react";
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
import "./MyPageSidebar.css"; // 별도 스타일 필요 시

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

function MyPageSidebar({ onClose, onRestaurantClick, onRestaurantSelectById }) {
  const [stats, setStats] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) return;

    axios.get(`http://localhost:8080/api/users/${userId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setStats(res.data))
      .catch(() => alert("마이페이지 통계 조회에 실패했습니다."));

    axios.get(`http://localhost:8080/api/reviews/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setMyReviews(res.data));
  }, [userId, token]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
      alert("삭제되었습니다!");
    } catch {
      alert("리뷰 삭제 실패");
    }
  };

  if (!stats) return <p style={{ padding: "1rem" }}>📡 로딩 중입니다...</p>;

  const categoryData = Object.entries(stats.categoryCounts).reduce((acc, [fullName, count]) => {
    const parts = fullName.split(">").map(p => p.trim());
    const mid = parts[1] || parts[0];
    acc[mid] = (acc[mid] || 0) + count;
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const monthlyData = Object.entries(stats.monthlyReviews).map(([month, count]) => ({ month, count }));
  const averageCount = monthlyData.reduce((acc, cur) => acc + cur.count, 0) / monthlyData.length;

  const filteredReviews = selectedCategory === "전체"
    ? myReviews
    : myReviews.filter((r) => r.category === selectedCategory);

  return (
    <div className="mypage-sidebar">
      <div className="sidebar-header">
        <h2>👤 마이페이지</h2>
        <button className="close-btn" onClick={onClose}>닫기 ✖</button>
      </div>

      <div className="summary-cards">
        <div className="card"><h4>📝 총 리뷰</h4><p>{stats.totalReviews}개</p></div>
        <div className="card"><h4>⭐ 평균 별점</h4><p>{stats.averageRating.toFixed(1)} / 5</p></div>
      </div>

      <div className="chart-section pie-chart-section">
        <h4>🍽️ 카테고리 비율</h4>
        <div className="pie-chart-wrapper">
          <PieChart width={400} height={300}>
            <Pie
              data={categoryChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {categoryChartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}개`, name]} />
            <Legend verticalAlign="bottom" height={30} />
          </PieChart>
        </div>
      </div>


      <div className="chart-section">
        <h4>📅 월별 리뷰 수</h4>
        <ComposedChart width={350} height={250} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}개`, "리뷰 수"]} />
          <ReferenceLine y={averageCount} stroke="red" label="평균" strokeDasharray="3 3" />
          <Bar dataKey="count" barSize={40} fill="#8884d8" />
          <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={2} />
        </ComposedChart>
      </div>

      <div className="chart-section">
        <h4>🗂 내 리뷰 목록</h4>
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

        {filteredReviews.map((r) => (
            <div key={r.id} className="review-card">
                <div
                onClick={() => {
                    console.log("🧪 리뷰 객체 r:", r);
                    if (onRestaurantSelectById) {
                        console.log("✅ 이름 기반 검색 시도: ", r.restaurantName);
                        onRestaurantSelectById({ name: r.restaurantName, reviewId: r.id });
                    }
                    }}

                style={{ cursor: "pointer" }}
                >
                <div className="review-title">📍 {r.restaurantName}</div>
                <div className="review-meta">⭐ {r.rating}점 | {new Date(r.createdAt).toLocaleDateString()}</div>
                <div className="review-content">{r.content}</div>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteReview(r.id)}>🗑 삭제</button>
            </div>
            ))}
      </div>
    </div>
  );
}

export default MyPageSidebar;