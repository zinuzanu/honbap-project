import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken, getToken } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    const REST_API_KEY = "1e8516a460e4142752311c85872fdeb6";
    const REDIRECT_URI = "http://localhost:5173/kakao/callback";
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthURL;
  };

  const handleLogout = () => {
    removeToken();
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    navigate(0); // 새로고침
  };

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>🧡 솔밥</div>
      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={buttonStyle}>
            로그아웃
          </button>
        ) : (
          <button onClick={handleLogin} style={buttonStyle}>
            카카오 로그인
          </button>
        )}
      </div>
    </nav>
  );
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 32px",
  backgroundColor: "#FEE500",
  borderBottom: "1px solid #ccc",
};

const logoStyle = {
  fontSize: "20px",
  fontWeight: "bold",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Navbar;
