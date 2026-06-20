import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import socket from "@/lib/socket";
import { toast } from "sonner";
import notificationService from "@/service/notification";

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],

      fetchNotifications: async () => {
        try {
          const res = await notificationService.getNotifications();
          if (res.data) {
            // Map backend fields to frontend expected fields if necessary
            const mapped = res.data.map((n) => ({
              id: n._id,
              type: n.type,
              content: n.content,
              isRead: n.isRead,
              createdAt: n.createdAt,
              relatedId: n.relatedId,
              avatar: n.sender?.avatar || null,
            }));
            set({ notifications: mapped });
          }
        } catch (error) {
          console.error("Lỗi khi tải thông báo:", error);
        }
      },

      addNotification: (notification) => {
        set((state) => {
          // Avoid duplicate notifications for the same event
          const exists = state.notifications.some(
            (n) => n.id === notification.id || (notification.relatedId && String(n.relatedId) === String(notification.relatedId) && n.type === notification.type)
          );
          if (exists) return state;

          return {
            notifications: [
              {
                id: notification.id || String(Date.now()),
                type: notification.type, // 'friend_request' | 'accept_friend' | 'reject_friend' | 'kick'
                content: notification.content,
                isRead: notification.isRead ?? false,
                createdAt: notification.createdAt || new Date().toISOString(),
                relatedId: notification.relatedId || null,
                avatar: notification.avatar || null,
              },
              ...state.notifications,
            ],
          };
        });
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      removeNotificationByRelatedId: (relatedId, type) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (n) => !(String(n.relatedId) === String(relatedId) && n.type === type)
          ),
        }));
      },

      markAllAsRead: async () => {
        try {
          await notificationService.markAllAsRead();
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          }));
        } catch (error) {
          console.error("Lỗi khi đánh dấu đã đọc tất cả:", error);
        }
      },

      clearAll: async () => {
        try {
          await notificationService.clearAll();
          set({ notifications: [] });
        } catch (error) {
          console.error("Lỗi khi xóa tất cả thông báo:", error);
        }
      },

      initSocket: () => {
        const store = get();

        // Tháo gỡ các listener cũ để tránh trùng lặp
        socket.off("friend_request", store.handleFriendRequest);
        socket.off("accept_friend", store.handleAcceptFriend);
        socket.off("reject_friend", store.handleRejectFriend);
        socket.off("cancel_friend", store.handleCancelFriend);
        socket.off("group_kick_notification", store.handleGroupKick);
        socket.off("unfriend_notification", store.handleUnfriend);

        // Khai báo lại các handler
        store.handleFriendRequest = (data) => {
          store.addNotification({
            id: `req-${Date.now()}`,
            type: "friend_request",
            content: data.message,
            relatedId: data.from?._id,
            avatar: data.from?.avatar
          });
          toast.info(data.message);
        };

        store.handleAcceptFriend = (data) => {
          store.addNotification({
            id: `acc-${Date.now()}`,
            type: "accept_friend",
            content: data.message,
            relatedId: data.from?._id,
            avatar: data.from?.avatar
          });
          toast.success(data.message);
        };

        store.handleRejectFriend = (data) => {
          store.addNotification({
            id: `rej-${Date.now()}`,
            type: "reject_friend",
            content: data.message,
            relatedId: data.from?._id,
            avatar: data.from?.avatar
          });
          toast.info(data.message);
        };

        store.handleCancelFriend = (data) => {
          store.removeNotificationByRelatedId(data.fromId, "friend_request");
        };

        store.handleGroupKick = (data) => {
          store.addNotification({
            id: `kick-${Date.now()}`,
            type: "kick",
            content: data.message,
            relatedId: data.conversationId
          });
          toast.error(data.message);
        };

        store.handleUnfriend = (data) => {
          store.addNotification({
            id: `unf-${Date.now()}`,
            type: "unfriend",
            content: data.message,
            relatedId: data.unfriendedBy
          });
          toast.info(data.message);
        };

        // Đăng ký listener mới
        socket.on("friend_request", store.handleFriendRequest);
        socket.on("accept_friend", store.handleAcceptFriend);
        socket.on("reject_friend", store.handleRejectFriend);
        socket.on("cancel_friend", store.handleCancelFriend);
        socket.on("group_kick_notification", store.handleGroupKick);
        socket.on("unfriend_notification", store.handleUnfriend);
      },
    }),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNotificationStore;
