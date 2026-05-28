import React, { useEffect, useState } from 'react'
import ChatList from './ChatList'
import ChatPanel from './ChatPanel'

const MD_PX = 768;

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [lastMessageEvent, setLastMessageEvent] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleMessageEvent = (payload) => {
    setLastMessageEvent(payload);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (typeof window !== 'undefined' && window.innerWidth < MD_PX) {
      setMobileShowChat(true);
    }
  };

  const handleMobileBackFromChat = () => {
    setMobileShowChat(false);
  };
  const handleResetConversation = () => {
    setSelectedConversation(null);
    setMobileShowChat(false); // Đưa mobile quay trở về danh sách ChatList
  };
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_PX}px)`);
    const onChange = () => {
      if (mq.matches) {
        setMobileShowChat(false);
      } else if (selectedConversation) {
        setMobileShowChat(true);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [selectedConversation]);

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      <aside
        className={[
          'flex min-h-0 w-full shrink-0 flex-col border-r bg-white md:w-[340px]',
          mobileShowChat ? 'hidden md:flex' : 'flex',
        ].join(' ')}
      >
        <ChatList
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          lastMessageEvent={lastMessageEvent}
        />
      </aside>

      {selectedConversation ? (
        <div
          className={[
            'flex min-h-0 flex-1 flex-col overflow-hidden',
            !mobileShowChat ? 'hidden md:flex' : 'flex',
          ].join(' ')}
        >
          <ChatPanel
            selectedConversation={selectedConversation}
            onMessageEvent={handleMessageEvent}
            onMobileBack={handleMobileBackFromChat}
            onSelectConversation={handleResetConversation}
          />
        </div>
      ) : (
        <div className={[
          'flex min-h-0 flex-1 flex-col overflow-hidden bg-white items-center justify-center',
          !mobileShowChat ? 'hidden md:flex' : 'flex',
        ].join(' ')}>
          <div className="text-sm text-muted-foreground">
            Chon mot cuoc tro chuyen
          </div>
        </div>
      )}
      
      
    </div>
  )
}

export default HomePage
