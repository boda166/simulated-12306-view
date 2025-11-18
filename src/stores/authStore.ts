import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

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
      setUserProfile: (profile: any) => {
        // Note: isAdmin is now determined separately from user_roles table
        set({ userProfile: profile });
      },
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

          // Fetch user role from user_roles table
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (profile) {
            set({ 
              userProfile: profile,
              isAdmin: userRole?.role === 'admin'
            });
          }
        } catch (error) {
          logger.error('Error fetching user profile');
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
        
        try {
          // Get initial session first
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            logger.warn('Session error');
            // Clear any invalid session data
            await supabase.auth.signOut();
            set({ 
              session: null, 
              user: null, 
              isAuthenticated: false,
              isLoading: false,
              userProfile: null,
              isAdmin: false
            });
            return;
          }

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

          // Set up auth state listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event);
            
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              set({ 
                session, 
                user: session?.user || null, 
                isAuthenticated: !!session?.user,
                isLoading: false
              });
            } else {
              set({ 
                session, 
                user: session?.user || null, 
                isAuthenticated: !!session?.user,
                isLoading: false
              });
            }
            
            // Fetch user profile when session changes
            if (session?.user) {
              setTimeout(() => get().fetchUserProfile(), 0);
            } else {
              // Clear profile when user logs out
              set({ userProfile: null, isAdmin: false });
            }
          });
        } catch (error) {
          logger.error('Auth initialization error');
          set({ 
            session: null, 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            userProfile: null,
            isAdmin: false
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);