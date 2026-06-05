import { create } from 'zustand';
import socket from '@/lib/socket';

const useChatStore = create((set, get) => ({
  conversations: [],

  /* ================== BASIC ================== */
  setConversations: (updater) =>
    set((state) => ({
      conversations:
        typeof updater === 'function'
          ? updater(state.conversations)
          : updater,
    })),

  /* ================== REALTIME HANDLERS ================== */

  // 1️⃣ Nhận tin nhắn mới → đưa conversation lên đầu
  onReceiveMessage: (payload) => {
    set((state) => {
      const idx = state.conversations.findIndex(
        (c) => String(c._id) === String(payload.conversationId)
      );

      if (idx === -1) return state;

      const updated = {
        ...state.conversations[idx],
        lastMessage: payload.content,
        lastSenderId: payload.senderId,
        updatedAt: new Date().toISOString(),
      };

      const next = [...state.conversations];
      next.splice(idx, 1);
      next.unshift(updated);

      return { conversations: next };
    });
  },

  // 2️⃣ Tạo group mới → thêm vào list
  onCreateGroup: (conversation) => {
    set((state) => {
      const exists = state.conversations.some(
        (c) => String(c._id) === String(conversation._id)
      );
      if (exists) return state;

      return {
        conversations: [conversation, ...state.conversations],
      };
    });
  },

  // 3️⃣ Add member → update members
  onMemberAdded: ({ conversationId, members }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c._id) === String(conversationId)
          ? { ...c, members }
          : c
      ),
    }));
  },

  // 4️⃣ Xoá conversation
  onConversationDeleted: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => String(c._id) !== String(conversationId)
      ),
    }));
  },

  // 5️⃣ Bị kick / rời nhóm
  onRemoveMember: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => String(c._id) !== String(conversationId)
      ),
    }));
  },

  /* ================== INIT SOCKET ================== */
  initSocket: () => {
    const store = get();

    socket.off(); // tránh bị duplicate khi reload

    socket.on('receive-message', store.onReceiveMessage);
    socket.on('conversation-createGroup', store.onCreateGroup);
    socket.on('member-added', store.onMemberAdded);
    socket.on('conversation-deleted', store.onConversationDeleted);
    socket.on('remove-member', store.onRemoveMember);
  },
}));

export default useChatStore;