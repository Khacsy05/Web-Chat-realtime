import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import useAuthStore from "@/stores/useAuthStore";
import { userRoutes } from "./user.routes";

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

const RoleRedirect = () => {
  const role = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  if (!token || isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (!role) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}/dashboard`} replace />;
};

const LoginPage = lazy(() => import("@/pages/Auth/Login"));
const ForgotPass = lazy(() => import("@/pages/Auth/ForgotPass"));
const ResetPass = lazy(() => import("@/pages/Auth/ResetPass"));

export default function AppRouter() {
  const routes = useRoutes([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/forgotPassword",
      element: <ForgotPass />,
    },
    {
      path: "/resetPassword",
      element: <ResetPass />,
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <RoleRedirect /> },
            {
              path: "user",
              element: <ProtectedRoute allowedRoles={["user"]} />,
              children: userRoutes,
            },
          ],
        },
      ],
    },
  ]);

  return <Suspense fallback={<div>Loading...</div>}>{routes}</Suspense>;
}
