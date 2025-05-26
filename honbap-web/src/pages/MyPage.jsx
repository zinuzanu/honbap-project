import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import axios from "axios";
import "./MyPage.css";

const COLORS = ["#FF8042", "#00C49F", "#0088FE", "#FFBB28", "#AF19FF", "#FF5678"];

function MyPage() {
  const [stats, setStats] = useState(null);
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
  }, [userId, token]);

  if (!stats) return <p>📡 로딩 중입니다...</p>;

  // ✅ 중분류만 추출하여 카테고리 묶기
  const rawCategoryData = Object.entries(stats.categoryCounts);
  const groupedCategories = {};

  rawCategoryData.forEach(([fullCategory, count]) => {
    const parts = fullCategory.split(">").map(part => part.trim());
    const midCategory = parts.length > 1 ? parts[1] : parts[0];

    if (!groupedCategories[midCategory]) {
      groupedCategories[midCategory] = 0;
    }
    groupedCategories[midCategory] += count;
  });

  const categoryData = Object.entries(groupedCategories).map(
    ([name, value]) => ({ name, value })
  );

  // ✅ 선형 차트 데이터 (월별 리뷰 수)
  const monthlyData = Object.entries(stats.monthlyReviews).map(
    ([month, count]) => ({ month, count })
  );

  return (
    <div className="mypage-container">
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
        <PieChart width={350} height={350}>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}개`, name]} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </div>

      <div className="chart-section">
        <h3>📅 월별 리뷰 수</h3>
        <LineChart width={500} height={300} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </div>
    </div>
  );
}

export default MyPage;