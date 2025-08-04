import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  setUserProfile: (profile: any) => void;
  clearAuth: () => void;
  fetchUserProfile: () => Promise<void>;
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
      userProfile: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,

      setUser: (user: User) => set({ user, isAuthenticated: !!user }),
      setSession: (session: Session | null) => {
        set({ 
          session, 
          user: session?.user || null, 
          isAuthenticated: !!session?.user 
        });
        
        // Fetch user profile when session changes
        if (session?.user) {
          setTimeout(() => get().fetchUserProfile(), 0);
        }
      },
      setUserProfile: (profile: any) => set({ 
        userProfile: profile, 
        isAdmin: profile?.role === 'admin' 
      }),
      clearAuth: () => set({ 
        user: null, 
        session: null, 
        userProfile: null, 
        isAuthenticated: false, 
        isAdmin: false 
      }),

      fetchUserProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            get().setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      },

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
          
          // Fetch user profile when session changes
          if (session?.user) {
            setTimeout(() => get().fetchUserProfile(), 0);
          } else {
            // Clear profile when user logs out
            set({ userProfile: null, isAdmin: false });
          }
        });

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        set({ 
          session, 
          user: session?.user || null, 
          isAuthenticated: !!session?.user,
          isLoading: false
        });
        
        // Fetch user profile for initial session
        if (session?.user) {
          await get().fetchUserProfile();
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);