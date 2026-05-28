import user from '@/service/user';
import { Input } from '@/components/ui/input';
import { AlertTriangle, ArrowUpDown, ChevronDown, Funnel, MoreHorizontal, Search, Users, X } from 'lucide-react';
import React, {  useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from 'sonner';
import ProfileFriend from './ProfileFriend';
import Modal from '@/components/Modal';


const AllFriend = () => {
  const navigate = useNavigate();
  const { openFriendSidebar, isNarrowScreen: isNarrowFromLayout } = useOutletContext() ?? {};
  const [friend, setFriend] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const observerRef = useRef(null);
  const loadRef = useRef(null);
  const [totalFriends, setTotalFriends] = useState(0);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [openProfile, setOpenProfile] = useState(null);
  const [confirmModal,setConfirmModal] = useState(null)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: 1023px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showBackButton = isNarrowFromLayout ?? isNarrowScreen;
  const fetchFriend = async (reset = false) => {
    try {
      if (loading || (!hasMore && !reset)) return;

      setLoading(true);

      const res = await user.getAllFriend({
        limit: 7,
        after: reset ? null : cursor,
      });
      const newItems = res.data.items;
      const nextCursor = res.data.nextCursor;
      const more = res.data.hasMore;
      const total = res.data.total || 0;
      setFriend(prev => {
        if (reset) return newItems;
        // Filter out duplicate keys
        const existingIds = new Set(prev.map(item => item._id));
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item._id));
        return [...prev, ...uniqueNewItems];
      });

      setCursor(nextCursor);
      setHasMore(more);
      setTotalFriends(total);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching friend list:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriend(true);
  }, []);

  useEffect(() => {
    if (!loadRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchFriend();
        }
      },
      {
        threshold: 1,
      }
    );

    observerRef.current.observe(loadRef.current);

    return () => observerRef.current?.disconnect();
  }, [cursor, hasMore, loading]);


  // 1. Thêm hàm xử lý này vào trong AllFriend
useEffect(() => {
  const handleGlobalClick = () => {
    // Khi bấm vào bất cứ đâu trên màn hình, ta đóng dropdown
    if (activeDropdownId) {
      setActiveDropdownId(null);
    }
  };

  // Đăng ký sự kiện click toàn cục
  window.addEventListener('click', handleGlobalClick);

  return () => {
    // Xóa sự kiện khi thoát trang
    window.removeEventListener('click', handleGlobalClick);
  };
}, [activeDropdownId]);
  const normalized = searchValue.trim().toLowerCase();
  const filteredFriend = friend.filter((item) =>
    (item?.fullname || '').toLowerCase().includes(normalized)
  );

  const unFriend = async (friendId) => {
      try {
        const res = await user.unFriend(friendId);
        setFriend((prev) => prev.filter(item => item._id !== friendId));
        toast.success("Xoa thanh cong")
      } catch (error) {
        console.error("Lỗi khi xoa ban be:", error);
        toast.error("Xoa khong thanh cong")
      }
    };
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#f8f9fa]">
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
          Danh sach ban be
        </div>
      </div>

      <div className="shrink-0 px-5 py-3 text-sm text-muted-foreground">
        Ban be ({totalFriends})
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">    
        <div className="flex min-h-full flex-col gap-2 rounded-sm bg-white p-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-6 relative ">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tim ban"
                className="h-10 bg-white pl-9 hover:bg-[#f8f9fa]"
              />
            </div>

            <button
              type="button"
              className="hover:bg-[#f8f9fa] col-span-6 md:col-span-3 h-10 rounded-md border bg-white px-3 text-left text-sm text-[#1f2328] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ArrowUpDown size={16} />
                Ten (A-Z)
              </span>
              <ChevronDown size={16} />
            </button>

            <button
              type="button"
              className="hover:bg-[#f8f9fa] col-span-6 md:col-span-3 h-10 rounded-md border bg-white px-3 text-left text-sm text-[#1f2328] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Funnel size={16} />
                Tat ca
              </span>
              <ChevronDown size={16} />
            </button>
        </div>

          {filteredFriend.map((item) => (
            <div
              key={item._id}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-[#f8f9fa]"
              onClick={() => navigate(`/user/friend/chat/${item._id}`)}
            >
              <img
                src={`http://localhost:5000${item?.avatar || '/uploads/default-avatar.png'}`}
                alt={item?.fullname || 'Friend avatar'}
                className="size-11 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[#1f2328]">
                  {item?.fullname || 'Nguoi dung'}
                </div>
              </div>
              <div className='relative'>
                <button 
                  type="button"
                  className="p-1 rounded-[20px] cursor-pointer transition hover:bg-gray-200 text-[#1f2328]"
                  onClick={(e) => {
                    e.stopPropagation(); // 👈 Khóa hành động click của thẻ cha lại
                    setActiveDropdownId(prev => prev === item._id ? null : item._id);
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>

                {activeDropdownId === item._id && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-white text-gray-700 rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      
                    }} // Chặn bong bóng khi click vào vùng trống của menu
                  >
                    <button
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenProfile(item);
                      }}
                    >
                      Xem thông tin
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal(item)
                      }}
                    >
                      Xóa bạn bè
                    </button>  
                  </div>
                )}
              </div>         
            </div>
          ))}

          <div ref={loadRef} className="h-10" />

          {loading && (
            <div className="py-2 text-center text-sm text-gray-500">
              Đang tải...
            </div>
          )}

          {!loading && friend.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Chua co ban be.
            </div>
          )}
        </div>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Lớp nền mờ đen phía sau */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => (setConfirmModal(null))} // Bấm ra ngoài rìa tự đóng popup
          />
          
          {/* Khung nội dung Popup */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all border border-gray-100 scale-in-center">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Đóng popup"
              >
                {/* Đảm bảo bạn đã import { X } from 'lucide-react' ở đầu file */}
                <X size={18} strokeWidth={2.5} />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Bạn chắc chắn muốn xóa {confirmModal.fullname} khỏi danh sách bạn bè
                </p>
              </div>
            </div>

            {/* Các nút bấm hành động của Popup */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => (setConfirmModal(null))}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="h-9 rounded-lg bg-[#0561ff] px-4 text-sm font-medium text-white hover:bg-[#0052db] transition shadow-sm"
                onClick={() => {
                 setConfirmModal(null)
                 unFriend(confirmModal._id)
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

export default AllFriend;
