import { lazy } from "react";
import { Navigate } from "react-router-dom";

const UserDashboard = lazy(() => import("@/pages/user/messeage/HomePage"));
const Friend = lazy(() => import("@/pages/user/friend/HomePageFriend"));
const AllFriend = lazy(() => import("@/pages/user/friend/AllFriend"));
const FriendChat = lazy(() => import("@/pages/user/friend/FriendChat"));

export const userRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <UserDashboard /> },
  {
    path: "friend",
    element: <Friend />,
    children: [
      { index: true, element: <Navigate to="allFriend" replace /> },
      { path: "allFriend", element: <AllFriend /> },
      { path: "chat/:friendId", element: <FriendChat /> },
    ],
  },
];
