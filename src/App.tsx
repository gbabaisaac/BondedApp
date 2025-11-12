import { useState, useEffect, Suspense, lazy } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getSupabaseClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { initSentry, setSentryUser, clearSentryUser } from './config/sentry';
import { AuthCallback } from './components/AuthCallback';

// Initialize Sentry for error tracking
initSentry();

// Lazy load heavy components
const AuthFlow = lazy(() => import('./components/AuthFlow').then(module => ({ default: module.AuthFlow })));
const ProfileSetup = lazy(() => import('./components/ProfileSetup').then(module => ({ default: module.ProfileSetup })));
const MainApp = lazy(() => import('./components/MainApp').then(module => ({ default: module.MainApp })));
const BondPrintQuiz = lazy(() => import('./components/BondPrintQuiz').then(module => ({ default: module.BondPrintQuiz })));
const BondPrintResults = lazy(() => import('./components/BondPrintResults').then(module => ({ default: module.BondPrintResults })));
const BetaAccessGate = lazy(() => import('./components/BetaAccessGate').then(module => ({ default: module.BetaAccessGate })));
const Toaster = lazy(() => import('./components/ui/sonner').then(module => ({ default: module.Toaster })));
const OfflineIndicator = lazy(() => import('./components/OfflineIndicator').then(module => ({ default: module.OfflineIndicator })));
const InstallAppPrompt = lazy(() => import('./components/InstallAppPrompt').then(module => ({ default: module.InstallAppPrompt })));

const supabase = getSupabaseClient();

type AppState = 'loading' | 'auth' | 'profile-setup' | 'bond-print-quiz' | 'bond-print-results' | 'main';

interface UserProfile {
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
  lookingFor?: string[]; // ['roommate', 'friends', 'community']
  bondPrint?: any;
  hasCompletedBondPrint?: boolean;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bondPrintData, setBondPrintData] = useState<any>(null);
  const [appKey, setAppKey] = useState(0); // Key to force remount on logout

  // Check if we're on an OAuth callback page
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/auth/') && path.includes('/callback')) {
      // Don't check session, just show callback handler
      return;
    }
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        // Set user context in Sentry for error tracking
        setSentryUser(session.user.id, session.user.email);
        await loadUserProfile(session.user.id);
      } else {
        setTimeout(() => setAppState('auth'), 2000);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Session check error:', error);
      }
      setTimeout(() => setAppState('auth'), 2000);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Loading profile for user:', userId);
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const profile = await response.json();
        if (import.meta.env.DEV) {
          console.log('Profile loaded:', profile);
        }
        setUserProfile(profile);
        
        // Check if user has completed Bond Print
        if (!profile.hasCompletedBondPrint) {
          setAppState('bond-print-quiz');
        } else {
          setAppState('main');
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('Profile not found, going to profile setup');
        }
        setAppState('profile-setup');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading profile:', error);
      }
      setAppState('profile-setup');
    }
  };

  const handleAuthSuccess = async (token: string, userId: string) => {
    console.log('Auth success, loading profile for user:', userId);
    setAccessToken(token);
    await loadUserProfile(userId);
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    // After profile setup, go to Bond Print quiz
    setAppState('bond-print-quiz');
  };

  const handleBondPrintComplete = (bondPrint: any) => {
    setBondPrintData(bondPrint);
    setAppState('bond-print-results');
  };

  const handleBondPrintResultsContinue = () => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        bondPrint: bondPrintData,
        hasCompletedBondPrint: true,
      });
    }
    setAppState('main');
  };

  const handleSkipBondPrint = () => {
    setAppState('main');
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // Continue with logout even if there's an error
      }

      // Clear all state
      setAccessToken(null);
      setUserProfile(null);
      setBondPrintData(null);

      // Clear Sentry user context
      clearSentryUser();

      // Clear localStorage (beta access, etc.)
      localStorage.removeItem('betaAccess');
      localStorage.removeItem('betaEmail');
      
      // Force remount of BetaAccessGate by changing key
      setAppKey(prev => prev + 1);
      
      // Reset app state to loading, which will then check session and go to auth
      setAppState('loading');
      
      // Small delay to ensure state updates, then check session
      setTimeout(() => {
        checkSession();
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to clear state
      setAccessToken(null);
      setUserProfile(null);
      setBondPrintData(null);
      localStorage.removeItem('betaAccess');
      localStorage.removeItem('betaEmail');
      setAppKey(prev => prev + 1);
      setAppState('loading');
      setTimeout(() => {
        checkSession();
      }, 100);
    }
  };

  // Check if we're on an OAuth callback route
  const path = window.location.pathname;
  if (path.includes('/auth/') && path.includes('/callback')) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <AuthCallback />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <BetaAccessGate key={appKey} onAccessGranted={() => console.log('Beta access granted')}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-x-hidden">
          {appState === 'loading' && <LoadingScreen />}
          <Suspense fallback={<LoadingScreen />}>
            {appState === 'auth' && <AuthFlow onAuthSuccess={handleAuthSuccess} />}
              {appState === 'profile-setup' && (
                <ProfileSetup
                  accessToken={accessToken!}
                  onComplete={handleProfileComplete}
                />
              )}
              {appState === 'bond-print-quiz' && userProfile && (
                <BondPrintQuiz
                  userProfile={userProfile}
                  accessToken={accessToken!}
                  onComplete={handleBondPrintComplete}
                  onSkip={handleSkipBondPrint}
                />
              )}
              {appState === 'bond-print-results' && bondPrintData && (
                <BondPrintResults
                  bondPrint={bondPrintData}
                  onContinue={handleBondPrintResultsContinue}
                />
              )}
              {appState === 'main' && userProfile && (
                <MainApp
                  userProfile={userProfile}
                  accessToken={accessToken!}
                  onLogout={handleLogout}
                />
              )}
          </Suspense>
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
          <Suspense fallback={null}>
            <OfflineIndicator />
          </Suspense>
          <InstallAppPrompt />
        </div>
      </BetaAccessGate>
    </Suspense>
    </ErrorBoundary>
  );
}
