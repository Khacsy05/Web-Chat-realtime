import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import useNotificationStore from "@/stores/useNotificationStore";
import { getImageUrl } from "@/lib/utils";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "Vừa xong";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  return past.toLocaleDateString("vi-VN");
};

export const NotificationDropdown = ({ isOpen, onClose, topOffset = 160 }) => {
  const navigate = useNavigate();
  const {
    notifications,
    markAllAsRead,
    markAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleNotificationClick = (item) => {
    // 1. Đánh dấu đã đọc
    if (!item.isRead) {
      markAsRead(item.id);
    }

    // 2. Đóng dropdown
    onClose();

    // 3. Điều hướng theo loại thông báo
    if (item.type === "friend_request") {
      navigate("/user/friend/pendingRequest");
    } else if (item.type === "accept_friend") {
      navigate("/user/dashboard");
    } else if (item.type === "unfriend" || item.type === "reject_friend") {
      navigate("/user/friend/allFriend");
    } else {
      navigate("/user/dashboard");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "friend_request":
        return <UserPlus size={12} className="text-blue-500" />;
      case "accept_friend":
        return <UserCheck size={12} className="text-emerald-500" />;
      case "reject_friend":
      case "unfriend":
      case "kick":
        return <UserX size={12} className="text-rose-500" />;
      default:
        return <MessageSquare size={12} className="text-indigo-500" />;
    }
  };

  // Dùng Portal để thoát khỏi mọi stacking context của parent
  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed w-84 sm:w-96 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200/90 z-[99999] overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200 flex flex-col max-h-[540px]"
      style={{
        left: "68px",
        top: `${topOffset}px`,
        boxShadow:
          "0 20px 40px -15px rgba(0, 82, 204, 0.18), 0 0 20px 0 rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-blue-600/10 text-[#0052cc] flex items-center justify-center font-bold">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <CheckCheck size={15} />
              <span className="hidden sm:inline">Đã đọc</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              title="Xóa tất cả thông báo"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer ml-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* TABS LỌC (Tất cả / Chưa đọc) */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
            filter === "all"
              ? "bg-[#0052cc] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200/70"
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
            filter === "unread"
              ? "bg-[#0052cc] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200/70"
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* DANH SÁCH THÔNG BÁO */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2.5">
              <Bell size={28} className="stroke-[1.3]" />
            </div>
            <p className="text-xs font-bold text-slate-700">Không có thông báo mới</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filter === "unread"
                ? "Bạn đã đọc hết tất cả thông báo rồi!"
                : "Khi có lời mời kết bạn hoặc tương tác mới, bạn sẽ thấy ở đây."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const avatarSrc = getImageUrl(item.avatar);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative flex items-start gap-3 p-3 rounded-2xl transition cursor-pointer ${
                  item.isRead
                    ? "hover:bg-slate-50/80 text-slate-700"
                    : "bg-blue-50/40 hover:bg-blue-50/70 text-slate-900 font-medium"
                }`}
              >
                {/* Avatar kèm icon huy hiệu bên góc */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={avatarSrc || "/uploads/default-avatar.png"}
                    alt=""
                    onError={(e) => {
                      e.target.src = "/uploads/default-avatar.png";
                    }}
                    className="size-10 rounded-full object-cover border border-slate-200/80"
                  />
                  <div className="absolute -bottom-1 -right-1 size-4.5 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-150">
                    {getNotificationIcon(item.type)}
                  </div>
                </div>

                {/* Nội dung thông báo */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs leading-snug line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <Clock size={11} />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {/* Chấm tròn chưa đọc */}
                {!item.isRead && (
                  <span className="absolute top-4 right-3 size-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                )}

                {/* Nút xóa nhanh khi hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(item.id);
                  }}
                  title="Xóa thông báo này"
                  className="absolute bottom-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="p-2.5 border-t border-slate-150 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] font-medium text-slate-400">
          Tự động đồng bộ thời gian thực
        </span>
        <button
          onClick={() => {
            onClose();
            navigate("/user/friend/pendingRequest");
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
        >
          <span>Xem lời mời</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default NotificationDropdown;
