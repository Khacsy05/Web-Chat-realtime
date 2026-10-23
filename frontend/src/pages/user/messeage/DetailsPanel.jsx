import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import useAuthStore from '@/stores/useAuthStore';
import useChatStore from '@/stores/useChatStore';
import {
  BellOff,
  Pin,
  UserPlus,
  AlarmClock,
  Users,
  ChevronDown,
  ChevronUp,
  FileVideo,
  Info,
  Pencil,
  Trash2,
  X,
  Settings,
  Users2,
  StickyNote,
  ChevronRight,
  LogOut
} from 'lucide-react';
import conversation from '@/service/conversation';
import AddMembersModal from './AddMembersModal';
import PinLimitModal from './PinLimitModal';
import { toast } from 'sonner';
import useMessStore from '@/stores/useMessStore';
import { getImageUrl } from '@/lib/utils';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DetailsPanel = ({ selectedConversation, onSelectConversation, onMobileBack, onOpenMembers, onOpenMediaArchive, archiveItems }) => {
  const currentUser = useAuthStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const updateConversationPin = useChatStore((state) => state.updateConversationPin);

  // Trạng thái đóng/mở các mục thả xuống (Accordion)
  const [isOpenMedia, setIsOpenMedia] = useState(true);
  const [isOpenFiles, setIsOpenFiles] = useState(true);
  const [openPinModal, setOpenPinModal] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
  });
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState(null);

  // 🌟 State Accordion riêng cho giao diện Nhóm (Group) giống trong ảnh
  const [isOpenMembers, setIsOpenMembers] = useState(true);
  const [isOpenNewsboard, setIsOpenNewsboard] = useState(true);
  const [openAddMembers, setOpenAddMembers] = useState(false);
  const isGroup = selectedConversation?.isGroup;
  const members = selectedConversation?.members || [];
  const totalMembers = members.length;

  const otherMember = members.find(
    (member) => String(member._id) !== String(currentUser?.idUser)
  ) || members[0];
  const userId = currentUser?.idUser || currentUser?._id;
  const adminId = selectedConversation?.adminGroup?._id || selectedConversation?.adminGroup;
  const adminIdStr = String(adminId || "");
  const isCurrentUserAdmin = Boolean(userId && adminIdStr && String(userId) === adminIdStr);
  const displayName = isGroup
    ? (selectedConversation?.nameGroup || "Nhóm trò chuyện")
    : (otherMember?.fullname || 'Người dùng');

  const avatarDisplay = isGroup
    ? getImageUrl(selectedConversation?.avatar)
    : getImageUrl(otherMember?.avatar);
  // Lọc lấy toàn bộ tin nhắn có type là 'image' và không bị thu hồi (isDeleted)
  const realMediaItems = archiveItems.filter(item => item.type === 'image' && !item.isDeleted).slice(0, 8);
  // Giả lập data danh sách ảnh/video gửi trong đoạn chat để render grid
  const mediaItems = [
    { id: 1, src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150" },
    { id: 2, src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150" },
    { id: 3, src: "https://images.unsplash.com/photo-1557683316-973673baf926?w=150" },
    { id: 4, src: "https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=150" },
    { id: 5, src: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=150" },
    { id: 6, src: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=150" },
    { id: 7, src: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150" },
    { id: 8, src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150" },
  ];

  const handleDeleteConversation = async () => {
    try {
      await conversation.deleteConversation(selectedConversation._id);
      if (onSelectConversation) onSelectConversation(null);
    } catch (error) {
      console.error("Lỗi khi thu hồi:", error);
    }
  };

  const handleRemoveMember = async (memberId, newAdminId = null) => {
    try {
      await conversation.removeMember(selectedConversation._id, memberId, newAdminId);
      toast.success("Rời nhóm thành công");
      if (onSelectConversation) onSelectConversation(null);
      if (onMobileBack) onMobileBack();
    } catch (error) {
      console.error("Lỗi khi roi nhom:", error);
      const msg = error?.response?.data?.message || "Lỗi khi rời nhóm";
      toast.error(msg);
    }
  };

  const openConfirmDialog = (type, memberId) => {
    let config = {
      isOpen: true,
      title: "",
      description: "",
      onConfirm: () => { }
    };

    if (type === 'deleteConversation') {
      config.title = "Xác nhận";
      config.description = `Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn xóa?`;
      config.onConfirm = () => handleDeleteConversation();
    }
    else if (type === 'removeMember') {
      if (isCurrentUserAdmin) {
        if (members.length > 1) {
          config.title = "Rời nhóm";
          config.description = "Bạn là trưởng nhóm. Bạn cần chỉ định trưởng nhóm mới trước khi rời nhóm.";
          config.onConfirm = () => {
            setOpenTransferModal(true);
          };
        } else {
          config.title = "Giải tán nhóm";
          config.description = "Bạn là thành viên duy nhất. Rời khỏi nhóm đồng nghĩa với việc giải tán và xóa nhóm này hoàn toàn?";
          config.onConfirm = () => handleRemoveMember(memberId);
        }
      } else {
        config.title = "Xác nhận rời nhóm";
        config.description = `Bạn sẽ không thể xem lại tin nhắn sau khi rời nhóm này.`;
        config.onConfirm = () => handleRemoveMember(memberId);
      }
    }

    setConfirmModal(config);
  };
  const closeConfirmDialog = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const currentConvFromStore = conversations.find(
    (c) => String(c._id) === String(selectedConversation?._id)
  ) || selectedConversation;

  const isPinned = Boolean(
    currentConvFromStore?.pinnedBy?.some(
      (p) => String(p.userId) === String(currentUser?.idUser)
    )
  );

  const handleTogglePinFromPanel = async () => {
    if (!selectedConversation?._id || pinLoading) return;

    if (isPinned) {
      setPinLoading(true);
      try {
        const res = await conversation.togglePin(selectedConversation._id);
        if (res.data?.success) {
          updateConversationPin(selectedConversation._id, currentUser?.idUser, false);
          toast.success("Đã bỏ ghim cuộc trò chuyện");
        }
      } catch (error) {
        toast.error(error?.data?.message || "Lỗi khi bỏ ghim");
      } finally {
        setPinLoading(false);
      }
    } else {
      const pinnedCount = conversations.filter((c) =>
        c.pinnedBy?.some((p) => String(p.userId) === String(currentUser?.idUser))
      ).length;

      if (pinnedCount >= 5) {
        setOpenPinModal(true);
        return;
      }

      setPinLoading(true);
      try {
        const res = await conversation.togglePin(selectedConversation._id);
        if (res.data?.success) {
          updateConversationPin(
            selectedConversation._id,
            currentUser?.idUser,
            true,
            res.data.pinnedAt
          );
          toast.success("Đã ghim cuộc trò chuyện lên đầu");
        }
      } catch (error) {
        if (
          error?.data?.code === "MAX_PINNED_REACHED" ||
          error?.response?.data?.code === "MAX_PINNED_REACHED"
        ) {
          setOpenPinModal(true);
        } else {
          toast.error(error?.data?.message || "Lỗi khi ghim cuộc trò chuyện");
        }
      } finally {
        setPinLoading(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white border-l border-gray-200 select-none overflow-y-auto">
      {/* 1. Header Tiêu đề (Đổi chữ linh hoạt theo ảnh) */}
      <div className="flex h-[64px] items-center justify-center border-b border-gray-200 px-4 shrink-0">
        <h2 className="text-[17px] font-semibold text-[#1f2328]">
          {isGroup ? "Thông tin nhóm" : "Thông tin hội thoại"}
        </h2>
      </div>

      {/* 2. Phần Profile User / Group */}
      <div className="flex flex-col items-center border-b-[8px] border-[#f4f5f7] py-6 px-4 text-center">

        {/* Khung chứa Avatar (Nếu là nhóm thì render avatar xếp chồng như ảnh) */}
        <div className="relative mb-3 size-[72px] shrink-0 flex items-center justify-center">
          {isGroup ? (
            selectedConversation?.avatar ? (
              <img
                src={getImageUrl(selectedConversation.avatar)}
                alt={displayName}
                className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
              />
            )
              : (
                <div className="relative size-full">
                  {/* Ảnh thành viên 1 */}
                  <img
                    src={getImageUrl(members[0]?.avatar)}
                    className="absolute top-0 left-1 size-9 rounded-full border-2 border-white object-cover shadow-sm z-20"
                    alt="mem1"
                  />
                  {/* Ảnh thành viên 2 */}
                  <img
                    src={getImageUrl(members[1]?.avatar)}
                    className="absolute top-0 right-1 size-9 rounded-full border-2 border-white object-cover shadow-sm z-10"
                    alt="mem2"
                  />
                  {/* Ảnh thành viên 3 */}
                  <img
                    src={getImageUrl(members[2]?.avatar)}
                    className="absolute bottom-0 left-1 size-9 rounded-full border-2 border-white object-cover shadow-sm z-30"
                    alt="mem3"
                  />
                  {/* Vòng tròn số lượng */}
                  <div className="absolute bottom-0 right-1 size-9 rounded-full border-2 border-white bg-[#e2e6ea] flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm z-40">
                    {totalMembers}
                  </div>
                </div>
              )
          ) : (
            <img
              src={avatarDisplay}
              alt={displayName}
              className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
            />
          )}
        </div>

        {/* Tên kèm nút sửa đổi */}
        <div className="flex items-center gap-2 mb-6 justify-center w-full px-4">
          <span className="text-[18px] font-semibold text-[#1f2328] truncate max-w-[220px]">
            {displayName}
          </span>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors shrink-0">
            <Pencil size={15} />
          </button>
        </div>

        {/* Khối nút Action nhanh (Tự động đổi 3 hoặc 4 nút) */}
        {isGroup ? (
          <div className="grid grid-cols-4 gap-1 w-full max-w-[320px]">
            <button className="flex flex-col items-center gap-1.5 text-center group">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
                <BellOff size={18} />
              </div>
              <span className="text-[12px] text-gray-600 font-medium leading-tight">Tắt thông báo</span>
            </button>

            <button
              type="button"
              disabled={pinLoading}
              onClick={handleTogglePinFromPanel}
              className="flex flex-col items-center gap-1.5 text-center group cursor-pointer transition disabled:opacity-50"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full transition-colors ${
                  isPinned
                    ? "bg-[#e8edff] text-[#0068ff]"
                    : "bg-[#f1f3f5] text-[#1f2328] group-hover:bg-[#e2e6ea]"
                }`}
              >
                <Pin
                  size={18}
                  className={isPinned ? "-rotate-45" : ""}
                  fill={isPinned ? "#0068ff" : "none"}
                />
              </div>
              <span
                className={`text-[12px] font-medium leading-tight ${
                  isPinned ? "text-[#0068ff] font-semibold" : "text-gray-600"
                }`}
              >
                {isPinned ? "Bỏ ghim" : "Ghim hội thoại"}
              </span>
            </button>

            <button
              className="flex flex-col items-center gap-1.5 text-center group"
              onClick={() => setOpenAddMembers(true)}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
                <UserPlus size={18} />
              </div>
              <span className="text-[12px] text-gray-600 font-medium leading-tight">Thêm thành viên</span>
            </button>

            <button className="flex flex-col items-center gap-1.5 text-center group">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
                <Settings size={18} />
              </div>
              <span className="text-[12px] text-gray-600 font-medium leading-tight">Quản lý nhóm</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
            <button className="flex flex-col items-center gap-1.5 text-center group">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
                <BellOff size={18} />
              </div>
              <span className="text-[12px] text-gray-600 font-medium px-1">Tắt thông báo</span>
            </button>

            <button
              type="button"
              disabled={pinLoading}
              onClick={handleTogglePinFromPanel}
              className="flex flex-col items-center gap-1.5 text-center group cursor-pointer transition disabled:opacity-50"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full transition-colors ${
                  isPinned
                    ? "bg-[#e8edff] text-[#0068ff]"
                    : "bg-[#f1f3f5] text-[#1f2328] group-hover:bg-[#e2e6ea]"
                }`}
              >
                <Pin
                  size={18}
                  className={isPinned ? "-rotate-45" : ""}
                  fill={isPinned ? "#0068ff" : "none"}
                />
              </div>
              <span
                className={`text-[12px] font-medium px-1 ${
                  isPinned ? "text-[#0068ff] font-semibold" : "text-gray-600"
                }`}
              >
                {isPinned ? "Bỏ ghim" : "Ghim hội thoại"}
              </span>
            </button>

            <button className="flex flex-col items-center gap-1.5 text-center group">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
                <UserPlus size={18} />
              </div>
              <span className="text-[12px] text-gray-600 font-medium px-1">Tạo nhóm trò chuyện</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Phần thân danh sách thông tin */}
      {isGroup ? (
        /* ======================== GIAO DIỆN NHÓM (THEO ẢNH) ======================== */
        <>
          {/* Mục Thả xuống: Thành viên nhóm */}
          <div className="flex flex-col border-b border-gray-100">
            <button
              onClick={() => setIsOpenMembers(!isOpenMembers)}
              className="flex items-center justify-between px-4 py-3.5 text-left font-semibold text-[15px] text-[#1f2328] hover:bg-gray-50"
            >
              <span>Thành viên nhóm</span>
              {isOpenMembers ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {isOpenMembers && (
              <button
                onClick={onOpenMembers}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users2 size={18} className="text-gray-500" />
                  <span className="font-medium">{totalMembers} thành viên</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Mục Thả xuống: Bảng tin nhóm */}
          <div className="flex flex-col border-b-[8px] border-[#f4f5f7]">
            <button
              onClick={() => setIsOpenNewsboard(!isOpenNewsboard)}
              className="flex items-center justify-between px-4 py-3.5 text-left font-semibold text-[15px] text-[#1f2328] hover:bg-gray-50"
            >
              <span>Bảng tin nhóm</span>
              {isOpenNewsboard ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {isOpenNewsboard && (
              <div className="flex flex-col text-[14px] pb-2 animate-fade-in">
                <button className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                  <AlarmClock size={19} className="text-gray-500" />
                  <span className="text-[#1f2328] font-medium flex-1">Danh sách nhắc hẹn</span>
                </button>
                <button className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                  <StickyNote size={19} className="text-gray-500" />
                  <span className="text-[#1f2328] font-medium flex-1">Ghi chú, ghim, bình chọn</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ======================== GIAO DIỆN CÁ NHÂN CŨ CỦA BẠN ======================== */
        <div className="flex flex-col border-b-[8px] border-[#f4f5f7] py-1 text-[14px]">
          <button className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
            <AlarmClock size={19} className="text-gray-500" />
            <span className="text-[#1f2328] font-medium flex-1">Danh sách nhắc hẹn</span>
          </button>

          <button className="flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
            <Users size={19} className="text-gray-500" />
            <span className="text-[#1f2328] font-medium flex-1">20 nhóm chung</span>
          </button>
        </div>
      )}

      {/* 4. Mục Ảnh/Video (Dùng chung cho cả 2 nhưng đổi border dưới cho mượt UI tùy loại view) */}
      <div className={`flex flex-col ${isGroup ? 'border-b border-gray-100' : 'border-b-[8px] border-[#f4f5f7]'}`}>
        <button
          onClick={() => setIsOpenMedia(!isOpenMedia)}
          className="flex items-center justify-between px-4 py-3.5 text-left font-semibold text-[15px] text-[#1f2328] hover:bg-gray-50"
        >
          <span>Ảnh/Video</span>
          {isOpenMedia ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {isOpenMedia && (
          <div className="px-4 pb-4 animate-fade-in">
            <div className="grid grid-cols-4 gap-1.5">
              {realMediaItems?.map((item) => (
                <div key={item._id} className="aspect-square w-full overflow-hidden rounded-sm bg-gray-100 border border-gray-200/50 cursor-pointer hover:opacity-90">
                  <img src={getImageUrl(item?.image, "")} alt="media" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <button
              onClick={() => onOpenMediaArchive()}
              className="mt-3 flex h-9 w-full items-center justify-center rounded-md bg-[#f1f3f5] text-[14px] font-semibold text-[#1f2328] hover:bg-[#e2e6ea] transition-colors">
              Xem tất cả
            </button>
          </div>
        )}
      </div>

      {/* 5. Mục File đính kèm (Dùng chung) */}
      <div className="flex flex-col pb-6">
        <button
          onClick={() => setIsOpenFiles(!isOpenFiles)}
          className="flex items-center justify-between px-4 py-3.5 text-left font-semibold text-[15px] text-[#1f2328] hover:bg-gray-50"
        >
          <span>File</span>
          {isOpenFiles ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {isOpenFiles && (
          <div className="px-4 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-start gap-3 cursor-pointer group p-1 rounded-md hover:bg-gray-50">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <FileVideo size={22} fill="currentColor" className="text-purple-100 stroke-purple-600" />
              </div>
              <div className="min-w-0 flex-1 text-[13px]">
                <div className="truncate font-medium text-[#1f2328] pr-2">
                  localhost_8080 _ mysql _ cap... 9-56.mp4
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-gray-400 text-[11px]">
                  <span>39.78 MB</span>
                  <Info size={12} className="text-gray-400" />
                  <span className="ml-auto text-gray-400 font-normal">26/03/2026</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* 6. Nút Xóa lịch sử trò chuyện */}
      <div className="mt-auto border-t-[8px] border-[#f4f5f7] flex flex-col text-[14px]">
        <button
          onClick={() => openConfirmDialog('deleteConversation', null)}
          className="flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50/50 transition-colors text-[#e03131]"
        >
          <Trash2 size={19} className="text-[#e03131] stroke-[1.8]" />
          <span className="font-medium">Xoá lịch sử trò chuyện</span>
        </button>
      </div>

      {isGroup && (
        <div className="mt-auto border-t-[8px] border-[#f4f5f7] flex flex-col text-[14px]">
          <button
            onClick={() => openConfirmDialog('removeMember', userId)}
            className="flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50/50 transition-colors text-[#e03131]"
          >
            <LogOut size={19} className="text-[#e03131] stroke-[1.8]" />
            <span className="font-medium">Rời nhóm</span>
          </button>
        </div>
      )}
      {/* Confirm Modal giữ nguyên bản của bạn nhưng qua Portal */}
      {confirmModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeConfirmDialog} />
          <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 shadow-xl border border-gray-100 scale-in-center">
            <button
              type="button"
              onClick={closeConfirmDialog}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={closeConfirmDialog}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="h-9 rounded-lg bg-[#0561ff] px-4 text-sm font-medium text-white hover:bg-[#0052db] transition shadow-sm"
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirmDialog();
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal chọn trưởng nhóm mới trước khi rời nhóm */}
      {openTransferModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setOpenTransferModal(false);
              setSelectedNewAdmin(null);
            }}
          />
          <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 shadow-xl border border-gray-100 scale-in-center">
            <button
              type="button"
              onClick={() => {
                setOpenTransferModal(false);
                setSelectedNewAdmin(null);
              }}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chọn trưởng nhóm mới</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Bạn cần chỉ định một thành viên làm trưởng nhóm mới trước khi bạn rời nhóm.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {members
                .filter((m) => String(m._id) !== adminIdStr)
                .map((m) => {
                  const isSelected = String(selectedNewAdmin) === String(m._id);
                  return (
                    <div
                      key={m._id}
                      onClick={() => setSelectedNewAdmin(m._id)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-200"
                          : "hover:bg-gray-50 border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedNewAdmin(m._id)}
                        className="w-4 h-4 text-[#0052cc] accent-[#0052cc]"
                      />
                      <img
                        src={getImageUrl(m.avatar)}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        alt={m.fullname}
                      />
                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">
                        {m.fullname}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => {
                  setOpenTransferModal(false);
                  setSelectedNewAdmin(null);
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!selectedNewAdmin}
                className={`h-9 rounded-lg px-4 text-sm font-medium text-white transition ${
                  selectedNewAdmin
                    ? "bg-[#0052cc] hover:bg-[#0047b3] shadow-sm cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={async () => {
                  await handleRemoveMember(userId, selectedNewAdmin);
                  setOpenTransferModal(false);
                  setSelectedNewAdmin(null);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {openAddMembers && (
        <AddMembersModal
          conversations={selectedConversation}
          onClose={() => setOpenAddMembers(false)}
        />
      )}
      {openPinModal && (
        <PinLimitModal
          isOpen={openPinModal}
          onClose={() => setOpenPinModal(false)}
          targetConversation={currentConvFromStore}
        />
      )}
    </div>
  );
};

export default DetailsPanel;