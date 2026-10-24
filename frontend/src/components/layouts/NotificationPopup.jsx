import React, { useEffect, useRef, useState } from "react";
import { X, UserPlus, UserCheck, UserX, Users, UserMinus } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// -----------------------------------------------------------
// Một item popup đơn lẻ
// -----------------------------------------------------------
function PopupItem({ notif, onDismiss }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);

  // Slide-in khi mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    // Tự dismiss sau 5 giây
    timerRef.current = setTimeout(() => dismiss(), 5000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    clearTimeout(timerRef.current);
    setLeaving(true);
    setTimeout(() => onDismiss(notif.id), 380);
  };

  const handleClick = () => {
    dismiss();
    if (notif.type === "friend_request" || notif.type === "accept_friend") {
      navigate("/user/friend");
    }
  };

  // Icon & màu theo loại
  const meta = {
    friend_request: {
      icon: <UserPlus size={14} />,
      color: "#3b82f6",
      label: "Lời mời kết bạn",
    },
    accept_friend: {
      icon: <UserCheck size={14} />,
      color: "#10b981",
      label: "Chấp nhận kết bạn",
    },
    reject_friend: {
      icon: <UserX size={14} />,
      color: "#f59e0b",
      label: "Từ chối kết bạn",
    },
    kick: {
      icon: <Users size={14} />,
      color: "#ef4444",
      label: "Bị kick khỏi nhóm",
    },
    unfriend: {
      icon: <UserMinus size={14} />,
      color: "#8b5cf6",
      label: "Hủy kết bạn",
    },
  };

  const m = meta[notif.type] || {
    icon: null,
    color: "#64748b",
    label: "Thông báo",
  };

  const avatarSrc = notif.avatar ? getImageUrl(notif.avatar) : null;
  const letter = (notif.content || "?").charAt(0).toUpperCase();

  return (
    <div
      onClick={handleClick}
      style={{
        transform: visible && !leaving ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.38s cubic-bezier(.22,.68,0,1.2), opacity 0.35s ease",
        cursor: "pointer",
      }}
      className="relative w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden select-none group"
    >
      {/* Accent bar bên trái */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ background: m.color }}
      />

      {/* Progress bar tự động thu lại */}
      <div
        className="absolute bottom-0 left-0 h-[3px] rounded-b-2xl"
        style={{
          background: m.color,
          width: "100%",
          animation: "notif-shrink 5s linear forwards",
        }}
      />

      <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
        {/* Avatar */}
        <div className="relative shrink-0 mt-0.5">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="avatar"
              className="size-11 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div
              className="size-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
              style={{ background: m.color }}
            >
              {letter}
            </div>
          )}
          {/* Icon badge nhỏ */}
          <span
            className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ background: m.color }}
          >
            {m.icon}
          </span>
        </div>

        {/* Nội dung */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
            style={{ color: m.color }}
          >
            {m.label}
          </p>
          <p className="text-sm text-slate-800 font-medium leading-snug line-clamp-2">
            {notif.content}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Vừa xong</p>
        </div>

        {/* Nút đóng */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="shrink-0 size-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition mt-0.5 opacity-0 group-hover:opacity-100"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// Container quản lý stack popup
// -----------------------------------------------------------
export default function NotificationPopup({ popups, onDismiss }) {
  if (!popups || popups.length === 0) return null;

  return (
    <>
      {/* Keyframe animation cho progress bar */}
      <style>{`
        @keyframes notif-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      {/* Fixed container góc trên phải */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
        aria-live="polite"
        aria-label="Thông báo"
      >
        {popups.map((notif) => (
          <div key={notif.id} className="pointer-events-auto">
            <PopupItem notif={notif} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  );
}
