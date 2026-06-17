import { create } from 'zustand';
import messageService from '@/service/message';
import socket from '@/lib/socket';
import { toast } from 'sonner';

let typingTimeout = null;

const useMessStore = create((set, get) => ({
  mess: [],
  isLoadingMessages: false,
  loadedConversationId: null,
  cursor: null,
  hasMore: true,
  loadingMore: false,
  typingUser: null,

  setMess: (messages) => set({ mess: messages }),
  clearMessages: () => set({
    mess: [],
    cursor: null,
    hasMore: true,
    loadedConversationId: null,
    typingUser: null,
  }),

  fetchMessages: async (conversationId, isReset = false) => {
    if (!conversationId) return;
    const { loadingMore, hasMore, cursor } = get();
    if (loadingMore || (!hasMore && !isReset)) return;

    if (isReset) {
      set({
        isLoadingMessages: true,
        cursor: null,
        loadedConversationId: null,
        hasMore: true,
      });
    }

    set({ loadingMore: true });

    try {
      const response = await messageService.getMessage(conversationId, {
        limit: 15,
        before: isReset ? null : cursor,
      });

      const newMessages = response.data.items;

      set((state) => {
        let updatedMess;
        if (isReset) {
          updatedMess = newMessages;
        } else {
          const existingIds = new Set(state.mess.map((m) => String(m.messageId)));
          const uniqueNewMessages = newMessages.filter(
            (m) => !existingIds.has(String(m.messageId))
          );
          updatedMess = [...uniqueNewMessages, ...state.mess];
        }

        return {
          mess: updatedMess,
          cursor: response.data.nextCursor,
          hasMore: response.data.hasMore,
          loadedConversationId: String(conversationId),
        };
      });
    } catch (error) {
      console.error('Error fetching messages in store:', error);
    } finally {
      set({
        isLoadingMessages: false,
        loadingMore: false,
      });
    }
  },

  sendMessage: async ({ conversationId, content, currentUser, userName, members, onMessageEvent }) => {
    try {
      if (!conversationId || !currentUser?.idUser) {
        toast.error('Không tìm thấy cuộc trò chuyện để gửi tin nhắn');
        return;
      }

      const contentToSend = String(content || '').trim();
      if (!contentToSend) return;

      if (!socket.connected) {
        socket.connect();
      }

      const res = await messageService.sendMessage({
        conversationId,
        content: contentToSend,
      });

      const newMsg = {
        messageId: res.data._id,
        senderId: currentUser.idUser,
        name: userName || 'Người dùng',
        content: contentToSend,
        createdAt: res.data.createdAt || new Date().toISOString(),
      };

      set((state) => ({
        mess: [...state.mess, newMsg],
      }));

      onMessageEvent?.({
        conversationId: String(conversationId),
        senderId: currentUser.idUser,
        content: contentToSend,
        createdAt: new Date().toISOString(),
      });

      socket.emit('send-message', {
        from: String(currentUser.idUser),
        members: members || [],
        text: contentToSend,
        conversationId: String(conversationId),
        messageId: String(res.data._id),
        name: userName || 'Người dùng',
        createdAt: res.data.createdAt,
      });

      return true;
    } catch (error) {
      console.error(error);
      toast.error('Gửi tin nhắn thất bại');
      return false;
    }
  },


  sendImage: async ({ conversationId, image, file, currentUser, userName, members, onMessageEvent }) => {
    try {
      const fileToUpload = image || file;
      if (!conversationId || !currentUser?.idUser) {
        toast.error('Không tìm thấy cuộc trò chuyện để gửi tin nhắn');
        return;
      }

      if (!fileToUpload) return;

      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append("image", fileToUpload);

      if (!socket.connected) {
        socket.connect();
      }

      const res = await messageService.sendImage(formData);

      const newMsg = {
        messageId: res.data._id,
        senderId: currentUser.idUser,
        name: userName || 'Người dùng',
        type: 'image',
        image: res.data.image, // 👈 QUAN TRỌNG
        createdAt: res.data.createdAt || new Date().toISOString(),
      };
      set((state) => ({
        mess: [...state.mess, newMsg],
      }));

      onMessageEvent?.({
        conversationId: String(conversationId),
        senderId: currentUser.idUser,
        content: res.data.content,
        createdAt: new Date().toISOString(),
      });

      socket.emit('send-message', {
        from: String(currentUser.idUser),
        members: members || [],
        text: res.data.content || "[Hình ảnh]",
        type: 'image',
        image: res.data.image,
        conversationId: String(conversationId),
        messageId: String(res.data._id),
        name: userName || 'Người dùng',
        createdAt: res.data.createdAt,
      });

      return true;
    } catch (error) {
      console.error(error);
      toast.error('Gửi tin nhắn thất bại');
      return false;
    }
  },

  revokeMessage: async (msgId, conversationId) => {
    try {
      await messageService.revokeMessage(msgId, conversationId);
      toast.success('Đã thu hồi tin nhắn');
      set((state) => ({
        mess: state.mess.map((m) =>
          String(m.messageId) === String(msgId)
            ? { ...m, content: 'Tin nhắn đã được thu hồi', isDeleted: true }
            : m
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Không thể thu hồi tin nhắn');
    }
  },

  deleteMessageForMe: async (msgId) => {
    try {
      await messageService.deleteMessageForMe(msgId);
      toast.success('Đã xóa tin nhắn ở phía bạn');
      set((state) => ({
        mess: state.mess.filter((m) => String(m.messageId) !== String(msgId)),
      }));
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Không thể xóa tin nhắn');
    }
  },

  sendTyping: (conversationId, userId, fullname) => {
    if (!conversationId || !userId || !fullname) return;

    socket.emit('typing', {
      conversationId,
      userId,
      fullname,
    });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit('stop-typing', {
        conversationId,
        userId,
        fullname,
      });
    }, 1000);
  },

  setupSocketListeners: (conversationId, onMessageEvent) => {
    const handleReceive = (payload) => {
      onMessageEvent?.({
        conversationId: String(payload.conversationId),
        senderId: payload.from,
        content: payload.text,
        createdAt: new Date().toISOString(),
      });

      if (String(payload.conversationId) !== String(conversationId)) return;

      set((state) => {
        if (state.mess.some((m) => String(m.messageId) === String(payload.messageId))) {
          return state;
        }

        const incomingMsg = {
          messageId: payload.messageId,
          senderId: payload.from,
          name: payload.name ?? 'Người dùng',
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        if (payload.type === 'image') {
          incomingMsg.type = 'image';
          incomingMsg.image = payload.image; // Gán link ảnh nhận từ socket
        } else {
          incomingMsg.content = payload.text; // Tin nhắn chữ bình thường
        }
        return {
          mess: [...state.mess, incomingMsg],
        };
      });
    };

    const handleRevoke = (payload) => {
      set((state) => ({
        mess: state.mess.map((m) =>
          String(m.messageId) === String(payload.messageId)
            ? {
              ...m,
              content: payload.content,
              isDeleted: payload.isDeleted,
            }
            : m
        ),
      }));
    };

    const handleTyping = (payload) => {
      if (String(payload.conversationId) !== String(conversationId)) return;
      set({
        typingUser: {
          userId: payload.userId,
          fullname: payload.fullname || 'Ai đó',
        },
      });
    };

    const handleStopTyping = (payload) => {
      if (String(payload.conversationId) !== String(conversationId)) return;
      set({ typingUser: null });
    };

    socket.on('receive-message', handleReceive);
    socket.on('message-revoked', handleRevoke);
    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);

    // Return the unsubscribe/cleanup function
    return () => {
      socket.off('receive-message', handleReceive);
      socket.off('message-revoked', handleRevoke);
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
    };
  },
}));

export default useMessStore;
