import { create } from "zustand";
import socket from "@/lib/socket";

const useChatStore = create((set, get) => ({
  conversations: [],

  setConversations: (updater) =>
    set((state) => ({
      conversations:
        typeof updater === "function"
          ? updater(state.conversations)
          : updater,
    })),

  /* ================= MESSAGES ================= */
  onReceiveMessage: (payload) => {
    set((state) => {
      const idx = state.conversations.findIndex(
        (c) => String(c._id) === String(payload.conversationId)
      );

      if (idx === -1) return state;

      const updated = {
        ...state.conversations[idx],
        lastMessage: payload.content || payload.text,
        lastSenderId: payload.type === 'system' ? null : payload.from,
        updatedAt: new Date().toISOString(),
      };

      const next = [...state.conversations];
      next.splice(idx, 1);
      next.unshift(updated);

      return { conversations: next };
    });
  },

  /* ================= CREATE GROUP ================= */
  onCreateGroup: (conversation) => {
    set((state) => ({
      conversations: [
        conversation,
        ...state.conversations.filter(
          (c) => String(c._id) !== String(conversation._id)
        ),
      ],
    }));
  },

  /* ================= ADD MEMBER ================= */
  onMemberUpdated: ({ conversationId, conversation }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c._id) === String(conversationId)
          ? conversation
          : c
      ),
    }));
  },

  /* ================= NEW GROUP FOR USER ================= */
  onConversationAdded: (conversation) => {
    set((state) => ({
      conversations: [
        conversation,
        ...state.conversations.filter(
          (c) => String(c._id) !== String(conversation._id)
        ),
      ],
    }));
  },

  /* ================= REMOVE MEMBER ================= */
  onMemberRemoved: ({ conversationId }) => {
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => String(c._id) !== String(conversationId)
      ),
    }));
  },

  /* ================= DELETE GROUP ================= */
  onConversationCleared: ({ conversationId }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c._id) === String(conversationId)
          ? { ...c, lastMessage: "" }
          : c
      ),
    }));
  },
  onUpdateAvatarConversation: ({ conversationId, avatar }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c._id) === String(conversationId)
          ? { ...c, avatar: avatar }
          : c
      ),
    }));
  },
  onUpdateNameGroup: ({ conversationId, nameGroup }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c._id) === String(conversationId)
          ? { ...c, nameGroup: nameGroup }
          : c
      ),
    }));
  },

  /* ================= INIT SOCKET ================= */
  initSocket: () => {
    const store = get();
    socket.off("receive-message", store.onReceiveMessage);
    socket.off("conversation-createGroup", store.onCreateGroup);
    socket.off("member-updated", store.onMemberUpdated);
    socket.off("conversation-added", store.onConversationAdded);
    socket.off("member-removed", store.onMemberRemoved);
    socket.off("conversation-cleared", store.onConversationCleared);
    socket.off("group-avatar-updated", store.onUpdateAvatarConversation);
    socket.off("group-name-updated", store.onUpdateNameGroup);

    socket.on("receive-message", store.onReceiveMessage);
    socket.on("conversation-createGroup", store.onCreateGroup);
    socket.on("member-updated", store.onMemberUpdated);
    socket.on("conversation-added", store.onConversationAdded);
    socket.on("member-removed", store.onMemberRemoved);
    socket.on("conversation-cleared", store.onConversationCleared);
    socket.on("group-avatar-updated", store.onUpdateAvatarConversation);
    socket.on("group-name-updated", store.onUpdateNameGroup);
  },
}));

export default useChatStore;