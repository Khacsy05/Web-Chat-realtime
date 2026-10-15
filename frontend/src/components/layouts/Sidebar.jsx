import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Contact2,
  Cloud,
  Settings,
  User,
  KeyRound,
  LogOut,
} from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";
import useMessStore from "@/stores/useMessStore";
import useChatStore from "@/stores/useChatStore";
import useFriendStore from "@/stores/useFriendStore";
import useNotificationStore from "@/stores/useNotificationStore";
import socket from "@/lib/socket";
import Modal from "@/components/Modal";
import Profile from "@/pages/user/profile/profile";
import ChangePasswordModal from "@/pages/user/profile/ChangePasswordModal";
import { getImageUrl } from "@/lib/utils";

export function Sidebar({ onNavigate }) {
  const [dropOpen, setDropOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearMessages = useMessStore((s) => s.clearMessages);
  const setConversations = useChatStore((s) => s.setConversations);
  const clearFriends = useFriendStore((s) => s.clearFriends);
  const clearAllNotifications = useNotificationStore((s) => s.clearAll);

  const handleLogout = () => {
    clearAuth();
    clearMessages();
    setConversations([]);
    clearFriends();
    clearAllNotifications();
    socket.disconnect();
    setDropOpen(false);
    navigate("/login");
  };

  const name = user?.displayName || user?.fullname || user?.username || "Người dùng";
  const avatarLetter = name.charAt(0).toUpperCase();
  const avatarSrc = getImageUrl(user?.avatar);

  // Đóng các popup khi click ra ngoài
  useEffect(() => {
    const handleGlobalClick = () => {
      setDropOpen(false);
      setShowSettings(false);
    };

    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return (
    <>
      <nav className="flex flex-col justify-between items-center h-full w-16 bg-[#0052cc] text-white py-3.5 select-none relative z-30 shadow-md">
        {/* ================= 1. KHỐI TRÊN CÙNG: AVATAR & MAIN MENU ================= */}
        <div className="flex flex-col items-center gap-4 w-full">
          
          {/* Avatar Người Dùng kèm Menu Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropOpen(!dropOpen);
                setShowSettings(false);
              }}
              title={name}
              className="relative p-0.5 rounded-full transition hover:scale-105 active:scale-95 cursor-pointer group"
            >
              {avatarError || !avatarSrc ? (
                <div className="size-11 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center border-2 border-white/90 shadow-sm text-base">
                  {avatarLetter}
                </div>
              ) : (
                <img
                  src={avatarSrc}
                  alt={name}
                  className="size-11 rounded-full object-cover border-2 border-white/90 shadow-sm"
                  onError={() => setAvatarError(true)}
                />
              )}

              {/* Chấm xanh trạng thái Online chuẩn Zalo */}
              <span className="absolute bottom-0.5 right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-[#0052cc]" />
            </button>

            {/* POPUP MENU AVATAR (Hiện sang phải thanh sidebar) */}
            {dropOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-[68px] top-0 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-150 z-50 overflow-hidden animate-fade-in divide-y divide-slate-100"
              >
                {/* Header User Info */}
                <div className="p-4 flex items-center gap-3 bg-gradient-to-br from-blue-50/60 to-slate-50">
                  <div className="size-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={avatarSrc}
                      alt={name}
                      className="size-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 truncate">
                      {name}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      @{user?.username || "user"}
                    </div>
                  </div>
                </div>

                {/* Danh sách hành động */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileOpen(true);
                      setDropOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition text-left cursor-pointer"
                  >
                    <User size={16} className="text-slate-500" />
                    <span>Thông tin tài khoản</span>
                  </button>

                  <button
                    onClick={() => {
                      setChangePassOpen(true);
                      setDropOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition text-left cursor-pointer"
                  >
                    <KeyRound size={16} className="text-slate-500" />
                    <span>Đổi mật khẩu</span>
                  </button>
                </div>

                {/* Nút Đăng xuất */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Đường gạch phân cách nhẹ */}
          <div className="w-8 h-px bg-white/20 my-0.5" />

          {/* ICON 1: TIN NHẮN (CHAT) */}
          <NavLink
            to="/user/dashboard"
            onClick={() => onNavigate?.("chat")}
            title="Tin nhắn"
            className={({ isActive }) =>
              `relative flex items-center justify-center size-12 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? "bg-white/20 text-white shadow-inner font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <MessageSquare size={24} className="stroke-[2.2]" />
          </NavLink>

          {/* ICON 2: DANH BẠ (BẠN BÈ) */}
          <NavLink
            to="/user/friend"
            onClick={() => onNavigate?.("friend")}
            title="Danh bạ bạn bè"
            className={({ isActive }) =>
              `relative flex items-center justify-center size-12 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? "bg-white/20 text-white shadow-inner font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Contact2 size={24} className="stroke-[2.2]" />
          </NavLink>
        </div>

        {/* ================= 2. KHỐI DƯỚI CÙNG: CLOUD & CÀI ĐẶT ================= */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Cloud của tôi */}
          <button
            onClick={() => navigate("/user/dashboard")}
            title="Cloud của tôi (Lưu trữ)"
            className="flex items-center justify-center size-11 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <Cloud size={23} className="stroke-[2.2]" />
          </button>

          {/* Cài đặt (Settings) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                setDropOpen(false);
              }}
              title="Cài đặt"
              className={`flex items-center justify-center size-11 rounded-2xl transition cursor-pointer ${
                showSettings
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings size={22} className="stroke-[2.2]" />
            </button>

            {/* POPUP CÀI ĐẶT */}
            {showSettings && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-[68px] bottom-0 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-150 z-50 overflow-hidden animate-fade-in p-1.5 space-y-0.5 divide-y divide-slate-100"
              >
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cài đặt Zola
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileOpen(true);
                      setShowSettings(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition text-left cursor-pointer"
                  >
                    <User size={15} className="text-slate-500" />
                    <span>Cài đặt tài khoản</span>
                  </button>

                  <button
                    onClick={() => {
                      setChangePassOpen(true);
                      setShowSettings(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition text-left cursor-pointer"
                  >
                    <KeyRound size={15} className="text-slate-500" />
                    <span>Bảo mật & Mật khẩu</span>
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL THÔNG TIN TÀI KHOẢN */}
      {profileOpen && (
        <Modal
          title="Thông tin tài khoản"
          onClose={() => setProfileOpen(false)}
          size="md"
        >
          <Profile />
        </Modal>
      )}

      {/* MODAL ĐỔI MẬT KHẨU */}
      {changePassOpen && (
        <Modal
          title="Đổi mật khẩu"
          onClose={() => setChangePassOpen(false)}
          size="md"
        >
          <ChangePasswordModal
            onSuccess={() => setChangePassOpen(false)}
            onCancel={() => setChangePassOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}

export default Sidebar;
