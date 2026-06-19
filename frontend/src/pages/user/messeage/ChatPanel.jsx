import React, { useEffect, useState } from 'react'
import ConversationView from './ConversationView';
import DetailsPanel from './DetailsPanel';
import GroupMembersPanel from './GroupMembersPanel';
import MediaArchiveModal from './MediaArchiveModal';
import messageService from '@/service/message';
const ChatPanel = ({ selectedConversation, onMessageEvent, onMobileBack, onSelectConversation }) => {
  const [isOpenRightPage, setIsOpenRightPage] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [isLoading, setIsLoading] = useState(false);
  const [archiveItems, setArchiveItems] = useState([]);
  const [rightView, setRightView] = useState("details");
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
  useEffect(() => {
    setRightView("details");
  }, [selectedConversation?._id]);
  const handleMessageEvent = (payload) => {
    onMessageEvent?.(payload);
  };
  useEffect(() => {
    if (!selectedConversation?._id) return;
    const fetchArchive = async () => {
      setIsLoading(true);
      try {
        const res = await messageService.getMediaArchive(selectedConversation?._id);
        setArchiveItems(res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải kho lưu trữ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    // Hàm nhóm các vật phẩm theo ngày gửi (Giống "Ngày 17 Tháng 6" trong ảnh)
    fetchArchive();
  }, [selectedConversation?._id]);

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden">
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
          {rightView === "details" && (
            <DetailsPanel
              selectedConversation={selectedConversation}
              onSelectConversation={onSelectConversation}
              onMobileBack={onMobileBack}
              onOpenMembers={() => setRightView("members")} // ⭐
              onOpenMediaArchive={() => setRightView("media-archive")}
              archiveItems={archiveItems}

            />
          )}

          {rightView === "members" && (
            <GroupMembersPanel
              conversations={selectedConversation}
              onBack={() => setRightView("details")}
            />
          )}

          {rightView === "media-archive" && (
            <MediaArchiveModal
              isLoading={isLoading}
              archiveItems={archiveItems}
              conversationId={selectedConversation?._id}
              onClose={() => setRightView("details")}
            />
          )}

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
              {rightView === "details" && (
                <DetailsPanel
                  archiveItems={archiveItems}
                  selectedConversation={selectedConversation}
                  onSelectConversation={onSelectConversation}
                  onMobileBack={onMobileBack}
                  onOpenMembers={() => setRightView("members")} // ⭐
                  onOpenMediaArchive={() => setRightView("media-archive")}
                />
              )}

              {rightView === "members" && (
                <GroupMembersPanel
                  conversations={selectedConversation}
                  onBack={() => setRightView("details")}
                />
              )}

              {rightView === "media-archive" && (
                <MediaArchiveModal
                  isLoading={isLoading}
                  archiveItems={archiveItems}
                  conversationId={selectedConversation?._id}
                  onClose={() => setRightView("details")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel
