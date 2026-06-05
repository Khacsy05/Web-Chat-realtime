import React from 'react';
import useAuthStore from '@/stores/useAuthStore';
import { UsersRound } from 'lucide-react';

const UserCardChat = ({ userCardChat = [], selectedConversation, onSelectConversation }) => {
  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col">
      {userCardChat.map((conversation) => {
        // 1. Tìm người chat cùng (chỉ áp dụng cho chat đôi 1-1)
        // Sửa member.userId thành member._id để so sánh chính xác với currentUser._id
        const otherMember = conversation.members?.find(
          (member) => String(member._id) !== String(currentUser?.idUser)
        ) || conversation.members?.[0];
        const isGroup = conversation?.isGroup
        // 2. Logic hiển thị Tên cuộc hội thoại
        const displayName = isGroup
          ? (conversation.nameGroup || "Nhóm chưa đặt tên")
          : (otherMember?.fullname || 'Người dùng');

        // 3. Logic hiển thị Ảnh đại diện (Avatar)
        const displayAvatar = otherMember?.avatar 
          ? `http://localhost:5000${otherMember.avatar}` 
          : "http://localhost:5000/uploads/default-avatar.png";
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
            // Nếu là nhóm thì tìm tên người gửi cuối, nếu là chat đôi thì hiển thị thẳng tên đối phương luôn cho gọn
            if (isGroup) {
              const sender = conversation.members?.find(m => String(m._id) === String(conversation.lastSenderId));
              messagePrefix = sender ? `${sender.fullname}: ` : "";
            } else {
              messagePrefix = `${displayName}: `;
            }
          }
        }

        return (
          <div
            key={conversation._id}
            type="button"
            className={`flex w-full items-center gap-3 border-b border-[#f1f3f5] px-2 py-2 text-left transition ${
              String(selectedConversation?._id) === String(conversation._id)
                ? "bg-[#E8EDFF]"
                : "bg-white hover:bg-[#f8f9fa]"
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            {/* AVATAR */}
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-[#3b5bdb]">
              <button className={`relative size-full ${isGroup ? 'cursor-default' : 'cursor-pointer'}`} onClick={() => {
                if(isGroup) return;
                setOpenProfile(otherMember)
                }}>
                  {isGroup ? (
                    conversation?.avatar ? (
                      <img
                        src={`http://localhost:5000${conversation?.avatar}`}
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
                      src={displayAvatar}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                  )}
              </button>
            </div>

            {/* INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                {isGroup && <UsersRound size={14} className="text-gray-500 shrink-0" fill="#82837a" />}
                {displayName}
              </div>
              <div className="truncate break-all text-[13px] text-muted-foreground">
                {messagePrefix}
                {shortLastMessage}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserCardChat;