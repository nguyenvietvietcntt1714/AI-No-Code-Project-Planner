import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },

      // 👇 THÊM KHỐI NÀY VÀO ĐỂ SỬA LỖI TRÊN RENDER
      preview: {
        host: '0.0.0.0', // Quan trọng: Đảm bảo máy chủ preview lắng nghe trên mọi IP
        allowedHosts: [
          'ai-no-code-project-planner.onrender.com',
          '.onrender.com' // Dùng ký tự đại diện này là tốt nhất
        ]
      },
      // 👆 KẾT THÚC KHỐI CẦN THÊM

      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
