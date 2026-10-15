import axios from "axios";
import useAuthStore from "../stores/useAuthStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // 👈 Tự động gửi kèm Cookie (Refresh Token) lên backend
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // Lấy Access Token từ RAM (Zustand)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 (hết hạn Access Token) và chưa từng retry trước đó
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh để lấy Access Token mới
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token, user } = res.data;

        // Lưu Access Token mới vào RAM
        useAuthStore.getState().setAuth(user, token);

        // Đính kèm token mới vào request cũ và chạy lại request đó
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu Refresh Token cũng hết hạn -> Xóa Auth và chuyển hướng đăng nhập
        useAuthStore.getState().clearAuth();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
