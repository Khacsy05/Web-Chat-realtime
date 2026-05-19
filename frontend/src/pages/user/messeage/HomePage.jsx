import React, { useState } from 'react'
import ChatList from './ChatList'
import ChatPanel from './ChatPanel'

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [lastMessageEvent, setLastMessageEvent] = useState(null);
  const handleMessageEvent = (payload) => {
    setLastMessageEvent(payload);
  };

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      {/* Bên trái – ẩn khi mobile */}
      <aside className="hidden min-h-0 w-[340px] shrink-0 border-r bg-white md:block">
        <ChatList
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          lastMessageEvent={lastMessageEvent}
        />
      </aside>

      {/* Ở giữa – luôn hiển thị */}
      <ChatPanel
        selectedConversation={selectedConversation}
        onMessageEvent={handleMessageEvent}
      />

      {/* Bên phải – Desktop Sidebar */}
      
    </div>
  )
}

export default HomePage
