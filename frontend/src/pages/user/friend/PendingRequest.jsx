import user from '@/service/user';
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react'; // Dùng icon cảnh báo cho popup
import Modal from '@/components/Modal';
import ProfileFriend from './ProfileFriend';

const PendingRequest = () => {
  const { openFriendSidebar, isNarrowScreen: isNarrowFromLayout } = useOutletContext() ?? {};
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);

  const [openProfile, setOpenProfile] = useState(null);
  // --- STATE QUẢN LÝ POPUP XÁC NHẬN ---
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {}, // Hàm sẽ chạy khi người dùng bấm "Đồng ý"
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: 1023px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showBackButton = isNarrowFromLayout ?? isNarrowScreen;

  const fetchAllRequests = async () => {
    user.receivedRequest()
      .then(res => setReceivedRequests(res.data || []))
      .catch(err => console.error('Lỗi tải lời mời nhận được:', err))
      .finally(() => setLoadingReceived(false));

    // Gọi API lời mời đã gửi
    user.sentRequest()
      .then(res => setSentRequests(res.data || []))
      .catch(err => console.error('Lỗi tải lời mời đã gửi:', err))
      .finally(() => setLoadingSent(false));
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // --- CÁC HÀM XỬ LÝ CHỨC NĂNG SAU KHI USER XÁC NHẬN TRÊN POPUP ---
  
  // 1. Xử lý Thu hồi (Lời mời đã gửi)
  const executeCancelRequest = async (idRequest) => {
    try {
      await user.cancelRequest(idRequest);
      setSentRequests((prev) => prev.filter(item => item._id !== idRequest));
    } catch (error) {
      console.error("Lỗi khi thu hồi:", error);
    }
  };

  // 2. Xử lý Xác nhận kết bạn (Lời mời nhận được)
  const executeAcceptRequest = async (idRequest) => {
    try {
      await user.acceptRequest(idRequest);
      setReceivedRequests((prev) => prev.filter(item => item._id !== idRequest));
      console.log("Đã chấp nhận kết bạn:", idRequest);
    } catch (error) {
      console.error("Lỗi khi chấp nhận kết bạn:", error);
    }
  };

  // 3. Xử lý Từ chối/Hủy lời mời (Lời mời nhận được)
  const executeDeclineRequest = async (idRequest) => {
    try {
      await user.rejectRequest(idRequest);
      setReceivedRequests((prev) => prev.filter(item => item._id !== idRequest));
      console.log("Đã từ chối lời mời:", idRequest);
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời:", error);
    }
  };

  // --- HÀM MỞ POPUP (KÍCH HOẠT KHI BẤM NÚT TRÊN CÁC CARD) ---
  const openConfirmDialog = (type, idRequest, name) => {
    let config = {
      isOpen: true,
      title: "",
      description: "",
      onConfirm: () => {}
    };

    if (type === 'cancel') {
      config.title = "Thu hồi lời mời";
      config.description = `Bạn có chắc chắn muốn thu hồi lời mời kết bạn đã gửi tới ${name}?`;
      config.onConfirm = () => executeCancelRequest(idRequest);
    } else if (type === 'accept') {
      config.title = "Xác nhận kết bạn";
      config.description = `Đồng ý kết bạn với ${name}? Bạn và người này sẽ trở thành bạn bè trên hệ thống.`;
      config.onConfirm = () => executeAcceptRequest(idRequest);
    } else if (type === 'decline') {
      config.title = "Hủy lời mời kết bạn";
      config.description = `Bạn có chắc chắn muốn xóa lời mời kết bạn từ ${name}?`;
      config.onConfirm = () => executeDeclineRequest(idRequest);
    }

    setConfirmModal(config);
  };

  // Đóng popup
  const closeConfirmDialog = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };


  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#f0f2f5] relative">
      
      {/* HEADER */}
      <div className="shrink-0 border-b bg-white px-4 py-4">
        <div className="flex items-center gap-2 text-[16px] font-semibold text-[#1f2328]">
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
          <span>Lời mời kết bạn</span>
        </div>
      </div>

      {/* BODY CONTAINER SỬ DỤNG SCROLL */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
        
        {/* KHU VỰC 1: LỜI MỜI NHẬN ĐƯỢC */}
        <div className="space-y-3">
          <h2 className="text-[15px] font-semibold text-gray-800">
            Lời mời nhận được ({receivedRequests.length})
          </h2>
          
          {receivedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-transparent py-6 text-center">
              <p className="text-[14px] font-medium text-gray-500">Bạn không có lời mời nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {receivedRequests.map((item) => {
                const sender = item.from || {};
                return (
                  <div key={item._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setOpenProfile(sender)}
                      >
                        <img
                          src={`http://localhost:5000${sender.avatar || '/uploads/default-avatar.png'}`}
                          onError={(e) => { e.target.src = 'https://gwb-assets.s3.amazonaws.com/default-avatar.png' }}
                          alt={sender.fullname}
                          className="size-14 rounded-full object-cover border border-gray-100"
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-[15px] font-semibold text-gray-900 leading-snug">
                          {sender.fullname || 'Người dùng'}
                        </h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Muốn kết bạn với bạn</p>
                      </div>                       
                    </div>

                    <div className="mt-4">
                      <div className='flex w-full gap-2'>
                        <Button 
                          variant="secondary"
                          className="flex-1 h-9 rounded-lg bg-[#0561ff] text-white hover:bg-[#0052db] font-medium text-[14px]"
                          onClick={() => openConfirmDialog('accept', item._id, sender.fullname)}
                        >
                          Xác nhận
                        </Button>
                        <Button 
                          variant="secondary"
                          className="flex-1 h-9 rounded-lg bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf] font-medium text-[14px]"
                          onClick={() => openConfirmDialog('decline', item._id, sender.fullname)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KHU VỰC 2: LỜI MỜI ĐÃ GỬI */}
        <div className="space-y-3">
          <h2 className="text-[15px] font-semibold text-gray-800">
            Lời mời đã gửi ({sentRequests.length})
          </h2>

          {sentRequests.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400 bg-white rounded-lg p-4 border">
              Không có lời mời kết bạn nào đã gửi.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentRequests.map((item) => {
                const receiver = item.to || {};
                return (
                  <div key={item._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setOpenProfile(receiver)}
                      >
                        <img
                          src={`http://localhost:5000${receiver.avatar || '/uploads/default-avatar.png'}`}
                          onError={(e) => { e.target.src = 'https://gwb-assets.s3.amazonaws.com/default-avatar.png' }}
                          alt={receiver.fullname}
                          className="size-14 rounded-full object-cover border border-gray-100"
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-[15px] font-semibold text-gray-900 leading-snug">
                          {receiver.fullname || 'Người dùng'}
                        </h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Bạn đã gửi lời mời</p>
                      </div>                       
                    </div>

                    <div className="mt-4">
                      <Button 
                        variant="secondary"
                        className="w-full h-9 rounded-lg bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf] font-medium text-[14px]"
                        onClick={() => openConfirmDialog('cancel', item._id, receiver.fullname)}
                      >
                        Thu hồi lời mời
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* MENU POPUP XÁC NHẬN (CONFIRM DIALOG MODAL) */}
      {/* ======================================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Lớp nền mờ đen phía sau */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeConfirmDialog} // Bấm ra ngoài rìa tự đóng popup
          />
          
          {/* Khung nội dung Popup */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all border border-gray-100 scale-in-center">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={closeConfirmDialog}
                className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Đóng popup"
              >
                {/* Đảm bảo bạn đã import { X } from 'lucide-react' ở đầu file */}
                <X size={18} strokeWidth={2.5} />
              </button>
              <div className="flex-1 min-w-0">
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
                className="h-9 rounded-lg bg-[#0561ff] px-4 text-sm font-medium text-white hover:bg-[#0052db] transition shadow-sm"
                onClick={() => {
                  confirmModal.onConfirm(); // Chạy tác vụ đã được nạp sẵn
                  closeConfirmDialog();     // Thực hiện xong tự đóng popup
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {openProfile && (
        <Modal
          title="Thông tin tài khoản"
          onClose={() => setOpenProfile(null)}
          size="md"
        >
          <ProfileFriend userId={openProfile._id}/>
        </Modal>       
      )}
    </div>
  );
};

export default PendingRequest;