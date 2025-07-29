import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, authAPI, getAuthToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      initializeAuth: async () => {
        const token = getAuthToken();
        if (token) {
          try {
            const user = await authAPI.getCurrentUser();
            set({ user, isAuthenticated: true });
          } catch (error) {
            console.warn('Failed to get current user:', error);
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);