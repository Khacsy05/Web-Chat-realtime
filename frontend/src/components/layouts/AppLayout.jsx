import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import useAuthStore from "@/stores/useAuthStore";
import socket from "@/lib/socket";
import useNotificationStore from "@/stores/useNotificationStore";
import { toast } from "sonner";

export function AppLayout() {
  const currentUser = useAuthStore((state) => state.user);
  const initNotificationSocket = useNotificationStore((state) => state.initSocket);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

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

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [currentUser?.idUser, initNotificationSocket, fetchNotifications]);
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Header />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="w-15 min-h-0 shrink-0 border-r border-border bg-white">
          <Sidebar />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
          <div className="flex-1 min-h-0 w-full min-w-0 overflow-hidden p-0">
            <div className="mx-auto h-full min-h-0 w-full min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
