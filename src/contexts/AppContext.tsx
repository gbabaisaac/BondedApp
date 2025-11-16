/**
 * Application Context for state management
 * Reduces props drilling by providing global state
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  school: string;
  [key: string]: any;
}

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline events
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        accessToken,
        setAccessToken,
        isOnline,
        setIsOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}



