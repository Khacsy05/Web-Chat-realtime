import { Input } from '@/components/ui/input';
import message from '@/service/message';
import useAuthStore from '@/stores/useAuthStore';
import { ArrowLeft, MoreHorizontal, PanelLeft, Search, Send, ThumbsUp } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import socket from '@/lib/socket';
import Modal from '@/components/Modal';
import MenuProfile from '../profile/MenuProfile';


const messSchema = yup.object().shape({
  content: yup.string().required("vui long nhap noi dung"),
});

const EMPTY_FORM = {
  content: "",
};

const MD_PX = 768;

const ConversationView = ({
  selectedConversation,
  onMessageEvent,
  onOpenRighPage,
  isOpenRighPage,
  onMobileBack,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [mess, setMess] = useState([]);
  const chatBodyRef = useRef(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [loadedConversationId, setLoadedConversationId] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);
  const scrollSnapshotRef = useRef({ prevScrollHeight: 0, prevScrollTop: 0 });
  // Track which conversation the currently DISPLAYED messages belong to
  const displayedConversationIdRef = useRef(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MD_PX
  );
  const LIKE_EMOJI = "👍";
  const [openProfile, setOpenProfile] = useState(null);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_PX - 1}px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showMobileBack = Boolean(onMobileBack && isNarrowScreen && selectedConversation);

  useEffect(() => {
    if (!selectedConversation?._id) return;

    socket.emit("join-conversation", selectedConversation._id);
  }, [selectedConversation?._id]);

  

  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const thisMember =
    selectedConversation?.members?.find(
      (member) => String(member._id) === String(currentUser?.idUser)
    );
  
  useEffect(() => {
    const handleTyping = (payload) => {
      setTypingUser({
        userId: payload.userId ,
        fullname: payload.fullname || "Ai đó",
      });
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, []);

  const handleTyping = () => {
    if (!selectedConversation?._id || !currentUser?.idUser) return;
    if (!thisMember?.fullname) return;

    socket.emit("typing", {
      conversationId: selectedConversation._id,
      userId: currentUser.idUser,
      fullname: thisMember.fullname
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", {
        conversationId: selectedConversation._id,
        userId: currentUser.idUser,
        fullname: thisMember.fullname
      });
    }, 1000);
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(messSchema),
    mode: "onSubmit",
    defaultValues: EMPTY_FORM
  });

  const content = watch("content");

  const fetchMessage = async (conversationId, isReset = false) => {
    if (!conversationId) return;
    if (loadingMore || (!hasMore && !isReset)) return;

    if (isReset) {
      setIsLoadingMessages(true);
      setCursor(null);
      setLoadedConversationId(null);
    }

    setLoadingMore(true);

    try {
      const response = await message.getMessage(conversationId, {
        limit: 15,
        before: isReset ? null : cursor
      });

      const newMessages = response.data.items;

      if (!isReset && chatBodyRef.current) {
        shouldScrollToBottomRef.current = false;
        scrollSnapshotRef.current = {
          prevScrollHeight: chatBodyRef.current.scrollHeight,
          prevScrollTop: chatBodyRef.current.scrollTop
        };
      } else {
        shouldScrollToBottomRef.current = true;
      }

      setMess(prev => {
        if (isReset) {
          // FIX: Chỉ replace khi data về, KHÔNG xóa sớm nữa
          // => scroll bar giữ nguyên chiều cao cho đến khi data mới render xong
          return newMessages;
        }

        const existingIds = new Set(prev.map(m => String(m.messageId)));
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(String(m.messageId)));
        return [...uniqueNewMessages, ...prev];
      });

      setCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
      setLoadedConversationId(String(conversationId));
      displayedConversationIdRef.current = String(conversationId);
    } catch (error) {
      console.error('Error fetching message:', error);
    } finally {
      setIsLoadingMessages(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const conversationId = selectedConversation?._id;
    if (!conversationId) return;

    // FIX: KHÔNG gọi setMess([]) ở đây nữa!
    // Giữ nguyên mess cũ → scroll bar không bị collapse → không bị nhảy
    // Tin nhắn cũ sẽ bị ẩn bằng opacity trong lúc chờ, và replace khi data về
    setHasMore(true);
    setCursor(null);
    setLoadedConversationId(null);
    shouldScrollToBottomRef.current = true;

    fetchMessage(conversationId, true);

    const onReceive = (payload) => {
      onMessageEvent?.({
        conversationId: String(payload.conversationId),
        senderId: payload.from,
        content: payload.text,
        createdAt: new Date().toISOString(),
      });
      if (String(payload.conversationId) !== String(selectedConversation._id)) return;

      setMess((prev) => {
        if (prev.some((m) => String(m.messageId) === String(payload.messageId))) return prev;
        return [...prev, {
          messageId: payload.messageId,
          senderId: payload.from,
          name: payload.name ?? "Nguoi dung",
          content: payload.text,
          createdAt: payload.createdAt || new Date().toISOString()
        }];
      });
    };

    socket.on("receive-message", onReceive);
    return () => socket.off("receive-message", onReceive);

  }, [selectedConversation?._id]);

  useLayoutEffect(() => {
    if (isLoadingMessages) return;
    const el = chatBodyRef.current;
    if (!el) return;

    const id = selectedConversation?._id;
    if (!id) return;
    if (String(loadedConversationId) !== String(id)) return;

    if (shouldScrollToBottomRef.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    } else {
      const { prevScrollHeight, prevScrollTop } = scrollSnapshotRef.current;
      if (prevScrollHeight > 0 && mess.length > 0) {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
      }
    }
  }, [mess, isLoadingMessages, loadedConversationId, selectedConversation?._id]);

  useEffect(() => {
    if (!loadRef.current || !selectedConversation?._id || mess.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isLoadingMessages) {
          fetchMessage(selectedConversation._id, false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadRef.current);
    return () => observer.disconnect();
  }, [selectedConversation?._id, cursor, hasMore, loadingMore, isLoadingMessages]);

  const otherMember =
    selectedConversation?.members?.find(
      (member) => String(member._id) !== String(currentUser?.idUser)
    ) || selectedConversation?.members?.[0];

  
  const isGroup = selectedConversation?.isGroup;
  const members = selectedConversation?.members || [];
  const totalMembers = members.length;
  const displayName = isGroup 
    ? (selectedConversation?.nameGroup || "Nhóm trò chuyện") 
    : (otherMember?.fullname || 'Người dùng');

  const avatarDisplay = isGroup 
    ? (`http://localhost:5000${selectedConversation?.avatar || "/uploads/default-avatar.png"}`)
    : (`http://localhost:5000${otherMember?.avatar || "/uploads/default-avatar.png"}`);
  const userName = thisMember?.fullname || 'Nguoi dung';
  const conversationId = selectedConversation?._id;

  const [onlineMap, setOnlineMap] = useState({});
  useEffect(() => {
    socket.emit("request-online-users");

    socket.on("online-users", (userIds) => {
      setOnlineMap(
        userIds.reduce((acc, userId) => {
          acc[userId] = true;
          return acc;
          }, {})
      );
    }); 

    socket.on("user-status", ({ userId, isActive }) => {
      setOnlineMap(prev => ({
         ...prev,
        [userId]: isActive
      }));
    });

    return () => {
      socket.off("online-users");
      socket.off("user-status");
    };
  }, []);
  const isOnline = !!onlineMap[otherMember?._id];
  const getLastActiveText = (lastActive) => {
    if (!lastActive) return 'Offline';

    const last = new Date(lastActive);
    if (Number.isNaN(last.getTime())) return 'Offline';

    const diffMs = Date.now() - last.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return 'Hoạt động vài giây trước';
    if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hoạt động ${diffDays} ngày trước`;
  };
  const handleSendMess = async (data) => {
    try {
      if (!selectedConversation?._id || !currentUser?.idUser) {
        toast.error("Không tìm thấy cuộc trò chuyện để gửi tin nhắn");
        return;
      }

      const contentToSend = String(data?.content || "").trim();
      if (!contentToSend) return;

      if (!socket.connected) {
        socket.connect();
      }
      const res = await message.sendMessage({
        conversationId,
        content: contentToSend
      });

      reset();
      shouldScrollToBottomRef.current = true;
      setMess((prev) => [
        ...prev,
        {
          messageId: res.data._id,
          senderId: currentUser.idUser,
          name: userName || "Nguoi dung",
          content: contentToSend,
          createdAt: res.data.createdAt || new Date().toISOString() // Thêm dòng này
        }
      ]);

      onMessageEvent?.({
        conversationId: String(selectedConversation._id),
        senderId: currentUser.idUser,
        content: contentToSend,
        createdAt: new Date().toISOString(),
      });

      socket.emit("send-message", {
        from: String(currentUser.idUser),
        members: selectedConversation?.members,
        text: contentToSend,
        conversationId: String(conversationId),
        messageId: String(res.data._id),
        name: userName || "Nguoi dung",
        createdAt: res.data.createdAt
      });

    } catch (error) {
      console.error("Send message failed:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Gui tin nhan that bai");
    }
  };

  // FIX: Tính toán xem tin nhắn đang hiển thị có phải của conversation hiện tại không
  // Nếu không phải → ẩn bằng opacity để tránh hiện tin nhắn sai người
  const isShowingStaleMessages =
    isLoadingMessages &&
    displayedConversationIdRef.current !== null &&
    displayedConversationIdRef.current !== String(selectedConversation?._id);


  const formatChatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Chuyển về định dạng chuỗi để so sánh ngày/tháng/năm đơn giản
    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Hôm nay, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (isYesterday) {
      return `Hôm qua, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Nếu là các ngày trước đó: Hiển thị Ngày/Tháng và Giờ
    return `${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {showMobileBack && (
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1f2328] hover:bg-[#f1f3f5]"
                onClick={onMobileBack}
                aria-label="Quay lai"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-[#3b5bdb]">
              <button className={`relative size-full ${isGroup ? 'cursor-default' : 'cursor-pointer'}`} onClick={() => {
                if(isGroup) {
                  setOpenProfile(selectedConversation)
                }
                else{
                  setOpenProfile(otherMember)
                }
                }}>
                  {isGroup ? (
                    selectedConversation?.avatar ? (
                      <img
                        src={`http://localhost:5000${selectedConversation.avatar}`}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                      />
                    )
                    : (
                    <div className="relative size-full">
                      {/* Ảnh thành viên 1 */}
                      <img 
                        src={`http://localhost:5000${members[0]?.avatar || '/uploads/default-avatar.png'}`} 
                        className="absolute top-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-20" 
                        alt="mem1"
                      />
                      {/* Ảnh thành viên 2 */}
                      <img 
                        src={`http://localhost:5000${members[1]?.avatar || '/uploads/default-avatar.png'}`} 
                        className="absolute top-0 right-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-10" 
                        alt="mem2"
                      />
                      {/* Ảnh thành viên 3 */}
                      <img 
                        src={`http://localhost:5000${members[2]?.avatar || '/uploads/default-avatar.png'}`} 
                        className="absolute bottom-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-30" 
                        alt="mem3"
                      />
                      {/* Vòng tròn số lượng */}
                      <div className="absolute bottom-0 right-0.5 size-7 rounded-full border-2 border-white bg-[#e2e6ea] flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm z-40">
                        {totalMembers}
                      </div>
                    </div>
                    )
                  ) : (
                    <img
                      src={avatarDisplay}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                  )}
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium text-[#1f2328]">
                {displayName}
              </div>
              <div className="truncate text-[13px] text-muted-foreground">
                {isOnline ? (
                  <span className="text-green-500 text-xs">● Đang hoạt động</span>
                ) : (
                  <span className="text-gray-400 text-xs">
                    {getLastActiveText(otherMember?.lastActive)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <Search />
            </div>
            <button
              className="cursor-pointer flex items-center justify-center shrink-0"
              onClick={() => onOpenRighPage(!isOpenRighPage)}
            >
              <PanelLeft />
            </button>
          </div>
        </div>
      </div>

      {/*
        FIX KEY:
        - KHÔNG dùng setMess([]) trước khi fetch → scroll bar không bị collapse
        - Dùng opacity để ẩn tin nhắn cũ trong lúc load (không xóa DOM)
        - Khi data về → setMess(newMessages) → opacity: 1 → không nhảy
      */}
      <div
        ref={chatBodyRef}
        className="relative flex-1 min-h-0 overflow-y-auto p-4"
        style={{
          overflowAnchor: 'none',
          // Ẩn tin nhắn cũ khi đang load conversation mới (nhưng giữ scroll height)
          opacity: isShowingStaleMessages ? 0 : 1,
          transition: isShowingStaleMessages ? 'none' : 'opacity 0.1s ease',
        }}
      >
        <div ref={loadRef} className="h-1" />

        {loadingMore && !isLoadingMessages && mess.length > 0 && (
          <div className="text-center text-sm text-gray-500 py-2">
            Đang tải tin nhắn cũ...
          </div>
        )}

        {/* Loading spinner chỉ hiện khi chưa có mess nào (lần đầu tiên, chưa có stale messages) */}
        {isLoadingMessages && !isShowingStaleMessages && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            <div className="animate-pulse text-muted-foreground">Đang tải tin nhắn...</div>
          </div>
        )}

        {!isLoadingMessages && mess.map((item, index) => {
          const isMe = String(item.senderId) === String(currentUser?.idUser);
          let showDateDivider = false;
          let showTimeUnderMessage = false;
          if (index === 0) {
            showDateDivider = true;
          } else {
            const currentMessageDate = new Date(item.createdAt).toDateString();
            const previousMessageDate = new Date(mess[index - 1].createdAt).toDateString();
            
            // Nếu ngày của tin nhắn này khác ngày của tin nhắn trước đó
            if (currentMessageDate !== previousMessageDate) {
              showDateDivider = true;
            }
          }
          
  
          if (index === mess.length - 1) {
            // Nếu là tin nhắn mới nhất/cuối cùng của cuộc trò chuyện -> Hiện giờ
            showTimeUnderMessage = true;
          } else {
            const nextMessage = mess[index + 1];
            // Nếu thằng nhắn tiếp theo là một người khác -> Tin này là cuối chuỗi -> Hiện giờ
            const isNextFromDifferentUser = String(nextMessage.senderId) !== String(item.senderId);
            const currentMessageDate = new Date(item.createdAt).toDateString();
            const nextMessageDate = new Date(nextMessage.createdAt).toDateString();
            const isNextDay = currentMessageDate !== nextMessageDate;

            // 2. Hiện giờ nếu người tiếp theo là người khác 
            // HOẶC tin nhắn tiếp theo đã sang ngày khác (để chốt thời gian cho ngày cũ)
            if (isNextFromDifferentUser || isNextDay) {
              showTimeUnderMessage = true;
            } 
          }

          return (
            <div key={item.messageId || index}>

              {showDateDivider && item.createdAt && (
                <div className="my-4 flex items-center justify-center">
                  <span className="rounded-full bg-gray-200/70 px-3 py-1 text-[11px] font-medium text-gray-500 shadow-sm">
                    {formatChatDate(item.createdAt)}
                  </span>
                </div>
              )}
              <div className={`mb-3 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (index === 0 || String(mess[index - 1].senderId) !== String(item.senderId)) && (
                  <div className="mb-1 text-xs text-muted-foreground">
                    {item.name}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap ${
                    isMe
                      ? 'rounded-tr-none bg-[#3b5bdb] text-white'
                      : 'rounded-tl-none bg-[#f1f3f5] text-[#1f2328]'
                  }`}
                >
                  {item.content}
                </div>

                {showTimeUnderMessage && item.createdAt && (
                <div className="mt-0.5 px-1 text-[10px] text-gray-400 font-normal animate-fade-in">
                  {formatMessageTime(item.createdAt)}
                </div>
        )}
              </div>
            </div>
            );
        })}
      </div>

      {typingUser &&
        typingUser.userId !== currentUser.idUser && (
          <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-1">
            {typingUser.fullname} đang nhập
            <span className="animate-pulse">
              <MoreHorizontal />
            </span>
          </div>
      )}
      <div className="shrink-0 border-t bg-white p-3">
        <form onSubmit={handleSubmit(handleSendMess)}>
          <div className="flex items-center gap-2">
            <Input
              className="h-10 flex-1"
              placeholder="Nhap tin nhan..."
              {...register("content")}
              onKeyDown={handleTyping}
            />
            {content?.trim() ? (
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb]"
              >
                <Send size={20} strokeWidth={2.5} fill="#4f6fef" className='text-blue-500' />
              </button>
            ) : (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb]"
                onClick={() => handleSendMess({ content: LIKE_EMOJI })}
              >
                <ThumbsUp className='text-yellow-500' fill="#d2dd10" size={20} />
              </button>
            )}
          </div>
        </form>
      </div>

      {openProfile && (
        <Modal
          title="Thông tin tài khoản"
          onClose={() => setOpenProfile(null)}
          size="sm"
        >
          {/* Thêm key vào đây để React reset lại hoàn toàn state của ProfileFriend mỗi lần đổi người */}
          <MenuProfile
            type = {isGroup ? 'group' : 'personal'}
            data = {openProfile}
          />
          
        </Modal>
      )}   
      
    </div>
  );
};

export default ConversationView;
