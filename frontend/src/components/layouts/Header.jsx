import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";
import Profile from "@/pages/user/profile/profile";
import ChangePasswordModal from "@/pages/user/profile/ChangePasswordModal";
import Modal from "../Modal";
import useMessStore from "@/stores/useMessStore";
import useChatStore from "@/stores/useChatStore";
import useFriendStore from "@/stores/useFriendStore";
import socket from "@/lib/socket";
export function Header({ onNavigate }) {
  const [dropOpen, setDropOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearMessages = useMessStore((s) => s.clearMessages);
  const setConversations = useChatStore((s) => s.setConversations);
  const clearFriends = useFriendStore((s) => s.clearFriends);

  const handleLogout = () => {
    clearAuth();
    clearMessages();
    setConversations([]);
    clearFriends();
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
      // Khi bấm vào bất cứ đâu trên màn hình, ta đóng dropdown
      if (dropOpen) {
        setDropOpen(false);
      }
    };

    // Đăng ký sự kiện click toàn cục
    window.addEventListener('click', handleGlobalClick);

    return () => {
      // Xóa sự kiện khi thoát trang
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [dropOpen]);
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
            <button className="relative p-2 rounded-full hover:bg-white/10 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>



            </button>

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
