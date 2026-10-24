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
  const [archiveInitialTab, setArchiveInitialTab] = useState("media");

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

  const fetchArchive = async () => {
    if (!selectedConversation?._id) return;
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

  const handleMessageEvent = (payload) => {
    onMessageEvent?.(payload);
    // Khi có tin nhắn ảnh hoặc file mới gửi đi -> reload kho lưu trữ real-time
    if (payload?.type === 'file' || payload?.type === 'image') {
      fetchArchive();
    }
  };

  useEffect(() => {
    if (!selectedConversation?._id) return;
    fetchArchive();
  }, [selectedConversation?._id]);

  // Lắng nghe socket để cập nhật kho lưu trữ khi người khác gửi ảnh/file real-time
  useEffect(() => {
    if (!selectedConversation?._id) return;

    const handleSocketNewMessage = (payload) => {
      if (
        String(payload.conversationId) === String(selectedConversation._id) &&
        (payload.type === 'file' || payload.type === 'image')
      ) {
        setArchiveItems((prev) => {
          if (prev.some((item) => String(item.messageId || item._id) === String(payload.messageId))) {
            return prev;
          }
          const newItem = {
            messageId: payload.messageId,
            senderId: payload.from,
            content: payload.text,
            type: payload.type,
            image: payload.image || null,
            fileUrl: payload.fileUrl || null,
            fileName: payload.fileName || null,
            fileSize: payload.fileSize || null,
            createdAt: payload.createdAt || new Date().toISOString(),
            isDeleted: false,
          };
          return [newItem, ...prev];
        });
      }
    };

    const handleSocketRevoke = (payload) => {
      setArchiveItems((prev) =>
        prev.map((item) =>
          String(item.messageId || item._id) === String(payload.messageId)
            ? { ...item, isDeleted: true }
            : item
        )
      );
    };

    import('@/lib/socket').then(({ default: socket }) => {
      socket.on('receive-message', handleSocketNewMessage);
      socket.on('message-revoked', handleSocketRevoke);
    });

    return () => {
      import('@/lib/socket').then(({ default: socket }) => {
        socket.off('receive-message', handleSocketNewMessage);
        socket.off('message-revoked', handleSocketRevoke);
      });
    };
  }, [selectedConversation?._id]);

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        <ConversationView
          selectedConversation={selectedConversation}
          onMessageEvent={handleMessageEvent}
          onOpenRighPage={setIsOpenRightPage}
          isOpenRighPage={isOpenRightPage}
          onMobileBack={onMobileBack}
        />
      </main>

      {isOpenRightPage && (
        <aside className="hidden h-full min-h-0 w-[340px] shrink-0 border-l bg-white lg:flex lg:flex-col overflow-hidden">
          {rightView === "details" && (
            <DetailsPanel
              selectedConversation={selectedConversation}
              onSelectConversation={onSelectConversation}
              onMobileBack={onMobileBack}
              onOpenMembers={() => setRightView("members")}
              onOpenMediaArchive={(tab = "media") => {
                setArchiveInitialTab(tab);
                setRightView("media-archive");
              }}
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
              initialTab={archiveInitialTab}
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
                  onOpenMembers={() => setRightView("members")}
                  onOpenMediaArchive={(tab = "media") => {
                    setArchiveInitialTab(tab);
                    setRightView("media-archive");
                  }}
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
                  initialTab={archiveInitialTab}
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
