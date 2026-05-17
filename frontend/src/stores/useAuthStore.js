import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      updateUser: (partialUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : state.user,
        }));
      },

      setAuth: (userData, token) => {
        const displayName = userData.fullname;
        
        set({
          user: { ...userData, displayName },
          token,
          role: userData.role,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
