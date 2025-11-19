/**
 * Global App Store using Zustand
 * Eliminates prop drilling by providing global state access
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { setSentryUser, clearSentryUser } from '../config/sentry';

export type AppState = 'loading' | 'auth' | 'profile-setup' | 'bond-print-quiz' | 'bond-print-results' | 'main';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  school: string;
  year?: string;
  major?: string;
  bio?: string;
  interests?: string[];
  livingHabits?: {
    sleepSchedule?: string;
    cleanliness?: string;
    guests?: string;
    noise?: string;
  };
  personality?: string[];
  religion?: string;
  profilePicture?: string;
  photos?: string[];
  socials?: {
    instagram?: string;
    twitter?: string;
    snapchat?: string;
  };
  lookingFor?: string[];
  bondPrint?: any;
  hasCompletedBondPrint?: boolean;
  goals?: {
    academic?: string[];
    leisure?: string[];
    career?: string;
    personal?: string;
  };
  additionalInfo?: string;
  [key: string]: any;
}

interface AppStore {
  // State
  appState: AppState;
  accessToken: string | null;
  userProfile: UserProfile | null;
  bondPrintData: any | null;
  appKey: number;
  isOnline: boolean;

  // Actions
  setAppState: (state: AppState) => void;
  setAccessToken: (token: string | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setBondPrintData: (data: any | null) => void;
  incrementAppKey: () => void;
  setIsOnline: (online: boolean) => void;

  // Async Actions
  checkSession: () => Promise<void>;
  loadUserProfile: (userId: string, isNewUser?: boolean) => Promise<void>;
  handleAuthSuccess: (token: string, userId: string, isNewUser?: boolean) => Promise<void>;
  handleLogout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const supabase = getSupabaseClient();

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      appState: 'loading',
      accessToken: null,
      userProfile: null,
      bondPrintData: null,
      appKey: 0,
      isOnline: navigator.onLine,

      // Basic setters
      setAppState: (state) => set({ appState: state }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setBondPrintData: (data) => set({ bondPrintData: data }),
      incrementAppKey: () => set((state) => ({ appKey: state.appKey + 1 })),
      setIsOnline: (online) => set({ isOnline: online }),

      // Check session and load user if authenticated
      checkSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session?.access_token) {
            set({ accessToken: session.access_token });
            setSentryUser(session.user.id, session.user.email);
            await get().loadUserProfile(session.user.id);
          } else {
            setTimeout(() => set({ appState: 'auth' }), 2000);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Session check error:', error);
          }
          setTimeout(() => set({ appState: 'auth' }), 2000);
        }
      },

      // Load user profile from backend
      loadUserProfile: async (userId: string, isNewUser = false) => {
        try {
          // If it's a new user from signup, skip profile load and go straight to setup
          if (isNewUser) {
            if (import.meta.env.DEV) {
              console.log('New user - going to profile setup');
            }
            set({ appState: 'profile-setup' });
            return;
          }
          
          if (import.meta.env.DEV) {
            console.log('Loading profile for user:', userId);
          }
          
          const accessToken = get().accessToken;
          if (!accessToken) {
            console.error('No access token available');
            set({ appState: 'profile-setup' });
            return;
          }
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile/${userId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const profile = await response.json();
            if (import.meta.env.DEV) {
              console.log('Profile loaded:', profile);
            }
            set({ userProfile: profile });
            
            // Check if user has completed Bond Print
            if (!profile.hasCompletedBondPrint) {
              set({ appState: 'bond-print-quiz' });
            } else {
              set({ appState: 'main' });
            }
          } else if (response.status === 404) {
            // Profile doesn't exist yet - go to setup
            if (import.meta.env.DEV) {
              console.log('Profile not found (404), going to profile setup');
            }
            set({ appState: 'profile-setup' });
          } else {
            // Other error - log and go to setup
            if (import.meta.env.DEV) {
              console.error('Profile load error:', response.status, response.statusText);
            }
            set({ appState: 'profile-setup' });
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error loading profile:', error);
          }
          set({ appState: 'profile-setup' });
        }
      },

      // Handle successful authentication
      handleAuthSuccess: async (token: string, userId: string, isNewUser = false) => {
        console.log('Auth success, loading profile for user:', userId, 'isNewUser:', isNewUser);
        set({ accessToken: token });
        await get().loadUserProfile(userId, isNewUser);
      },

      // Handle logout
      handleLogout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Logout error:', error);
          }

          // Clear all state
          set({
            accessToken: null,
            userProfile: null,
            bondPrintData: null,
            appState: 'loading',
          });

          // Clear Sentry user context
          clearSentryUser();

          // Clear localStorage
          localStorage.removeItem('betaAccess');
          localStorage.removeItem('betaEmail');
          
          // Increment app key to force remount
          get().incrementAppKey();
          
          // Small delay to ensure state updates, then check session
          setTimeout(() => {
            get().checkSession();
          }, 100);
        } catch (error) {
          console.error('Logout error:', error);
          // Even if there's an error, try to clear state
          set({
            accessToken: null,
            userProfile: null,
            bondPrintData: null,
            appState: 'loading',
          });
          localStorage.removeItem('betaAccess');
          localStorage.removeItem('betaEmail');
          get().incrementAppKey();
          setTimeout(() => {
            get().checkSession();
          }, 100);
        }
      },

      // Refresh user profile (useful after profile updates)
      refreshUserProfile: async () => {
        const { userProfile } = get();
        if (userProfile?.id) {
          await get().loadUserProfile(userProfile.id);
        }
      },
    }),
    {
      name: 'app-storage',
      // Only persist certain fields
      partialize: (state) => ({
        accessToken: state.accessToken,
        userProfile: state.userProfile,
        appState: state.appState,
      }),
    }
  )
);

// Initialize online/offline listeners
if (typeof window !== 'undefined') {
  const handleOnline = () => useAppStore.getState().setIsOnline(true);
  const handleOffline = () => useAppStore.getState().setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

// Selector hooks for better performance (only re-render when specific state changes)
export const useAppState = () => useAppStore((state) => state.appState);
export const useAccessToken = () => useAppStore((state) => state.accessToken);
export const useUserProfile = () => useAppStore((state) => state.userProfile);
export const useIsOnline = () => useAppStore((state) => state.isOnline);

