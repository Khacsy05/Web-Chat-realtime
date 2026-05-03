import { lazy } from "react";
import { Navigate } from "react-router-dom";

const UserDashboard = lazy(() => import("@/pages/user/HomePage"));

export const studentRoutes = [
  // Tự động vào dashboard khi truy cập /faculty
  { index: true, element: <Navigate to="dashboard" replace /> }, 
  { path: "dashboard", element: <StudentDashboard /> },
  // Các path này phải khớp chính xác với path trong menu.config.js
];