import React from 'react';
import useAuthStore from '@/stores/useAuthStore';

const UserCardChat = ({ userCardChat = [], selectedConversation, onSelectConversation, lastMessageEvent }) => {
  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col">
      {userCardChat.map((conversation) => {
        const otherMember =
          conversation.members?.find(
            (member) => String(member.userId) !== String(currentUser?._id)
          ) || conversation.members?.[0];

        const displayName = otherMember?.fullname || 'Nguoi dung';
        const lastMessage = conversation.lastMessage || 'Bat dau cuoc tro chuyen';
        const shortLastMessage =
          lastMessage.length > 30 ? `${lastMessage.slice(0, 30)}...` : lastMessage;
        
        return (
          <button
            key={conversation._id}
            type="button"
            className={`flex w-full items-center gap-3 border-b border-[#f1f3f5] px-2 py-2 text-left transition ${
              String(selectedConversation?._id) === String(conversation._id)
                ? "bg-[#E8EDFF]"
                : "bg-white hover:bg-[#f8f9fa]"
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[18px] font-semibold text-[#3b5bdb]">
              <img
                src={`http://localhost:5000${otherMember?.avatar || "/uploads/default-avatar.png"}`}
                alt={displayName}
                className="size-10 rounded-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium text-[#1f2328]">
                {displayName}
              </div>
              <div className="truncate break-all text-[13px] text-muted-foreground">
                {String(conversation.lastSenderId) === String(currentUser?._id)
                  ? "Ban: " 
                  : `${displayName}: ` 
                }
                
                {shortLastMessage}
              </div>

            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UserCardChat;
