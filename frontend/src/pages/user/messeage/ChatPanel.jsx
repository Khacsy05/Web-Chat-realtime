import React, { useEffect, useState } from 'react'
import ConversationView from './ConversationView';
import DetailsPanel from './DetailsPanel';

const ChatPanel = ({ selectedConversation, onMessageEvent, onMobileBack ,onSelectConversation}) => {
  const [isOpenRightPage, setIsOpenRightPage] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;

      if (lastWidth < 1024 && currentWidth >= 1024) {
        setIsOpenRightPage(true);
      } else if (lastWidth >= 1024 && currentWidth < 1024) {
        setIsOpenRightPage(false);
      }

      lastWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMessageEvent = (payload) => {
    onMessageEvent?.(payload);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
      <main className="flex-1 min-h-0 overflow-hidden">
        <ConversationView
          selectedConversation={selectedConversation}
          onMessageEvent={handleMessageEvent}
          onOpenRighPage={setIsOpenRightPage}
          isOpenRighPage={isOpenRightPage}
          onMobileBack={onMobileBack}
        />
      </main>

      {isOpenRightPage && (
        <aside className="hidden min-h-0 w-[340px] shrink-0 border-l bg-white lg:block">
          <DetailsPanel 
            selectedConversation={selectedConversation} 
            onSelectConversation={onSelectConversation}
            onMobileBack={onMobileBack}
          />
        </aside>
      )}

      {isOpenRightPage && (
        <div
          className="absolute inset-0 z-50 lg:hidden"
          onClick={() => setIsOpenRightPage(false)}
        >
          <div
            className="absolute right-0 top-0 flex h-full w-[80%] max-w-[340px] flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              <DetailsPanel 
                selectedConversation={selectedConversation} 
                onSelectConversation={onSelectConversation}
                onMobileBack={onMobileBack}
                
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel
