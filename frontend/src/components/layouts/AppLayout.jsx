import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import useAuthStore from "@/stores/useAuthStore";
import socket from "@/lib/socket";
import useNotificationStore from "@/stores/useNotificationStore";
import useFriendStore from "@/stores/useFriendStore";
import NotificationPopup from "./NotificationPopup";

export function AppLayout() {
  const currentUser = useAuthStore((state) => state.user);
  const initNotificationSocket = useNotificationStore((state) => state.initSocket);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const initFriendSocket = useFriendStore((state) => state.initSocket);
  const popups = useNotificationStore((state) => state.popups);
  const dismissPopup = useNotificationStore((state) => state.dismissPopup);

  useEffect(() => {
    if (!currentUser?.idUser) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit("join", String(currentUser.idUser));
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    fetchNotifications();
    initNotificationSocket();
    initFriendSocket();

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [currentUser?.idUser, initNotificationSocket, fetchNotifications, initFriendSocket]);
  return (
    <div className="flex h-screen w-screen min-h-0 overflow-hidden bg-white font-sans text-slate-900">
      {/* Sidebar Zalo bên trái màu xanh đậm */}
      <aside className="w-16 min-h-0 shrink-0 bg-[#0052cc] text-white z-30 flex flex-col">
        <Sidebar />
      </aside>

      {/* Vùng giao diện chính (Chat / Danh bạ) chiếm trọn 100% chiều cao và chiều rộng còn lại */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col h-full w-full overflow-hidden bg-white">
        <Outlet />
      </main>

      {/* Floating notification popups */}
      <NotificationPopup popups={popups} onDismiss={dismissPopup} />
    </div>
  );
}

