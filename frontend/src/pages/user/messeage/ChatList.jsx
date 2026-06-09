import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, MoreHorizontal, Search, UserPlus, UsersRound } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import message from '@/service/message';
import UserCardChat from './UserCardChat';
import CreateGroup from './CreateGroup';
import Modal from '@/components/Modal';
import useChatStore from '@/stores/useChatStore';

const ChatList = ({ selectedConversation, onSelectConversation, lastMessageEvent }) => {
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

  const loadRef = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const cursorRef = useRef(null);

  const fetchConverSation = useCallback(async (reset = false) => {
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

  useEffect(() => {
    fetchConverSation(true);
  }, [fetchConverSation]);

  useEffect(() => {
    if (!loadRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          fetchConverSation(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadRef.current);
    return () => observer.disconnect();
  }, [fetchConverSation]);

  useEffect(() => {
    if (!lastMessageEvent?.conversationId) return;

    setConversations((prev) => {
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
  }, [lastMessageEvent, setConversations]);

 
  

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b px-3 pt-3">
        <div className="flex gap-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-[220px] bg-[#ededed] pl-7 text-sm"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearch(true)}
            />
          </div>
          {isSearch ? (
            <Button
              className="w-[70px] cursor-pointer bg-white text-black hover:bg-[#ededed]"
              onClick={() => {
                setIsSearch(false);
                setSearchValue('');
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
                className="cursor-pointer bg-white text-black hover:bg-[#ededed]"
                onClick={() => setOpenCreateGroup(true)}
              >
                <UsersRound size={20} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-4 text-[13px]">
          <div className="flex items-center gap-3">
            <span
              onClick={() => setTab('all')}
              className={`relative cursor-pointer pb-3 transition
                ${tab === 'all'
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : 'text-muted-foreground hover:text-[#234ae8]'
                }`}
            >
              Tất cả
            </span>
            <span
              onClick={() => setTab('unread')}
              className={`relative cursor-pointer pb-3 transition
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
              className={`flex cursor-pointer items-center gap-1 rounded-[20px] transition
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

      <div className="flex-1 min-h-0 overflow-y-auto">
        <UserCardChat
          userCardChat={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={onSelectConversation}
          lastMessageEvent={lastMessageEvent}
        />

        <div ref={loadRef} className="h-4" />

        {loading && <div className="py-2 text-center text-sm text-gray-500">Đang tải...</div>}

        {!hasMore && conversations.length > 0 && (
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
