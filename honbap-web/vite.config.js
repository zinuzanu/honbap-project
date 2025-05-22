import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config();  // ✅ .env 파일 로드

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // ✅ Vite 기본 포트 (5173으로 설정)
  },
})
