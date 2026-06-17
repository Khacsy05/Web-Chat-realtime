import React, { useState } from 'react';
import { X, ChevronDown, Image, FileText, Link2 } from 'lucide-react';
import useMessStore from '@/stores/useMessStore';
import ImageViewer from '@/components/ImageViewer';


const MediaArchiveModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'files' | 'links'
  const [viewingImg, setViewingImg] = useState(null);

  // Lấy toàn bộ tin nhắn thực tế từ store
  const messages = useMessStore((state) => state.mess) || [];

  // Lọc dữ liệu theo từng Tab
  const mediaItems = messages.filter(m => m.type === 'image' && !m.isDeleted);
  const fileItems = messages.filter(m => m.type === 'file' && !m.isDeleted);
  const linkItems = messages.filter(m => m.type === 'text' && m.content?.includes('http') && !m.isDeleted);

  // Hàm nhóm các vật phẩm theo ngày gửi (Giống "Ngày 17 Tháng 6" trong ảnh)
  const groupItemsByDate = (items) => {
    const groups = {};
    items.forEach((item) => {
      // Chuyển đổi createdAt thành chuỗi định dạng: "Ngày DD Tháng MM"
      const dateObj = new Date(item.createdAt || Date.now());
      const dateString = `Ngày ${dateObj.getDate()} Tháng ${dateObj.getMonth() + 1}`;

      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(item);
    });
    return groups;
  };

  const groupedMedia = groupItemsByDate(mediaItems);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Lớp nền click để đóng */}


      {/* Panel Kho Lưu Trữ (Chiếm layout bên phải giống như sidebar mở rộng) */}
      <div className="relative h-full w-full max-w-[450px] bg-white shadow-2xl flex flex-col animate-slide-left z-10">

        {/* HEADER */}
        <div className="flex h-[64px] items-center justify-between border-b border-gray-200 px-4 shrink-0">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <X size={20} />
          </button>
          <h2 className="text-[17px] font-semibold text-gray-800 flex-1 text-center pr-6">
            Kho lưu trữ
          </h2>
        </div>

        {/* TABS (Ảnh/Video | Files | Links) */}
        <div className="flex border-b border-gray-200 text-[15px] font-medium text-gray-500 shrink-0">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'media' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-gray-700'}`}
          >
            Ảnh/Video
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'files' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-gray-700'}`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${activeTab === 'links' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-gray-700'}`}
          >
            Links
          </button>
        </div>

        {/* FILTERS (Người gửi | Ngày gửi) */}
        <div className="flex gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
          <button className="flex items-center gap-1 bg-white border border-gray-200 text-xs text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100">
            <span>Người gửi</span>
            <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1 bg-white border border-gray-200 text-xs text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100">
            <span>Ngày gửi</span>
            <ChevronDown size={13} />
          </button>
        </div>

        {/* NỘI DUNG SỬ DỤNG SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar flex flex-col">

          {/* TAB 1: ẢNH / VIDEO */}
          {activeTab === 'media' && (
            Object.keys(groupedMedia).length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-20 text-gray-400 gap-2">
                <Image size={40} className="stroke-[1.2]" />
                <span className="text-xs italic">Chưa có ảnh hoặc video nào</span>
              </div>
            ) : (
              Object.keys(groupedMedia).map((dateLabel) => (
                <div key={dateLabel} className="mb-6">
                  {/* Tiêu đề ngày gửi */}
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3">{dateLabel}</h3>
                  {/* Grid ảnh 3 cột giống hệt Zalo */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {groupedMedia[dateLabel].map((item) => (
                      <div
                        key={item._id || item.messageId}
                        onClick={() => setViewingImg(`http://localhost:5000${item.image}`)}
                        className="aspect-square w-full overflow-hidden bg-gray-100 rounded-sm cursor-pointer hover:brightness-90 transition-all border border-gray-150"
                      >
                        <img
                          src={`http://localhost:5000${item.image}`}
                          alt="archive-media"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 2: FILES */}
          {activeTab === 'files' && (
            fileItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-20 text-gray-400 gap-2">
                <FileText size={40} className="stroke-[1.2]" />
                <span className="text-xs italic">Chưa có file tài liệu nào</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {fileItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <div className="p-2 bg-red-50 text-red-500 rounded-md">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 truncate">{item.content || "Tài liệu đính kèm"}</p>
                      <span className="text-[11px] text-gray-400">File tài liệu</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: LINKS */}
          {activeTab === 'links' && (
            linkItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-20 text-gray-400 gap-2">
                <Link2 size={40} className="stroke-[1.2]" />
                <span className="text-xs italic">Chưa có liên kết (Link) nào</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {linkItems.map((item) => (
                  <a
                    key={item._id}
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-50/40 rounded-lg border border-blue-150/40 hover:bg-blue-50 block min-w-0"
                  >
                    <p className="text-[13px] text-blue-600 font-medium truncate mb-1">{item.content}</p>
                    <span className="text-[11px] text-gray-400">Liên kết được chia sẻ</span>
                  </a>
                ))}
              </div>
            )
          )}

        </div>
      </div>

      {/* POPUP PHÓNG TO ẢNH KHI CLICK VÀO HÌNH THU NHỎ */}
      {viewingImg && (
        <ImageViewer src={viewingImg} onClose={() => setViewingImg(null)} />
      )}
    </div>
  );
};

export default MediaArchiveModal;