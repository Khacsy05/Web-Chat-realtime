import React, { useState } from 'react';
import useAuthStore from '@/stores/useAuthStore';
import useChatStore from '@/stores/useChatStore';
import conversationService from '@/service/conversation';
import { UsersRound, Pin, PinOff } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import PinLimitModal from './PinLimitModal';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserCardChat = ({ userCardChat = [], selectedConversation, onSelectConversation }) => {
  const currentUser = useAuthStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const updateConversationPin = useChatStore((state) => state.updateConversationPin);

  const [pinModalTarget, setPinModalTarget] = useState(null);
  const [pinLoadingId, setPinLoadingId] = useState(null);

  const handleTogglePin = async (e, conv, isPinned) => {
    e.stopPropagation();
    if (pinLoadingId) return;

    if (isPinned) {
      setPinLoadingId(conv._id);
      try {
        const res = await conversationService.togglePin(conv._id);
        if (res.data?.success) {
          updateConversationPin(conv._id, currentUser?.idUser, false);
          toast.success("Đã bỏ ghim cuộc trò chuyện");
        }
      } catch (error) {
        toast.error(error?.data?.message || "Lỗi khi bỏ ghim");
      } finally {
        setPinLoadingId(null);
      }
    } else {
      const pinnedCount = conversations.filter((c) =>
        c.pinnedBy?.some((p) => String(p.userId) === String(currentUser?.idUser))
      ).length;

      if (pinnedCount >= 5) {
        setPinModalTarget(conv);
        return;
      }

      setPinLoadingId(conv._id);
      try {
        const res = await conversationService.togglePin(conv._id);
        if (res.data?.success) {
          updateConversationPin(conv._id, currentUser?.idUser, true, res.data.pinnedAt);
          toast.success("Đã ghim cuộc trò chuyện lên đầu");
        }
      } catch (error) {
        if (
          error?.data?.code === "MAX_PINNED_REACHED" ||
          error?.response?.data?.code === "MAX_PINNED_REACHED"
        ) {
          setPinModalTarget(conv);
        } else {
          toast.error(error?.data?.message || "Lỗi khi ghim cuộc trò chuyện");
        }
      } finally {
        setPinLoadingId(null);
      }
    }
  };

  return (
    <div className="flex flex-col">
      {userCardChat.map((conversation) => {
        // 1. Tìm người chat cùng (chỉ áp dụng cho chat đôi 1-1)
        const otherMember = conversation.members?.find(
          (member) => String(member._id) !== String(currentUser?.idUser)
        ) || conversation.members?.[0];
        const isGroup = conversation?.isGroup;

        // 2. Logic hiển thị Tên cuộc hội thoại
        const displayName = isGroup
          ? (conversation.nameGroup || "Nhóm chưa đặt tên")
          : (otherMember?.fullname || 'Người dùng');

        // 3. Logic hiển thị Ảnh đại diện (Avatar)
        const displayAvatar = getImageUrl(otherMember?.avatar);
        const members = conversation?.members || [];
        const totalMembers = members.length;

        // 4. Xử lý tin nhắn cuối
        const lastMessage = conversation.lastMessage || 'Bắt đầu cuộc trò chuyện';
        const shortLastMessage = lastMessage.length > 30 ? `${lastMessage.slice(0, 30)}...` : lastMessage;

        // 5. Xác định ai là người gửi tin nhắn cuối cùng để thêm tiền tố (Prefix)
        let messagePrefix = "";
        if (conversation.lastMessage) {
          if (String(conversation.lastSenderId) === String(currentUser?.idUser)) {
            messagePrefix = "Bạn: ";
          } else {
            if (isGroup) {
              const sender = conversation.members?.find(m => String(m._id) === String(conversation.lastSenderId));
              messagePrefix = sender ? `${sender.fullname}: ` : "";
            } else {
              messagePrefix = `${displayName}: `;
            }
          }
        }

        // 6. Kiểm tra trạng thái đã đọc
        const myReadStatus = conversation.membersReadStatus?.find(
          (status) => String(status.userId) === String(currentUser?.idUser)
        );
        const isUnread = Boolean(
          conversation.lastMessage &&
          String(conversation.lastSenderId) !== String(currentUser?.idUser) &&
          (!myReadStatus || (
            conversation.lastMessageId && myReadStatus.lastSeenMessageId
              ? String(myReadStatus.lastSeenMessageId) !== String(conversation.lastMessageId)
              : new Date(myReadStatus.seenAt).getTime() < new Date(conversation.lastMessageAt || conversation.updatedAt).getTime()
          ))
        );

        // 7. Kiểm tra trạng thái đã ghim
        const isPinned = Boolean(
          conversation.pinnedBy?.some(
            (p) => String(p.userId) === String(currentUser?.idUser)
          )
        );

        return (
          <div
            key={conversation._id}
            type="button"
            className={`group relative flex w-full items-center gap-3 border-b border-[#f1f3f5] px-2 py-2 text-left transition cursor-pointer ${
              String(selectedConversation?._id) === String(conversation._id)
                ? "bg-[#E8EDFF]"
                : isPinned
                  ? "bg-[#fafcff] hover:bg-[#f0f4ff]"
                  : "bg-white hover:bg-[#f8f9fa]"
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            {/* AVATAR */}
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-[#3b5bdb]">
              <div className="relative size-full">
                {isGroup ? (
                  conversation?.avatar ? (
                    <img
                      src={getImageUrl(conversation?.avatar)}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="relative size-full">
                      <img
                        src={getImageUrl(members[0]?.avatar)}
                        className="absolute top-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-20"
                        alt="mem1"
                      />
                      <img
                        src={getImageUrl(members[1]?.avatar)}
                        className="absolute top-0 right-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-10"
                        alt="mem2"
                      />
                      <img
                        src={getImageUrl(members[2]?.avatar)}
                        className="absolute bottom-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-30"
                        alt="mem3"
                      />
                      <div className="absolute bottom-0 right-0.5 size-7 rounded-full border-2 border-white bg-[#e2e6ea] flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm z-40">
                        {totalMembers}
                      </div>
                    </div>
                  )
                ) : (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                  />
                )}
              </div>
            </div>

            {/* INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <div className={`flex items-center gap-1.5 text-sm min-w-0 ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                  {isGroup && <UsersRound size={14} className="text-gray-500 shrink-0" fill="#82837a" />}
                  <span className="truncate">{displayName}</span>
                </div>
                {/* Biểu tượng ghim cố định nếu được ghim */}
                {isPinned && (
                  <Pin
                    size={13}
                    className="text-[#0068ff] -rotate-45 shrink-0 ml-1"
                    fill="#0068ff"
                  />
                )}
              </div>

              <div className={`truncate break-all text-[13px] ${isUnread ? 'font-bold text-gray-900' : 'text-muted-foreground'}`}>
                {messagePrefix}
                {shortLastMessage}
              </div>
            </div>

            {/* NÚT THAO TÁC KHI HOVER & CHẤM CHƯA ĐỌC */}
            <div className="flex items-center shrink-0 ml-auto gap-1">
              <button
                type="button"
                disabled={pinLoadingId === conversation._id}
                onClick={(e) => handleTogglePin(e, conversation, isPinned)}
                title={isPinned ? "Bỏ ghim" : "Ghim hội thoại"}
                className={`p-1.5 rounded-full hover:bg-black/5 transition-all cursor-pointer ${
                  isPinned
                    ? "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#0068ff]"
                }`}
              >
                {isPinned ? <PinOff size={14} /> : <Pin size={14} className="-rotate-45" />}
              </button>

              {isUnread && (
                <div className="size-2.5 rounded-full bg-[#3b5bdb] shrink-0 mr-1" />
              )}
            </div>
          </div>
        );
      })}

      {/* MODAL CẢNH BÁO GIỚI HẠN GHIM TỐI ĐA 5 */}
      {pinModalTarget && (
        <PinLimitModal
          isOpen={Boolean(pinModalTarget)}
          onClose={() => setPinModalTarget(null)}
          targetConversation={pinModalTarget}
        />
      )}
    </div>
  );
};

export default UserCardChat;