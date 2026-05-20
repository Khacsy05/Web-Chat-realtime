import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatPanel from "../messeage/ChatPanel";
import message from "@/service/message";

const FriendChat = () => {
  const { friendId } = useParams();
  const { openFriendSidebar } = useOutletContext() ?? {};
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    if (!friendId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await message.createOrGetConversation(friendId);
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

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <ChatPanel
        selectedConversation={conversation}
        onMobileBack={handleMobileBack}
      />
    </div>
  );
};

export default FriendChat;
