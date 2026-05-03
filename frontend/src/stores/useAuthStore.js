import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
const useAuthStore = create(
    persist(
        (set,get) => ({
            user:null,
            token:null,
            role:null,
            isAuthenticated: false,

            setAuth: (userData, token) => {
                const displayName = userData.fullname; // hoặc full_name nếu có
                set({
                    user: { ...userData, displayName },
                    token,
                    role: userData.role, // dùng role từ backend
                    isAuthenticated: true,
                });
            },
                
        }),
        {
            name: 'auth-storage', // Tên key trong localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default useAuthStore;