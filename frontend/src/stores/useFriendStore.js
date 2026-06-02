import user from '@/service/user';
import { create } from 'zustand';


const useFriendStore = create((set, get) => ({
  friends: [],
  totalFriends: 0,
  loading: false,
  hasMore: true,
  cursor: null,

  // Hàm fetch danh sách
  fetchFriends: async (reset = false) => {
    const { loading, hasMore, cursor, friends } = get();
    if (loading || (!hasMore && !reset)) return;

    set({ loading: true });

    try {
      const res = await user.getAllFriend({
        limit: 7,
        after: reset ? null : cursor,
      });

      const newItems = res.data.items;
      const nextCursor = res.data.nextCursor;
      const more = res.data.hasMore;
      const total = res.data.total || 0;

      set({
        friends: reset ? newItems : [...friends, ...newItems.filter(n => !friends.some(f => f._id === n._id))],
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

  // Hàm xóa bạn bè (Cập nhật UI ngay lập tức)
  unFriend: async (friendId) => {
    try {
      await user.unFriend(friendId);
      set((state) => ({
        friends: state.friends.filter(f => f._id !== friendId),
        totalFriends: state.totalFriends - 1
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}));

export default useFriendStore;