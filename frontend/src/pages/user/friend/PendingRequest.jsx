import user from '@/service/user';
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext, Link } from "react-router-dom"; // Thêm Link nếu cần dùng
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, User, UserCheck, Mail, ChevronDown, ChevronUp } from 'lucide-react'; // Thêm các icon cần thiết
import Modal from '@/components/Modal';
import ProfileFriend from '../profile/ProfileFriend';

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

  // --- STATE QUẢN LÝ XEM THÊM (GIỐNG ZALO) ---
  const [showAllReceived, setShowAllReceived] = useState(false);
  const [showAllSent, setShowAllSent] = useState(false);

  // --- STATE QUẢN LÝ POPUP XÁC NHẬN ---
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {}, 
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

    user.sentRequest()
      .then(res => setSentRequests(res.data || []))
      .catch(err => console.error('Lỗi tải lời mời đã gửi:', err))
      .finally(() => setLoadingSent(false));
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // --- CÁC HÀM XỬ LÝ CHỨC NĂNG ---
  const executeCancelRequest = async (idRequest) => {
    try {
      await user.cancelRequest(idRequest);
      setSentRequests((prev) => prev.filter(item => item._id !== idRequest));
    } catch (error) {
      console.error("Lỗi khi thu hồi:", error);
    }
  };

  const executeAcceptRequest = async (idRequest) => {
    try {
      await user.acceptRequest(idRequest);
      setReceivedRequests((prev) => prev.filter(item => item._id !== idRequest));
    } catch (error) {
      console.error("Lỗi khi chấp nhận kết bạn:", error);
    }
  };

  const executeDeclineRequest = async (idRequest) => {
    try {
      await user.rejectRequest(idRequest);
      setReceivedRequests((prev) => prev.filter(item => item._id !== idRequest));
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời:", error);
    }
  };

  const openConfirmDialog = (type, idRequest, name) => {
    let config = { isOpen: true, title: "", description: "", onConfirm: () => {} };

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

  const closeConfirmDialog = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // --- LOGIC LỌC PHẦN TỬ ĐỂ HIỂN THỊ ---
  const displayedReceived = showAllReceived ? receivedRequests : receivedRequests.slice(0, 3);
  const displayedSent = showAllSent ? sentRequests : sentRequests.slice(0, 3);

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

      {/* BODY CONTAINER */}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedReceived.map((item) => {
                  const sender = item.from || {};
                  return (
                    <div key={item._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md animate-fade-in">
                      <div className="flex items-start gap-3">
                        <button onClick={() => setOpenProfile(sender)}>
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

              {/* Nút Xem thêm / Thu gọn của phần Nhận được */}
              {receivedRequests.length > 3 && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setShowAllReceived(!showAllReceived)}
                    className="flex items-center gap-1 text-[13px] font-semibold text-[#0561ff] hover:text-[#0052db] transition-colors bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100"
                  >
                    {showAllReceived ? (
                      <>Thu gọn <ChevronUp size={16} /></>
                    ) : (
                      <>Xem thêm ({receivedRequests.length - 3}) <ChevronDown size={16} /></>
                    )}
                  </button>
                </div>
              )}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSent.map((item) => {
                  const receiver = item.to || {};
                  return (
                    <div key={item._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md animate-fade-in">
                      <div className="flex items-start gap-3">
                        <button onClick={() => setOpenProfile(receiver)}>
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

              {/* Nút Xem thêm / Thu gọn của phần Đã gửi */}
              {sentRequests.length > 3 && (
                <div className="flex justify-start pt-1">
                  <button
                    onClick={() => setShowAllSent(!showAllSent)}
                    className="flex items-center gap-1 text-[13px] font-semibold text-[#0561ff] hover:text-[#0052db] transition-colors bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100"
                  >
                    {showAllSent ? (
                      <>Thu gọn <ChevronUp size={16} /></>
                    ) : (
                      <>Xem thêm ({sentRequests.length - 3}) <ChevronDown size={16} /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* MODAL XÁC NHẬN */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeConfirmDialog} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={closeConfirmDialog}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{confirmModal.description}</p>
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
        </div>
      )}

      {/* MODAL PROFILE */}
      {openProfile && (
        <Modal title="Thông tin tài khoản" onClose={() => setOpenProfile(null)} size="md">
          <ProfileFriend initialData={openProfile}/>
        </Modal>       
      )}
      
    </div>
  );
};

export default PendingRequest;