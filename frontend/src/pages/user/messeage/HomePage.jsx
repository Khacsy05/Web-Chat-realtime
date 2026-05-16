import React, { useState, useEffect } from 'react'
import ChatList from './ChatList'
import ConversationView from './ConversationView'
import DetailsPanel from './DetailsPanel'

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [lastMessageEvent, setLastMessageEvent] = useState(null);
  const [isOpenRightPage, setIsOpenRightPage] = useState(true);
  const handleMessageEvent = (payload) => {
    // payload: { conversationId, text, createdAt }
    setLastMessageEvent(payload);
  };

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;

      // Chỉ xử lý khi chuyển từ màn hình nhỏ sang lớn hoặc ngược lại
      if (lastWidth < 1024 && currentWidth >= 1024) {
        // Chuyển từ Mobile sang Desktop -> Tự động hiện sidebar
        setIsOpenRightPage(true);
      } else if (lastWidth >= 1024 && currentWidth < 1024) {
        // Chuyển từ Desktop sang Mobile -> Tự động ẩn để không hiện popup bất ngờ
        setIsOpenRightPage(false);
      }

      lastWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      {/* Bên trái – ẩn khi mobile */}
      <aside className="hidden min-h-0 w-[340px] shrink-0 border-r bg-white md:block">
        <ChatList
          onSelectConversation={setSelectedConversation}
          lastMessageEvent={lastMessageEvent}
        />
      </aside>

      {/* Ở giữa – luôn hiển thị */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <ConversationView
          selectedConversation={selectedConversation}
          onMessageEvent={handleMessageEvent}
          onOpenRighPage={setIsOpenRightPage}
          isOpenRighPage={isOpenRightPage}
        />
      </main>

      {/* Bên phải – Desktop Sidebar */}
      {isOpenRightPage && (
        <aside className="hidden min-h-0 w-[340px] shrink-0 border-l bg-white lg:block">
          <DetailsPanel />
        </aside>
      )}

      {/* Mobile Popup/Drawer – Hiện khi màn hình nhỏ */}
      {isOpenRightPage && (
        <div
          className="absolute inset-0 z-50 lg:hidden "
          onClick={() => setIsOpenRightPage(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[80%] max-w-[340px] shadow-xl bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              <DetailsPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
