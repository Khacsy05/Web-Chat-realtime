// FriendChat.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatPanel from "../messeage/ChatPanel"; // component đã tách
import message from "@/service/message";

const FriendChat = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    if (!friendId) return;

    const load = async () => {
      try {
        const res = await message.createOrGetConversation(friendId);
        setConversation(res.data);
      } catch (error) {
        console.error("Loi tai conversation:", error?.data?.message || error);
      }
    };

    load();
  }, [friendId]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ChatPanel selectedConversation={conversation} />
    </div>
  );
};

export default FriendChat;