import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  // 👇 THÊM ĐOẠN NÀY VÀO ĐỂ SỬA LỖI ERR_EMPTY_RESPONSE
  server: {
    port: 5173,       // Đảm bảo cổng này khớp với file docker-compose.yml
    host: true,       // Cho phép Docker "mở cửa" kết nối ra máy thật
    strictPort: true, // Nếu cổng 5173 bị kẹt thì báo lỗi luôn chứ không tự đổi cổng khác
    watch: {
      usePolling: true, // Kích hoạt polling để HMR hoạt động mượt mà trên Windows + Docker
    }
  }
})