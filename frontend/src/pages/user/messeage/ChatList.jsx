import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, MoreHorizontal, Search, UserPlus, UsersRound } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import message from '@/service/message';
import UserCardChat from './UserCardChat';
import socket from '@/lib/socket';
import CreateGroup from './CreateGroup';
import Modal from '@/components/Modal';

const ChatList = ({ selectedConversation, onSelectConversation, lastMessageEvent }) => {
  const [isSearch, setIsSearch] = useState(false);
  const [tab, setTab] = useState("all");
  const [activeAction, setActiveAction] = useState(null);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const loadRef = useRef(null);

  // Dùng ref để IntersectionObserver luôn đọc được giá trị mới nhất
  // tránh stale closure
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const cursorRef = useRef(null);

  const fetchConverSation = useCallback(async (reset = false) => {
    // Đọc từ ref để luôn có giá trị mới nhất
    if (loadingRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await message.getConversation({
        limit: 12,
        after: reset ? null : cursorRef.current,
      });

      const data = res.data.items;
      const nextCursor = res.data.nextCursor;
      const more = res.data.hasMore;

      setConversation(prev => {
        if (reset) return data;
        const map = new Map();
        [...prev, ...data].forEach(item => map.set(item._id, item));
        return Array.from(map.values());
      });

      // Cập nhật cả state lẫn ref
      setCursor(nextCursor);
      cursorRef.current = nextCursor;

      setHasMore(more);
      hasMoreRef.current = more;

    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Lần đầu load
  useEffect(() => {
    fetchConverSation(true);
  }, []);

  // IntersectionObserver — dùng ref, không phụ thuộc vào state
  useEffect(() => {
    if (!loadRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current
        ) {
          fetchConverSation(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadRef.current);
    return () => observer.disconnect();

    // Không cần cursor/hasMore/loading trong dep array vì dùng ref rồi
    // Chỉ re-observe khi fetchConverSation thay đổi (không bao giờ đổi do useCallback [])
  }, [fetchConverSation]);

  // Nhận tin nhắn mới → đẩy conversation lên đầu (không fetch lại toàn bộ)
  useEffect(() => {
    const handleReceive = (payload) => {
      // Nếu conversation đã có trong list thì chỉ cần cập nhật qua lastMessageEvent
      // Nếu chưa có (conversation mới) thì mới cần fetch
      setConversation(prev => {
        const exists = prev.some(c => String(c._id) === String(payload.conversationId));
        if (exists) return prev; // lastMessageEvent useEffect sẽ xử lý
        // Conversation mới hoàn toàn → fetch lại
        fetchConverSation(true);
        return prev;
      });
    };

    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  }, [fetchConverSation]);

  useEffect(() => {
    const handleCreate = (payload) => {
      // Nếu conversation đã có trong list thì chỉ cần cập nhật qua lastMessageEvent
      // Nếu chưa có (conversation mới) thì mới cần fetch
      setConversation(prev => {
        const exists = prev.some(c => String(c._id) === String(payload._id));
        if (exists) return prev; // lastMessageEvent useEffect sẽ xử lý
        // Conversation mới hoàn toàn → fetch lại
        fetchConverSation(true);
        return prev;
      }); 
    };

    socket.on("conversation-createGroup", handleCreate);
    return () => socket.off("receive-message", handleCreate);
  }, [fetchConverSation]);
  // Cập nhật last message và đẩy conversation lên đầu
  useEffect(() => {
    if (!lastMessageEvent?.conversationId) return;

    setConversation(prev => {
      const next = [...prev];
      const i = next.findIndex(c => String(c._id) === String(lastMessageEvent.conversationId));
      if (i === -1) return prev;

      const updated = {
        ...next[i],
        lastMessage: lastMessageEvent.content,
        lastSenderId: lastMessageEvent.senderId,
        updatedAt: new Date().toISOString(),
      };
      next.splice(i, 1);
      next.unshift(updated);
      return next;
    });
  }, [lastMessageEvent]); 


  // Thêm useEffect này vào trong ChatList của bạn
  useEffect(() => {
    const handleConversationDeleted = (deletedId) => {
      const idToCompare = String(deletedId);
      
      // Xóa hội thoại khỏi danh sách hiển thị trên UI ngay lập tức
      setConversation((prev) => prev.filter(c => String(c._id) !== idToCompare));
      
      if (selectedConversation && String(selectedConversation._id) === idToCompare) {
        onSelectConversation(null); 
      }
    };

    socket.on("conversation-deleted", handleConversationDeleted);
    return () => socket.off("conversation-deleted", handleConversationDeleted);
  }, [selectedConversation, onSelectConversation]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      {/* SEARCH */}
      <div className="shrink-0 px-3 pt-3 border-b">
        <div className='flex gap-1'>
          <div className='relative'>
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="h-9 w-[220px] text-sm pl-7 bg-[#ededed]"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearch(true)}
            />
          </div>
          {isSearch ? (
            <Button
              className="cursor-pointer w-[70px] bg-white text-black hover:bg-[#ededed]"
              onClick={() => {
                setIsSearch(false);
                setSearchValue("");
              }}
            >
              Đóng
            </Button>
          ) : (
            <div className="flex">
              <Button className="bg-white text-black hover:bg-[#ededed]">
                <UserPlus size={20} />
              </Button>
              <Button 
                className="bg-white text-black hover:bg-[#ededed] cursor-pointer"
                onClick = {() => setOpenCreateGroup(true)}
              >
                <UsersRound size={20} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between text-[13px] pt-4">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <span
              onClick={() => setTab("all")}
              className={`relative cursor-pointer pb-3 transition
                ${tab === "all"
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : "text-muted-foreground hover:text-[#234ae8]"
                }`}
            >Tất cả</span>
            <span
              onClick={() => setTab("unread")}
              className={`relative cursor-pointer pb-3 transition
                ${tab === "unread"
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : "text-muted-foreground hover:text-[#234ae8]"
                }`}
            >Chưa đọc</span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 pb-2">
            <span
              onClick={() => setActiveAction(activeAction === "filter" ? null : "filter")}
              className={`flex items-center gap-1 rounded-[20px] cursor-pointer transition
                ${activeAction === "filter" ? "bg-[#E8EDFF] text-[#3B5BDB]" : "hover:bg-muted"}`}
            >
              Phân loại
              <ChevronDown size={14} />
            </span>
            <span
              onClick={() => setActiveAction(activeAction === "more" ? null : "more")}
              className={`p-1 rounded-[20px] cursor-pointer transition
                ${activeAction === "more" ? "bg-[#E8EDFF] text-[#3B5BDB]" : "hover:bg-muted"}`}
            >
              <MoreHorizontal size={18} />
            </span>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <UserCardChat
          userCardChat={conversation}
          selectedConversation={selectedConversation}
          onSelectConversation={onSelectConversation}
          lastMessageEvent={lastMessageEvent}
        />

        {/* Sentinel để trigger load thêm */}
        <div ref={loadRef} className="h-4" />

        {loading && (
          <div className="text-center text-sm text-gray-500 py-2">
            Đang tải...
          </div>
        )}

        {!hasMore && conversation.length > 0 && (
          <div className="text-center text-xs text-gray-400 py-2">
            Đã tải hết
          </div>
        )}
      </div>

      {openCreateGroup && (
        <Modal
          title="Tạo nhóm"
          onClose={() => setOpenCreateGroup(false)}
          size="md"
        >
          <CreateGroup onClose={() => setOpenCreateGroup(false)}/>
        </Modal>
      )}
    </div>
  );
};
    
export default ChatList;