import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken(); // ✅ JWT 토큰 제거
    alert("로그아웃 되었습니다.");

    // ✅ 카카오 인증 세션까지 로그아웃
    const REST_API_KEY = "1e8516a460e4142752311c85872fdeb6";
    const LOGOUT_REDIRECT_URI = "http://localhost:5173"; // 환경에 맞게 수정 필요

    // 카카오 로그아웃 URL로 이동 (카카오 서버 세션까지 만료)
    window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${REST_API_KEY}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;
  };

  return (
    <button onClick={handleLogout} className="common-btn logout-btn">
      로그아웃
    </button>
  );
};

export default LogoutButton;