import React, { useEffect, useState } from "react";
import ChatList from "./ChatList";
import ChatPanel from "./ChatPanel";
import useChatStore from "@/stores/useChatStore";
import socket from "@/lib/socket";

const MD_PX = 768;

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [lastMessageEvent, setLastMessageEvent] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const initSocket = useChatStore((state) => state.initSocket);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    initSocket();
  }, [initSocket]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (window.innerWidth < MD_PX) setMobileShowChat(true);
  };

  const handleResetConversation = () => {
    setSelectedConversation(null);
    setMobileShowChat(false);
  };

  useEffect(() => {
    if (!selectedConversation?._id) return;

    const nextSelected = conversations.find(
      (c) => String(c._id) === String(selectedConversation._id)
    );

    if (nextSelected && nextSelected !== selectedConversation) {
      setSelectedConversation(nextSelected);
    }
  }, [conversations, selectedConversation]);

  const handleMessageEvent = (payload) => {
    setLastMessageEvent(payload);
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      <aside
        className={`flex w-full flex-col border-r bg-white md:w-[340px] ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatList
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          lastMessageEvent={lastMessageEvent}
        />
      </aside>

      {selectedConversation ? (
        <div
          className={`flex flex-1 flex-col ${
            !mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatPanel
            selectedConversation={selectedConversation}
            onMessageEvent={handleMessageEvent}
            onSelectConversation={handleResetConversation}
          />
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="text-sm text-muted-foreground">
            Chọn một cuộc trò chuyện
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;  
