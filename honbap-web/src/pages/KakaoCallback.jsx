import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveToken } from "../utils/auth"; // ✅ JWT 저장 및 axios에 반영

const KakaoCallback = () => {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false); // ✅ 중복 요청 방지

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const params = new URL(window.location.href).searchParams;
    const authCode = params.get("code");

    console.log("🟡 인가 코드:", authCode);

    if (authCode) {
      axios
        .get(`http://localhost:8080/api/auth/kakao/callback?code=${authCode}`)
        .then((res) => {
          console.log("✅ 로그인 성공!", res.data);

          localStorage.setItem("userId", res.data.id);
          localStorage.setItem("nickname", res.data.nickname);

          if (res.data.token) {
            saveToken(res.data.token); // ✅ axios에 Authorization 자동 반영됨
            window.history.replaceState({}, document.title, "/");
          }

          navigate("/"); // ✅ 메인 페이지로 이동
        })
        .catch((err) => {
          console.error("❌ 로그인 실패", err);
        });
    }
  }, [navigate]);

  return <div>로그인 중...</div>;
};

export default KakaoCallback;
