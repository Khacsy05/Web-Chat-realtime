import { lazy } from "react";
import { Navigate } from "react-router-dom";

const UserDashboard = lazy(() => import("@/pages/user/messeage/HomePage"));
const Friend = lazy(() => import("@/pages/user/Friend"));


export const userRoutes = [
  // Tự động vào dashboard khi truy cập /faculty
  { index: true, element: <Navigate to="dashboard" replace /> }, 
  { path: "dashboard", element: <UserDashboard /> },
  // Các path này phải khớp chính xác với path trong menu.config.js
  { path: "friend", element: <Friend /> },
];