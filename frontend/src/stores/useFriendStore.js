import user from '@/service/user';
import { create } from 'zustand';

const useFriendStore = create((set, get) => ({
  friends: [],
  totalFriends: 0,
  loading: false,
  hasMore: true,
  cursor: null,

  // Requests state
  sentRequests: [],
  receivedRequests: [],
  loadingRequests: false,

  // Users list state
  allUsers: [],
  loadingUsers: false,

  fetchFriends: async (reset = false) => {
    const { loading, hasMore, cursor, friends } = get();
    if (loading && !reset) return; // Allow reset even if loading

    set({ loading: true });

    try {
      const res = await user.getAllFriend({
        limit: 15,
        after: reset ? null : cursor,
      });

      const newItems = res.data.items || [];
      const nextCursor = res.data.nextCursor;
      const more = res.data.hasMore;
      const total = res.data.total || 0;

      set({
        friends: reset
          ? newItems
          : [...friends, ...newItems.filter((n) => !friends.some((f) => f._id === n._id))],
        cursor: nextCursor,
        hasMore: more,
        totalFriends: total,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching friends:', error);
      set({ loading: false });
    }
  },

  fetchRequests: async () => {
    set({ loadingRequests: true });
    try {
      const [receivedRes, sentRes] = await Promise.all([
        user.receivedRequest(),
        user.sentRequest()
      ]);
      set({
        receivedRequests: receivedRes.data || [],
        sentRequests: sentRes.data || [],
        loadingRequests: false
      });
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      set({ loadingRequests: false });
    }
  },

  fetchUsers: async () => {
    set({ loadingUsers: true });
    try {
      const res = await user.getAllUser();
      set({
        allUsers: res.data || [],
        loadingUsers: false
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ loadingUsers: false });
    }
  },

  unFriend: async (friendId) => {
    try {
      await user.unFriend(friendId);
      set((state) => ({
        friends: state.friends.filter((f) => f._id !== friendId),
        totalFriends: Math.max(0, state.totalFriends - 1)
      }));
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  },

  sendFriendRequest: async (idFriend) => {
    try {
      const response = await user.friendRequest(idFriend);
      const requestData = response.data; // This is now fully populated from backend!
      set((state) => ({
        sentRequests: [...state.sentRequests, requestData]
      }));
      return { success: true, data: requestData };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  },

  cancelFriendRequest: async (idRequest, idFriend) => {
    try {
      await user.cancelRequest(idRequest);
      set((state) => ({
        sentRequests: state.sentRequests.filter(
          (req) => req._id !== idRequest && req.to?._id !== idFriend
        )
      }));
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  },

  acceptFriendRequest: async (idRequest) => {
    try {
      await user.acceptRequest(idRequest);
      set((state) => {
        // Find friend details from request to add to friends list
        const request = state.receivedRequests.find(req => req._id === idRequest);
        const newFriend = request?.from;

        return {
          receivedRequests: state.receivedRequests.filter((req) => req._id !== idRequest),
          friends: newFriend && !state.friends.some(f => f._id === newFriend._id)
            ? [...state.friends, newFriend]
            : state.friends,
          totalFriends: state.totalFriends + 1
        };
      });
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  },

  declineFriendRequest: async (idRequest) => {
    try {
      await user.rejectRequest(idRequest);
      set((state) => ({
        receivedRequests: state.receivedRequests.filter((req) => req._id !== idRequest)
      }));
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  },

  initSocket: () => {
    const store = get();

    // Remove old listeners to avoid duplicate trigger
    socket.off("friend_request", store.handleReceiveFriendRequest);
    socket.off("cancel_friend", store.handleReceiveCancelRequest);
    socket.off("accept_friend", store.handleReceiveAcceptRequest);
    socket.off("reject_friend", store.handleReceiveRejectRequest);
    socket.off("unfriend_notification", store.handleReceiveUnfriend);

    // Define socket event handlers
    store.handleReceiveFriendRequest = (data) => {
      // Add new request to receivedRequests list in real-time
      if (data.request) {
        set((state) => {
          const exists = state.receivedRequests.some((r) => r._id === data.request._id);
          if (exists) return state;
          return {
            receivedRequests: [data.request, ...state.receivedRequests],
          };
        });
      }
    };

    store.handleReceiveCancelRequest = (data) => {
      // Remove request from receivedRequests list in real-time when sender cancels it
      set((state) => ({
        receivedRequests: state.receivedRequests.filter(
          (req) => req.from?._id !== data.fromId
        ),
      }));
    };

    store.handleReceiveAcceptRequest = (data) => {
      // Move request from sentRequests to friends list in real-time
      set((state) => {
        const acceptedReq = state.sentRequests.find((req) => req._id === data.requestId);
        // data.from has _id, fullname, avatar
        const newFriend = data.from;

        return {
          sentRequests: state.sentRequests.filter((req) => req._id !== data.requestId),
          friends: newFriend && !state.friends.some((f) => f._id === newFriend._id)
            ? [newFriend, ...state.friends]
            : state.friends,
          totalFriends: state.totalFriends + (newFriend && !state.friends.some((f) => f._id === newFriend._id) ? 1 : 0),
        };
      });
    };

    store.handleReceiveRejectRequest = (data) => {
      // Remove request from sentRequests list in real-time when recipient rejects it
      set((state) => ({
        sentRequests: state.sentRequests.filter((req) => req._id !== data.requestId),
      }));
    };

    store.handleReceiveUnfriend = (data) => {
      // Remove friend from friends list in real-time when unfriended
      set((state) => ({
        friends: state.friends.filter((f) => f._id !== data.unfriendedBy),
        totalFriends: Math.max(0, state.totalFriends - 1),
      }));
    };

    // Attach listeners
    socket.on("friend_request", store.handleReceiveFriendRequest);
    socket.on("cancel_friend", store.handleReceiveCancelRequest);
    socket.on("accept_friend", store.handleReceiveAcceptRequest);
    socket.on("reject_friend", store.handleReceiveRejectRequest);
    socket.on("unfriend_notification", store.handleReceiveUnfriend);
  },

  clearFriends: () => set({
    friends: [],
    totalFriends: 0,
    loading: false,
    hasMore: true,
    cursor: null,
    sentRequests: [],
    receivedRequests: [],
    loadingRequests: false,
    allUsers: [],
    loadingUsers: false,
  })
}));

import socket from "@/lib/socket";

export default useFriendStore;