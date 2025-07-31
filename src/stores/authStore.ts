import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  clearAuth: () => void;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user: User) => set({ user, isAuthenticated: !!user }),
      setSession: (session: Session | null) => set({ 
        session, 
        user: session?.user || null, 
        isAuthenticated: !!session?.user 
      }),
      clearAuth: () => set({ user: null, session: null, isAuthenticated: false }),

      signUp: async (email: string, password: string, fullName?: string) => {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: fullName ? { full_name: fullName } : undefined
          }
        });
        
        return { error };
      },

      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        return { error };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        get().clearAuth();
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        
        // Set up auth state listener
        supabase.auth.onAuthStateChange((event, session) => {
          set({ 
            session, 
            user: session?.user || null, 
            isAuthenticated: !!session?.user,
            isLoading: false
          });
        });

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        set({ 
          session, 
          user: session?.user || null, 
          isAuthenticated: !!session?.user,
          isLoading: false
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);