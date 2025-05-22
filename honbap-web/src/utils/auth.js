// utils/auth.js

export const saveToken = (token) => {
  console.log("💾 저장할 JWT 토큰:", token); // 🔥 로그 추가
  localStorage.setItem("token", token);
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  console.log("📦 가져온 JWT 토큰:", token); // 🔥 로그 추가
  return token;
};

export const removeToken = () => {
  console.log("🗑️ JWT 토큰 삭제됨");
  localStorage.removeItem("token");
};
