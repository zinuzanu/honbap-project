import axios from "axios";
import { getToken } from "../utils/auth";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    // 👇 이 URL은 JWT 토큰을 붙이면 안됨 (백엔드에서 토큰을 발급받는 단계니까)
    const isAuthCallback = config.url.includes("/api/auth/kakao/callback");

    if (token && !isAuthCallback) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);