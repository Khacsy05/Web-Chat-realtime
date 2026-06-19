import { Input } from '@/components/ui/input';
import useAuthStore from '@/stores/useAuthStore';
import useMessStore from '@/stores/useMessStore';
import { ArrowLeft, MoreHorizontal, PanelLeft, Search, Send, ThumbsUp } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import socket from '@/lib/socket'; // Keep socket since it emits "join" and status requests in this component
import Modal from '@/components/Modal';
import MenuProfile from '../profile/MenuProfile';
import { Image as ImageIcon } from "lucide-react";
import ImageViewer from '@/components/ImageViewer';

const messSchema = yup.object().shape({
  content: yup.string().required("vui long nhap noi dung"),
});
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  onSelectConversation
}) => {
  const currentUser = useAuthStore((state) => state.user);

  const {
    mess,
    isLoadingMessages,
    loadedConversationId,
    cursor,
    hasMore,
    loadingMore,
    typingUser,
    fetchMessages,
    sendMessage,
    revokeMessage,
    deleteMessageForMe,
    sendImage,
    sendTyping,
    setupSocketListeners,
    clearMessages,
  } = useMessStore();

  const [hoverMsgId, setHoverMsgId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const chatBodyRef = useRef(null);
  const loadRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);
  const scrollSnapshotRef = useRef({ prevScrollHeight: 0, prevScrollTop: 0 });

  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MD_PX
  );
  const LIKE_EMOJI = "👍";
  const [openProfile, setOpenProfile] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_PX - 1}px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showMobileBack = Boolean(onMobileBack && isNarrowScreen && selectedConversation);



  const thisMember =
    selectedConversation?.members?.find(
      (member) => String(member._id) === String(currentUser?.idUser)
    );

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

  // Effect to load messages and set up socket listeners on conversation change
  useEffect(() => {
    const conversationId = selectedConversation?._id;
    if (!conversationId) {
      clearMessages();
      return;
    }

    shouldScrollToBottomRef.current = true;
    fetchMessages(conversationId, true);

    const cleanup = setupSocketListeners(conversationId, onMessageEvent);
    return () => {
      cleanup();
    };
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
          if (chatBodyRef.current) {
            shouldScrollToBottomRef.current = false;
            scrollSnapshotRef.current = {
              prevScrollHeight: chatBodyRef.current.scrollHeight,
              prevScrollTop: chatBodyRef.current.scrollTop
            };
          }
          fetchMessages(selectedConversation._id, false);
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
    ? (`${API_BASE_URL}${selectedConversation?.avatar || "/uploads/default-avatar.png"}`)
    : (`${API_BASE_URL}${otherMember?.avatar || "/uploads/default-avatar.png"}`);
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
    const contentToSend = String(data?.content || "").trim();
    if (!contentToSend) return;

    const success = await sendMessage({
      conversationId: selectedConversation?._id,
      content: contentToSend,
      currentUser,
      userName: thisMember?.fullname,
      members: selectedConversation?.members,
      onMessageEvent
    });

    if (success) {
      reset();
      shouldScrollToBottomRef.current = true;
    }
  };


  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const success = await sendImage({
      conversationId: selectedConversation?._id,
      image: file,
      currentUser,
      userName: thisMember?.fullname,
      members: selectedConversation?.members,
      onMessageEvent
    });
    if (success) {
      shouldScrollToBottomRef.current = true;
      e.target.value = "";
    }
  };

  const handleTyping = () => {
    if (!selectedConversation?._id || !currentUser?.idUser || !thisMember?.fullname) return;
    sendTyping(selectedConversation._id, currentUser.idUser, thisMember.fullname);
  };

  const handleRevokeMessage = async (msgId) => {
    await revokeMessage(msgId, selectedConversation?._id);
    setActiveMenuId(null);
  };

  const handleDeleteMessageForMe = async (msgId) => {
    await deleteMessageForMe(msgId);
    setActiveMenuId(null);
  };

  const isShowingStaleMessages =
    isLoadingMessages &&
    loadedConversationId !== null &&
    loadedConversationId !== String(selectedConversation?._id);


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
                if (isGroup) {
                  setOpenProfile(selectedConversation)
                }
                else {
                  setOpenProfile(otherMember)
                }
              }}>
                {isGroup ? (
                  selectedConversation?.avatar ? (
                    <img
                      src={`${API_BASE_URL}${selectedConversation.avatar}`}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                  )
                    : (
                      <div className="relative size-full">
                        {/* Ảnh thành viên 1 */}
                        <img
                          src={`${API_BASE_URL}${members[0]?.avatar || '/uploads/default-avatar.png'}`}
                          className="absolute top-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-20"
                          alt="mem1"
                        />
                        {/* Ảnh thành viên 2 */}
                        <img
                          src={`${API_BASE_URL}${members[1]?.avatar || '/uploads/default-avatar.png'}`}
                          className="absolute top-0 right-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-10"
                          alt="mem2"
                        />
                        {/* Ảnh thành viên 3 */}
                        <img
                          src={`${API_BASE_URL}${members[2]?.avatar || '/uploads/default-avatar.png'}`}
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
          const readers = selectedConversation?.members?.filter((member) => {
            if (String(member._id) === String(currentUser?.idUser)) return false;
            const readStatus = selectedConversation?.membersReadStatus?.find(
              (status) => String(status.userId) === String(member._id)
            );
            return readStatus && String(readStatus.lastSeenMessageId) === String(item.messageId);
          }) || [];
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

          if (item.type === 'system') {
            return (
              <div key={item.messageId || index} className="my-3 flex flex-col items-center w-full">
                {showDateDivider && item.createdAt && (
                  <div className="my-2 flex items-center justify-center">
                    <span className="rounded-full bg-gray-200/70 px-3 py-1 text-[11px] font-medium text-gray-500 shadow-sm">
                      {formatChatDate(item.createdAt)}
                    </span>
                  </div>
                )}
                <div className="rounded-full bg-gray-100/90 px-4 py-1.5 text-[12px] text-gray-500 text-center max-w-[85%] shadow-sm border border-gray-200/50 font-medium">
                  {item.content}
                </div>
              </div>
            );
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
              <div
                className={`mb-3 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoverMsgId(item.messageId)}
                onMouseLeave={() => {
                  setHoverMsgId(null);
                  setActiveMenuId(null);
                }}
              >
                {!isMe && (index === 0 || String(mess[index - 1].senderId) !== String(item.senderId)) && (
                  <div className="mb-1 text-xs text-muted-foreground">
                    {item.name}
                  </div>
                )}

                <div className={`relative flex items-center gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="break-words whitespace-pre-wrap max-w-full">
                    {item.isDeleted ? (
                      // 1. Trường hợp tin nhắn đã thu hồi
                      <div className="rounded-2xl px-3 py-2 text-sm bg-gray-100 text-gray-400 italic border border-gray-200">
                        Tin nhắn đã được thu hồi
                      </div>
                    ) : item.type === 'image' ? (
                      // 2. Trường hợp là ẢNH: Không có bg, không có padding, chỉ có border-radius riêng của ảnh
                      <img
                        src={`${API_BASE_URL}${item.image}`}
                        alt="image"
                        className="w-[200px] h-[200px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition shadow-sm block"
                        onClick={() => setViewImage(`${API_BASE_URL}${item.image}`)}
                      />
                    ) : (
                      // 3. Trường hợp tin nhắn VĂN BẢN: Có màu nền tương ứng theo người gửi
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm ${isMe
                          ? 'rounded-tr-none bg-[#3b5bdb] text-white'
                          : 'rounded-tl-none bg-[#f1f3f5] text-[#1f2328]'
                          }`}
                      >
                        {item.content}
                      </div>
                    )}
                  </div>

                  {!item.isDeleted && hoverMsgId === item.messageId && (
                    <div className="relative flex items-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.messageId ? null : item.messageId);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                        title="Tùy chọn"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === item.messageId && (
                        <div className={`absolute bottom-8 z-50 min-w-[130px] rounded-lg border bg-white p-1 shadow-lg ${isMe ? 'right-0' : 'left-0'}`}>
                          {isMe && (
                            <button
                              onClick={() => handleRevokeMessage(item.messageId)}
                              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                            >
                              Thu hồi
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessageForMe(item.messageId)}
                            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                          >
                            Xóa ở phía tôi
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {showTimeUnderMessage && item.createdAt && (
                  <div className="mt-0.5 px-1 text-[10px] text-gray-400 font-normal animate-fade-in">
                    {formatMessageTime(item.createdAt)}
                  </div>
                )}

                {readers.length > 0 && (
                  <div className={`mt-1 flex items-center gap-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {readers.map((reader) => (
                      <img
                        key={reader._id}
                        src={reader.avatar ? `${API_BASE_URL}${reader.avatar}` : `${API_BASE_URL}/uploads/default-avatar.png`}
                        alt={reader.fullname}
                        title={`${reader.fullname} đã xem`}
                        className="h-3.5 w-3.5 rounded-full object-cover border border-white shadow-sm"
                      />
                    ))}
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
            {/* NÚT GỬI ẢNH */}
            <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb] hover:bg-[#e0e7ff]">
              <ImageIcon size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSendImage}
              />
            </label>

            {/* INPUT TEXT */}
            <Input
              className="h-10 flex-1"
              placeholder="Nhap tin nhan..."
              {...register("content")}
              onKeyDown={handleTyping}
            />

            {/* NÚT SEND / LIKE */}
            {content?.trim() ? (
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb]"
              >
                <Send size={20} strokeWidth={2.5} fill="#4f6fef" />
              </button>
            ) : (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb]"
                onClick={() => handleSendMess({ content: LIKE_EMOJI })}
              >
                <ThumbsUp size={20} fill="#d2dd10" />
              </button>
            )}
          </div>
        </form>
      </div>

      {openProfile && (
        <Modal
          title={isGroup ? 'THÔNG TIN NHÓM' : 'THÔNG TIN CÁ NHÂN'}
          onClose={() => setOpenProfile(null)}
          size="sm"
        >
          {/* Thêm key vào đây để React reset lại hoàn toàn state của ProfileFriend mỗi lần đổi người */}
          <MenuProfile
            type={isGroup ? 'group' : 'personal'}
            data={openProfile}
            onSelectConversation={onSelectConversation}
            selectedConversation={selectedConversation}
            onMobileBack={onMobileBack}
          />

        </Modal>
      )}

      <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />

    </div>
  );
};

export default ConversationView;