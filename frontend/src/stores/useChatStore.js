import { create } from "zustand";
import socket from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";

export const sortConversations = (list, currentUserId) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const pinA = a.pinnedBy?.find((p) => String(p.userId) === String(currentUserId));
    const pinB = b.pinnedBy?.find((p) => String(p.userId) === String(currentUserId));
    const isPinnedA = Boolean(pinA);
    const isPinnedB = Boolean(pinB);

    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;

    // "đoạn nào sớm hơn thì nên trên" -> pinned earlier on top (pinnedAt ascending)
    if (isPinnedA && isPinnedB) {
      return new Date(pinA.pinnedAt).getTime() - new Date(pinB.pinnedAt).getTime();
    }

    // Unpinned chats: newest lastMessageAt goes on top
    const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

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
        lastMessageId: payload.messageId || null,
        lastMessageAt: payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const next = [...state.conversations];
      next[idx] = updated;

      const currentUserId = useAuthStore.getState().user?.idUser;
      return { conversations: sortConversations(next, currentUserId) };
    });
  },

  /* ================= CREATE GROUP ================= */
  onCreateGroup: (conversation) => {
    set((state) => {
      const merged = [
        conversation,
        ...state.conversations.filter(
          (c) => String(c._id) !== String(conversation._id)
        ),
      ];
      const currentUserId = useAuthStore.getState().user?.idUser;
      return { conversations: sortConversations(merged, currentUserId) };
    });
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
    set((state) => {
      const merged = [
        conversation,
        ...state.conversations.filter(
          (c) => String(c._id) !== String(conversation._id)
        ),
      ];
      const currentUserId = useAuthStore.getState().user?.idUser;
      return { conversations: sortConversations(merged, currentUserId) };
    });
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
  updateConversationSeen: (conversationId, userId, lastSeenMessageId) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (String(c._id) !== String(conversationId)) return c;
        const membersReadStatus = c.membersReadStatus ? [...c.membersReadStatus] : [];
        const index = membersReadStatus.findIndex((s) => String(s.userId) === String(userId));
        if (index > -1) {
          membersReadStatus[index] = {
            ...membersReadStatus[index],
            lastSeenMessageId,
            seenAt: new Date().toISOString()
          };
        } else {
          membersReadStatus.push({
            userId,
            lastSeenMessageId,
            seenAt: new Date().toISOString()
          });
        }
        return { ...c, membersReadStatus };
      })
    }));
  },
  updateConversationPin: (conversationId, userId, isPinned, pinnedAt) => {
    set((state) => {
      const next = state.conversations.map((c) => {
        if (String(c._id) !== String(conversationId)) return c;
        let pinnedBy = c.pinnedBy ? [...c.pinnedBy] : [];
        if (isPinned) {
          if (!pinnedBy.some((p) => String(p.userId) === String(userId))) {
            pinnedBy.push({ userId, pinnedAt: pinnedAt || new Date().toISOString() });
          }
        } else {
          pinnedBy = pinnedBy.filter((p) => String(p.userId) !== String(userId));
        }
        return { ...c, pinnedBy };
      });
      return { conversations: sortConversations(next, userId) };
    });
  },
  onUserSeenUpdate: ({ conversationId, userId, lastSeenMessageId }) => {
    get().updateConversationSeen(conversationId, userId, lastSeenMessageId);
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
    socket.off("user-seen-update", store.onUserSeenUpdate);

    socket.on("receive-message", store.onReceiveMessage);
    socket.on("conversation-createGroup", store.onCreateGroup);
    socket.on("member-updated", store.onMemberUpdated);
    socket.on("conversation-added", store.onConversationAdded);
    socket.on("member-removed", store.onMemberRemoved);
    socket.on("conversation-cleared", store.onConversationCleared);
    socket.on("group-avatar-updated", store.onUpdateAvatarConversation);
    socket.on("group-name-updated", store.onUpdateNameGroup);
    socket.on("user-seen-update", store.onUserSeenUpdate);
  },
}));

export default useChatStore;