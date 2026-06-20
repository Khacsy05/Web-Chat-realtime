import user from '@/service/user';
import { Input } from '@/components/ui/input';
// 🌟 Đã bổ sung import icon X ở đây
import { ArrowUpDown, ChevronDown, Funnel, Search, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useOutletContext } from "react-router-dom";
import AllFriend from './AllFriend';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import ProfileFriend from '../profile/ProfileFriend';
import useFriendStore from '@/stores/useFriendStore';

const AddFriend = () => {
  const { openFriendSidebar, isNarrowScreen: isNarrowFromLayout } = useOutletContext() ?? {};
  const {
    allUsers: allUser,
    sentRequests,
    fetchUsers,
    fetchRequests,
    sendFriendRequest,
    cancelFriendRequest
  } = useFriendStore();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [searchValue, setSearchValue] = useState('');
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [openProfile, setOpenProfile] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: 1023px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showBackButton = isNarrowFromLayout ?? isNarrowScreen;

  // 1. Hàm gửi kết bạn trực tiếp (Không cần popup, bấm phát ăn ngay)
  const handleFriendRequest = async (idFriend) => {
    await sendFriendRequest(idFriend);
  };

  // 2. Hàm hủy yêu cầu kết bạn (Sẽ được kích hoạt sau khi bấm Đồng ý trên Modal)
  const handleCancelRequest = async (idRequest, idFriend) => {
    await cancelFriendRequest(idRequest, idFriend);
  };

  // 3. Logic nạp dữ liệu và cấu hình hiển thị cho Modal
  const openConfirmDialog = (type, idRequest, name, idFriend) => {
    let config = {
      isOpen: true,
      title: "",
      description: "",
      onConfirm: () => { }
    };

    if (type === 'cancel') {
      config.title = "Thu hồi lời mời";
      config.description = `Bạn có chắc chắn muốn thu hồi lời mời kết bạn đã gửi tới ${name}?`;
      // 🌟 Sửa lỗi: Gọi đúng hàm xóa/hủy request và truyền đủ tham số
      config.onConfirm = () => handleCancelRequest(idRequest, idFriend);
    }
    else if (type === 'sent') {
      config.title = "Gửi lời mời";
      config.description = `Bạn có chắc chắn muốn gửi lời mời kết bạn đã gửi tới ${name}?`;
      // 🌟 Sửa lỗi: Gọi đúng hàm xóa/hủy request và truyền đủ tham số
      config.onConfirm = () => handleFriendRequest(idFriend);
    }

    setConfirmModal(config);
  };

  // Đóng popup
  const closeConfirmDialog = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (allUser.length === 0) {
      fetchUsers();
    }
    if (sentRequests.length === 0) {
      fetchRequests();
    }
  }, [fetchUsers, fetchRequests, allUser.length, sentRequests.length]);

  const normalized = searchValue.trim().toLowerCase();
  const filteredFriend = allUser.filter((item) =>
    (item?.fullname || '').toLowerCase().includes(normalized)
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#f8f9fa]">
      {/* HEADER */}
      <div className="shrink-0 border-b bg-white px-3 py-3">
        <div className="flex items-center gap-2 p-2 text-[15px] font-medium text-[#1f2328]">
          {showBackButton && (
            <button
              type="button"
              className="mr-1 rounded-full p-2 hover:bg-[#f1f3f5]"
              onClick={() => openFriendSidebar?.()}
              aria-label="Quay lai"
            >
              ←
            </button>
          )}
          <Users size={20} />
          Danh sách người dùng
        </div>
      </div>

      <div className="shrink-0 px-5 py-3 text-sm text-muted-foreground">
        Người dùng ({filteredFriend.length})
      </div>

      {/* BODY CHÍNH */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
        <div className="flex min-h-full flex-col gap-2 rounded-sm bg-white p-2">
          {/* THANH SEARCH & FILTER */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tìm bạn"
                className="h-10 bg-white pl-9 hover:bg-[#f8f9fa]"
              />
            </div>

          </div>

          {/* VÒNG LẶP RENDER NGƯỜI DÙNG */}
          {filteredFriend.map((item) => {
            const requestInfo = sentRequests.find(req => String(req.to?._id) === String(item._id));
            const isSent = !!requestInfo;
            const userName = item?.fullname || 'Người dùng';
            return (
              <div
                key={item._id}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-gray-50"
              >
                <button onClick={() => setOpenProfile(item)}>
                  <img
                    src={`${API_BASE_URL}${item?.avatar || '/uploads/default-avatar.png'}`}
                    alt={userName}
                    className="size-11 rounded-full object-cover"
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[#1f2328]">
                    {userName}
                  </div>
                </div>

                <div>
                  {isSent ? (
                    /* 🌟 SỬA ONCLICK: Bấm thu hồi sẽ gọi qua hàm trung gian để kích hoạt Modal xác nhận */
                    <Button
                      className="bg-[#e9ecef] text-black hover:bg-[#dee2e6]"
                      onClick={() => openConfirmDialog('cancel', requestInfo._id, userName, item._id)}
                    >
                      Thu hồi
                    </Button>
                  ) : (
                    /* Thêm bạn thì cho gửi thẳng luôn không cần qua modal xác nhận phiền phức */
                    <Button
                      className="bg-[#0561ff] text-white hover:bg-[#0052db]"
                      onClick={() => openConfirmDialog('sent', null, userName, item._id)}
                    >
                      Thêm bạn
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredFriend.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground py-10">
              Không tìm thấy người dùng nào phù hợp.
            </div>
          )}
        </div>
      </div>

      {/* POPUP CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Lớp nền mờ đen phía sau */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeConfirmDialog}
          />

          {/* Khung nội dung Popup */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all border border-gray-100 scale-in-center">
            {/* Nút X đóng nhanh */}
            <button
              type="button"
              onClick={closeConfirmDialog}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Đóng popup"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmModal.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            {/* Các nút bấm hành động của Popup */}
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
                className="h-9 rounded-lg bg-[#e03131] px-4 text-sm font-medium text-white hover:bg-[#c92a2a] transition shadow-sm"
                onClick={() => {
                  confirmModal.onConfirm(); // Kích hoạt chạy hàm xóa/hủy đã nạp
                  closeConfirmDialog();     // Chạy xong đóng popup
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL DETAIL */}
      {openProfile && (
        <Modal
          title="Thông tin tài khoản"
          onClose={() => setOpenProfile(null)}
          size="md"
        >
          <ProfileFriend initialData={openProfile} />
        </Modal>
      )}
    </div>
  );
};

export default AddFriend;