import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes";
import { Toaster } from "sonner";
import useAuthStore from "./stores/useAuthStore";
import axios from "axios";

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const silentRefresh = async () => {
      if (isAuthenticated && !token) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const res = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const { token: newToken, user } = res.data;
          setAuth(user, newToken);
        } catch (error) {
          console.error("Lỗi khi khôi phục phiên đăng nhập:", error);
          clearAuth();
        }
      }
      setIsBooting(false);
    };

    silentRefresh();
  }, [isAuthenticated, token, setAuth, clearAuth]);

  if (isBooting) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="text-sm text-slate-400">Đang đồng bộ phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster richColors position="bottom-right"/>
    </BrowserRouter>
  );
}