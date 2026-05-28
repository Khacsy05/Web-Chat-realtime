import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatPanel from "../messeage/ChatPanel";
import conversation from "@/service/conversation";

const FriendChat = () => {
  const { friendId } = useParams();
  const { openFriendSidebar } = useOutletContext() ?? {};
  const {openFriendContent} = useOutletContext() ?? {};
  const [conversations, setConversation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!friendId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await conversation.createOrGetConversation(friendId);
        if (!cancelled) {
          setConversation(res.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Loi tai conversation:", error?.data?.message || error);
        }
      }
    };

    setConversation(null);
    load();

    return () => {
      cancelled = true;
    };
  }, [friendId]);

  const handleMobileBack = () => {
    openFriendSidebar?.();
  };
  // Trong file FriendChat.jsx

  const handleResetAfterDelete = () => {
    setConversation(null);

    // Kiểm tra nếu là màn hình nhỏ (thường là dưới 1024px theo logic ChatPanel của bạn)
    if (window.innerWidth < 1024) {
      // 📱 Hành động cho Mobile: Mở sidebar
      openFriendSidebar?.();
    } else {
      // 💻 Hành động cho Desktop: Chuyển trang
      navigate("/user/friend/allFriend");
    }
  };
  
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <ChatPanel
        selectedConversation={conversations}
        onMobileBack={handleMobileBack}
        onSelectConversation={handleResetAfterDelete}
        
      />
    </div>
  );
};

export default FriendChat;
