import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";
import Profile from "@/pages/user/profile/profile";
import ChangePasswordModal from "@/pages/user/profile/ChangePasswordModal";
import Modal from "../Modal";
import useMessStore from "@/stores/useMessStore";
import useChatStore from "@/stores/useChatStore";
import useFriendStore from "@/stores/useFriendStore";
import useNotificationStore from "@/stores/useNotificationStore";
import socket from "@/lib/socket";
import { X } from "lucide-react";
export function Header({ onNavigate }) {
  const [dropOpen, setDropOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearMessages = useMessStore((s) => s.clearMessages);
  const setConversations = useChatStore((s) => s.setConversations);
  const clearFriends = useFriendStore((s) => s.clearFriends);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const clearAllNotifications = useNotificationStore((s) => s.clearAll);
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
  const [avatarError, setAvatarError] = useState(false);
  const name = user?.displayName || user?.fullname || user?.username || "Nguoi dung";
  const avatarLetter = name.charAt(0).toUpperCase();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith("http") ? user.avatar : `${API_BASE_URL}${user.avatar}`)
    : `${API_BASE_URL}/uploads/default-avatar.png`;
  useEffect(() => {
    const handleGlobalClick = () => {
      if (dropOpen) {
        setDropOpen(false);
      }
      if (showNotifications) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [dropOpen, showNotifications]);
  return (
    <div>
      <header className="bg-[#3b4288] text-white shadow-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="w-14 h-8 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden border-2 border-blue-200">
            </div>
            <div>
              <div className="font-bold text-4 leading-tight tracking-wide uppercase">Zola</div>
              <div className="text-xs tracking-[0.25em] text-blue-200 font-light uppercase">Chat-Free</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setDropOpen(false);
                  if (!showNotifications) {
                    markAllAsRead();
                  }
                }}
                className="relative p-2 rounded-full hover:bg-white/10 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white text-gray-700 rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100 flex flex-col max-h-96"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="font-semibold text-sm">Thông báo</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => clearAllNotifications()}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-gray-400">
                        Không có thông báo mới
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 flex items-start gap-2.5 hover:bg-gray-50/50 transition-colors group">
                          {n.avatar ? (
                            <img 
                              src={`${API_BASE_URL}${n.avatar}`} 
                              alt="avatar" 
                              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                              N
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-gray-800 leading-tight pr-4">{n.content}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button 
                            onClick={() => removeNotification(n.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5 rounded transition shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDropOpen(!dropOpen)
                }}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition"
              >
                {avatarError ? (
                  <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                    {avatarLetter}
                  </div>
                ) : (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                )}

              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white text-gray-700 rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100">
                  <button
                    onClick={() => { setProfileOpen(true); setDropOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                  >
                    Thông tin cá nhân
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => { setChangePassOpen(true); setDropOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                  >
                    Đổi mật khẩu
                  </button>
                  <div className="border-t border-gray-100" />
                  <button className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-500"
                    onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 bg-indigo-400/50" />
      </header>

      {profileOpen && (
        <Modal
          title="Thông tin tài khoản"
          onClose={() => setProfileOpen(false)}
          size="md"
        >
          <Profile />
        </Modal>
      )}

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

    </div>



  );
}
