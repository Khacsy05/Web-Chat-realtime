import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/stores/useAuthStore';
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
  AlertTriangle, // Thêm icon này
  Trash2,
  X
} from 'lucide-react';
import conversation from '@/service/conversation';

const DetailsPanel = ({ selectedConversation ,onSelectConversation, onMobileBack}) => {
  const currentUser = useAuthStore((state) => state.user);
  
  // Trạng thái đóng/mở các mục thả xuống (Accordion)
  const [isOpenMedia, setIsOpenMedia] = useState(true);
  const [isOpenFiles, setIsOpenFiles] = useState(true);
  const [confirmModal,setConfirmModal] = useState(false)
  const otherMember =
    selectedConversation?.members?.find(
      (member) => String(member.userId) !== String(currentUser?._id)
    ) || selectedConversation?.members?.[0];

  const displayName = otherMember?.fullname || 'Nguoi dung';

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

      if (onSelectConversation) {
        onSelectConversation(null);
      }
      // 3. Dự phòng thêm lệnh quay lại giao diện danh sách chat cho mobile
      if (onMobileBack) {
        onMobileBack();
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi:", error);
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-white border-l border-gray-200 select-none overflow-y-auto">
      {/* 1. Header Tiêu đề */}
      <div className="flex h-[64px] items-center justify-center border-b border-gray-200 px-4 shrink-0">
        <h2 className="text-[17px] font-semibold text-[#1f2328]">Thông tin hội thoại</h2>
      </div>

      {/* 2. Phần Profile User (Avatar, Tên, Các nút tương tác nhanh) */}
      <div className="flex flex-col items-center border-b-[8px] border-[#f4f5f7] py-6 px-4 text-center">
        {/* Khung chứa Avatar */}
        <div className="relative mb-3 size-[72px] shrink-0 rounded-full border border-gray-100 shadow-sm">
          <img
            src={`http://localhost:5000${otherMember?.avatar || "/uploads/default-avatar.png"}`}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        {/* Tên kèm nút sửa đổi (Pen icon) */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[18px] font-semibold text-[#1f2328]">{displayName}</span>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <Pencil size={15} />
          </button>
        </div>

        {/* Khối 3 nút Action nhanh giống Zalo */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
          <button className="flex flex-col items-center gap-1.5 text-center group">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
              <BellOff size={18} />
            </div>
            <span className="text-[12px] text-gray-600 font-medium px-1">Tắt thông báo</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 text-center group">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
              <Pin size={18} />
            </div>
            <span className="text-[12px] text-gray-600 font-medium px-1">Ghim hội thoại</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 text-center group">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#1f2328] transition-colors group-hover:bg-[#e2e6ea]">
              <UserPlus size={18} />
            </div>
            <span className="text-[12px] text-gray-600 font-medium px-1">Tạo nhóm trò chuyện</span>
          </button>
        </div>
      </div>

      {/* 3. Danh sách nhắc hẹn & Nhóm chung */}
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

      {/* 4. Thả xuống: Mục Ảnh/Video */}
      <div className="flex flex-col border-b-[8px] border-[#f4f5f7]">
        <button 
          onClick={() => setIsOpenMedia(!isOpenMedia)}
          className="flex items-center justify-between px-4 py-3.5 text-left font-semibold text-[15px] text-[#1f2328] hover:bg-gray-50"
        >
          <span>Ảnh/Video</span>
          {isOpenMedia ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {isOpenMedia && (
          <div className="px-4 pb-4 animate-fade-in">
            {/* Grid ảnh tỉ lệ 1:1 bao gồm 4 cột dọc */}
            <div className="grid grid-cols-4 gap-1.5">
              {mediaItems.map((item) => (
                <div key={item.id} className="aspect-square w-full overflow-hidden rounded-sm bg-gray-100 border border-gray-200/50 cursor-pointer hover:opacity-90">
                  <img src={item.src} alt="media" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            
            {/* Nút Xem tất cả màu xám nhạt */}
            <button className="mt-3 flex h-9 w-full items-center justify-center rounded-md bg-[#f1f3f5] text-[14px] font-semibold text-[#1f2328] hover:bg-[#e2e6ea] transition-colors">
              Xem tất cả
            </button>
          </div>
        )}
      </div>

      {/* 5. Thả xuống: Mục File đính kèm */}
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
            {/* Khối hiển thị File Mp4 đính kèm mẫu */}
            <div className="flex items-start gap-3 cursor-pointer group p-1 rounded-md hover:bg-gray-50">
              {/* Box Icon Video màu tím bo tròn */}
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

      {/* Nút Xóa lịch sử trò chuyện (Màu đỏ nguy hiểm) */}
      <div className="mt-auto border-t-[8px] border-[#f4f5f7] flex flex-col text-[14px]">
      
        <button 
          onClick={() => {
            setConfirmModal(true)
          }}
          className="flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50/50 transition-colors text-[#e03131]"
        >
          <Trash2 size={19} className="text-[#e03131] stroke-[1.8]" />
          <span className="font-medium">Xoá lịch sử trò chuyện</span>
        </button>
      </div>
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Lớp nền mờ đen phía sau */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setConfirmModal(false)} // Sửa chính tả thành setConfirmModal
          />
          
          {/* Khung nội dung Popup */}
          {/* Thêm class "relative" để làm gốc định vị cho nút X tuyệt đối */}
          <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all border border-gray-100 scale-in-center">
            
            {/* 🌟 NÚT DẤU X Ở GÓC TRÊN BÊN PHẢI */}
            <button
              type="button"
              onClick={() => setConfirmModal(false)}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Đóng popup"
            >
              {/* Đảm bảo bạn đã import { X } from 'lucide-react' ở đầu file */}
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Nội dung thông báo */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0 pr-6"> {/* Thêm pr-6 để chữ không bị đè lên nút X */}
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.
                  Bạn có chắc chắn muốn xóa?
                </p>
              </div>
            </div>

            {/* Các nút bấm hành động của Popup */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setConfirmModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="h-9 rounded-lg bg-[#0561ff] px-4 text-sm font-medium text-white hover:bg-[#0052db] transition shadow-sm"
                onClick={() => {
                  setConfirmModal(false);
                  handleDeleteConversation();
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPanel;