import React from 'react';
import { Pencil, ArrowLeft, MoreHorizontal, Settings, LogOut, ArrowRight } from 'lucide-react';

const GroupInfoModal = ({ initialData }) => {
  // Sửa lỗi: Đảm bảo members luôn là mảng, nếu chưa có dữ liệu sẽ là mảng rỗng [] để không bị lỗi map
  const members = initialData?.members || [];

  // Lấy tối đa 4 thành viên đầu tiên để hiển thị avatar đè nhau lên giao diện
  const displayedMembers = members.slice(0, 4);

  // Hiển thị tổng số thành viên thực tế của nhóm
  const totalMembers = initialData?.memberCount || members.length;

  // Dữ liệu giả lập cho phần Ảnh/Video
  const mediaItems = [
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=150&auto=format&fit=crop&q=60' },
    { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1581291518655-9523c932dedf?w=150&auto=format&fit=crop&q=60' },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="w-full text-sans select-none">
      
      {/* Group Profile Info */}
      <div className="flex flex-col items-center pb-5 border-b border-gray-100">
        <div className="relative group cursor-pointer mb-2.5">
          {/* Avatar nhóm mặc định */}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gray-200 text-gray-400">
            <svg className="h-11 w-11" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {/* Nút Đổi Avatar */}
          <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-gray-50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Tên nhóm */}
        <div className="flex items-center gap-1.5 cursor-pointer group mb-3.5">
          <span className="text-[15px] font-medium text-gray-800 group-hover:text-blue-600">
            {initialData?.name || "Nhóm chưa đặt tên"}
          </span>
          <Pencil size={13} className="text-gray-400 group-hover:text-blue-500" />
        </div>

        {/* Nút Nhắn tin */}
        <button className="w-full rounded bg-[#e8eaed] py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-300 transition-colors">
          Nhắn tin
        </button>
      </div>

      {/* Members Section */}
      <div className="py-4 border-b border-gray-100">
        {/* Số lượng thành viên hiển thị động */}
        <h3 className="text-[13.5px] font-medium text-gray-800 mb-2.5">Thành viên ({totalMembers})</h3>
        
        <div className="flex items-center -space-x-1.5 isolate">
          {/* Render linh hoạt theo số lượng phần tử thực tế của mảng hiển thị */}
          {displayedMembers.map((member, index) => (
            <div 
              key={member._id || member.id || index} 
              className="relative"
              style={{ zIndex: displayedMembers.length - index }} // Tự động tính toán z-index đè lên nhau chuẩn Zalo
            >
              <img 
                src={`http://localhost:5000${member?.avatar || '/uploads/default-avatar.png'}`} 
                alt={member?.fullname || 'Member'} 
                className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          ))}
          
          {/* Nút xem thêm, tự động căn khoảng cách phù hợp dựa trên việc có hay không có avatar */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm z-10 !ml-2">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Media Section */}
      <div className="py-4 border-b border-gray-100">
        <h3 className="text-[13.5px] font-medium text-gray-800 mb-2.5">Ảnh/Video</h3>
        <div className="grid grid-cols-4 gap-2">
          {mediaItems.map((item) => (
            <div key={item.id} className="aspect-square rounded overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer hover:opacity-90">
              <img src={item.url} alt="Media" className="h-full w-full object-cover" />
            </div>
          ))}
          
          {/* Nút Xem thêm */}
          <button className="flex aspect-square items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Action Options */}
      <div className="pt-2 flex flex-col gap-0.5">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-[14.5px] text-gray-700 hover:bg-gray-100 transition-colors text-left">
          <Settings size={16} className="text-gray-500" />
          <span>Quản lý nhóm</span>
        </button>
        
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-[14.5px] text-red-600 hover:bg-red-50 transition-colors text-left">
          <LogOut size={16} className="text-red-500" />
          <span className="font-medium">Rời nhóm</span>
        </button>
      </div>

    </div>
  );
};

export default GroupInfoModal;