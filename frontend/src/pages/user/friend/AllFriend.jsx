import user from '@/service/user';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ChevronDown, Funnel, Search, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from "react-router-dom";

const AllFriend = () => {
  const navigate = useNavigate();
  const { openFriendSidebar, isNarrowScreen: isNarrowFromLayout } = useOutletContext() ?? {};
  const [friend, setFriend] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const didFetch = useRef(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: 1023px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showBackButton = isNarrowFromLayout ?? isNarrowScreen;

  const fetchFriend = async () => {
    try {
      if (didFetch.current) return;
      didFetch.current = true;
      const response = await user.getAllFriend();
      setFriend(response.data || []);
    } catch (error) {
      console.error('Error fetching friend list:', error);
    }
  };

  useEffect(() => {
    fetchFriend();
  }, []);

  const normalized = searchValue.trim().toLowerCase();
  const filteredFriend = friend.filter((item) =>
    (item?.fullname || '').toLowerCase().includes(normalized)
  );

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
        Ban be ({filteredFriend.length})
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
            <button
              key={item._id}
              type="button"
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
            </button>
          ))}

          {friend.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Chua co ban be.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFriend;
