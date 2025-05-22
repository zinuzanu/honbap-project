import { useEffect } from "react";

const KakaoLoginButton = () => {
  useEffect(() => {
    // Kakao SDK 초기화 (한 번만 실행)
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init("b38106ea6f0129ec358d24fbe5986074");
    }
  }, []);

  // 카카오 로그인 함수
  const handleLogin = () => {
    window.Kakao.Auth.authorize({
      redirectUri: "http://localhost:8080/api/auth/kakao/callback", // 카카오 개발자센터에 설정한 Redirect URI
    });
  };

  return (
    <button onClick={handleLogin} style={buttonStyle}>
      카카오 로그인
    </button>
  );
};

// 간단한 스타일 적용
const buttonStyle = {
  backgroundColor: "#FEE500",
  border: "none",
  color: "#000",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  borderRadius: "8px",
};

export default KakaoLoginButton;
