import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, MoreHorizontal, Search, UserPlus, UsersRound } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import message from '@/service/message';
import UserCardChat from './UserCardChat';
import socket from '@/lib/socket';
import CreateGroup from './CreateGroup';
import Modal from '@/components/Modal';
import useChatStore from '@/stores/useChatStore';
import useAuthStore from '@/stores/useAuthStore';

const ChatList = ({ selectedConversationId, onSelectConversation, lastMessageEvent }) => {
  const [isSearch, setIsSearch] = useState(false);
  const [tab, setTab] = useState('all');
  const [activeAction, setActiveAction] = useState(null);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const currentUser = useAuthStore((state) => state.user);

  const loadRef = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const cursorRef = useRef(null);

  // Hàm gọi API lấy danh sách hội thoại (có tích hợp truyền từ khóa tìm kiếm q)
  const fetchConverSation = useCallback(async (reset = false, searchKey = '') => {
    if (loadingRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await message.getConversation({
        limit: 12,
        after: reset ? null : cursorRef.current,
        q: searchKey.trim() || undefined, // 👈 Gửi từ khóa lên API Backend nếu có
      });

      const data = res.data.items;
      const nextCursor = res.data.nextCursor;
      const more = res.data.hasMore;

      setConversations((prev) => {
        if (reset) return data;
        const map = new Map();
        [...prev, ...data].forEach((item) => map.set(item._id, item));
        return Array.from(map.values());
      });

      setCursor(nextCursor);
      cursorRef.current = nextCursor;
      setHasMore(more);
      hasMoreRef.current = more;
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [setConversations]);

  // EFFECT 1: Khởi tạo dữ liệu lần đầu khi vào trang
  useEffect(() => {
    fetchConverSation(true);
  }, [fetchConverSation]);

  // EFFECT 2: Kỹ thuật DEBOUNCE SEARCH - Tự động tìm kiếm sau khi người dùng dừng gõ 500ms
  useEffect(() => {
    if (!isSearch && searchValue === '') return;

    const delayDebounceFn = setTimeout(() => {
      // Gọi lại API reset danh sách theo từ khóa tìm kiếm mới
      fetchConverSation(true, searchValue);
    }, 500); // 500ms dừng gõ mới kích hoạt API

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, isSearch, fetchConverSation]);

  // EFFECT 3: Hỗ trợ cuộn trang (Infinite Scroll)
  useEffect(() => {
    if (!loadRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          fetchConverSation(false, searchValue); // Giữ từ khóa khi load trang tiếp theo
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadRef.current);
    return () => observer.disconnect();
  }, [fetchConverSation, searchValue]);

  // EFFECT 4: Cập nhật tin nhắn mới theo Realtime
  useEffect(() => {
    if (!lastMessageEvent?.conversationId) return;

    setConversations((prev) => {
      const next = [...prev];
      const i = next.findIndex(c => String(c._id) === String(lastMessageEvent.conversationId));
      if (i === -1) return prev;

      const updated = {
        ...next[i],
        lastMessage: lastMessageEvent.content,
        lastSenderId: lastMessageEvent.type === 'system' ? null : lastMessageEvent.senderId,
        updatedAt: new Date().toISOString(),
      };
      next.splice(i, 1);
      next.unshift(updated);
      return next;
    });
  }, [lastMessageEvent, setConversations]);

  // Lọc nhanh dữ liệu tại Client để tăng tốc độ hiển thị giao diện
  const filteredConversations = conversations.filter((item) => {
    // 1. Lọc theo Tab Chưa đọc / Tất cả
    if (tab === 'unread' && item.isSeen) return false;

    // 2. Lọc nhanh theo từ khóa tìm kiếm (bảo hiểm thêm trường hợp dữ liệu đã có sẵn tại client)
    if (searchValue.trim() === '') return true;

    const otherMember = item.members?.find(
      (member) => String(member._id) !== String(currentUser?.idUser)
    ) || item.members?.[0];

    const displayName = item.isGroup
      ? (item.nameGroup || "Nhóm chưa đặt tên")
      : (otherMember?.fullname || 'Người dùng');

    return displayName.toLowerCase().includes(searchValue.toLowerCase());
  });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b px-3 pt-3">
        <div className="flex gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-full bg-[#ededed] pl-7 text-sm"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearch(true)}
            />
          </div>
          {isSearch ? (
            <Button
              className="w-[70px] cursor-pointer bg-white border border-gray-200 text-black hover:bg-[#ededed] h-9 text-xs"
              onClick={() => {
                setIsSearch(false);
                setSearchValue('');
                fetchConverSation(true, ''); // Reset lại danh sách gốc ban đầu khi đóng tìm kiếm
              }}
            >
              Đóng
            </Button>
          ) : (
            <div className="flex shrink-0">
              <Button className="bg-white text-black hover:bg-[#ededed] h-9 px-3">
                <UserPlus size={20} />
              </Button>
              <Button
                className="cursor-pointer bg-white text-black hover:bg-[#ededed] h-9 px-3"
                onClick={() => setOpenCreateGroup(true)}
              >
                <UsersRound size={20} />
              </Button>
            </div>
          )}
        </div>

        {/* PHẦN TAB TẤT CẢ / CHƯA ĐỌC */}
        <div className="flex items-end justify-between pt-4 text-[13px]">
          <div className="flex items-center gap-3">
            <span
              onClick={() => setTab('all')}
              className={`relative cursor-pointer pb-3 transition font-medium
                ${tab === 'all'
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : 'text-muted-foreground hover:text-[#234ae8]'
                }`}
            >
              Tất cả
            </span>
            <span
              onClick={() => setTab('unread')}
              className={`relative cursor-pointer pb-3 transition font-medium
                ${tab === 'unread'
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : 'text-muted-foreground hover:text-[#234ae8]'
                }`}
            >
              Chưa đọc
            </span>
          </div>

          <div className="flex items-center gap-3 pb-2">
            <span
              onClick={() => setActiveAction(activeAction === 'filter' ? null : 'filter')}
              className={`flex cursor-pointer items-center gap-1 rounded-[20px] px-2 py-0.5 text-xs transition
                ${activeAction === 'filter' ? 'bg-[#E8EDFF] text-[#3B5BDB]' : 'hover:bg-muted'}`}
            >
              Phân loại
              <ChevronDown size={14} />
            </span>
            <span
              onClick={() => setActiveAction(activeAction === 'more' ? null : 'more')}
              className={`cursor-pointer rounded-[20px] p-1 transition
                ${activeAction === 'more' ? 'bg-[#E8EDFF] text-[#3B5BDB]' : 'hover:bg-muted'}`}
            >
              <MoreHorizontal size={18} />
            </span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH USER CARD CHAT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredConversations.length === 0 && !loading ? (
          <div className="py-8 text-center text-sm text-gray-400 italic">
            Không tìm thấy kết quả phù hợp
          </div>
        ) : (
          <UserCardChat
            userCardChat={filteredConversations} // 👈 SỬA TẠI ĐÂY: Truyền mảng đã lọc
            selectedConversation={selectedConversationId}
            onSelectConversation={onSelectConversation}
            lastMessageEvent={lastMessageEvent}
          />
        )}

        <div ref={loadRef} className="h-4" />

        {loading && <div className="py-2 text-center text-sm text-gray-500">Đang tải...</div>}

        {!hasMore && filteredConversations.length > 0 && (
          <div className="py-2 text-center text-xs text-gray-400">Đã tải hết</div>
        )}
      </div>

      {openCreateGroup && (
        <Modal title="Tạo nhóm" onClose={() => setOpenCreateGroup(false)} size="md">
          <CreateGroup onClose={() => setOpenCreateGroup(false)} />
        </Modal>
      )}
    </div>
  );
};

export default ChatList;