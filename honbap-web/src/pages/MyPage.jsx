import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import "./MyPage.css"; // 스타일 분리는 선택사항

const mockStats = {
  totalReviews: 28,
  averageRating: 4.2,
  categoryCounts: {
    한식: 10,
    일식: 6,
    치킨: 4,
    카페: 8,
  },
  monthlyReviews: {
    "2024-12": 4,
    "2025-01": 6,
    "2025-02": 7,
    "2025-03": 8,
    "2025-04": 3,
  },
};

const COLORS = ["#FF8042", "#00C49F", "#0088FE", "#FFBB28"];

function MyPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // 실제 API 대신 목업 데이터를 사용
    setStats(mockStats);
  }, []);

  if (!stats) return <p>📡 로딩 중...</p>;

  // 도넛 차트용 데이터 변환
  const categoryData = Object.entries(stats.categoryCounts).map(
    ([name, value]) => ({ name, value })
  );

  // 선형 차트용 데이터 변환
  const monthlyData = Object.entries(stats.monthlyReviews).map(
    ([month, count]) => ({ month, count })
  );

  return (
    <div className="mypage-container">
      <h2>👤 마이페이지 – 내 활동 통계</h2>

      <div className="card-grid">
        <div className="stat-card">
          <h3>📝 총 리뷰 수</h3>
          <p>{stats.totalReviews}개</p>
        </div>
        <div className="stat-card">
          <h3>⭐ 평균 별점</h3>
          <p>{stats.averageRating.toFixed(1)} / 5</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>🍽️ 내가 리뷰한 카테고리 비율</h3>
        <PieChart width={300} height={300}>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
