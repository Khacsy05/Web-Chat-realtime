import useAuthStore from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;

    return payload.exp <= now;
  } catch {
    return true;
  }
};

export function ProtectedRoute({ allowedRoles }) {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  if (!token || isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
