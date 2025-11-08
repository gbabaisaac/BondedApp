import { useState, useEffect, Suspense, lazy } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { getSupabaseClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Lazy load heavy components
const AuthFlow = lazy(() => import('./components/AuthFlow').then(module => ({ default: module.AuthFlow })));
const ProfileSetup = lazy(() => import('./components/ProfileSetup').then(module => ({ default: module.ProfileSetup })));
const MainApp = lazy(() => import('./components/MainApp').then(module => ({ default: module.MainApp })));
const BondPrintQuiz = lazy(() => import('./components/BondPrintQuiz').then(module => ({ default: module.BondPrintQuiz })));
const BondPrintResults = lazy(() => import('./components/BondPrintResults').then(module => ({ default: module.BondPrintResults })));
const BetaAccessGate = lazy(() => import('./components/BetaAccessGate').then(module => ({ default: module.BetaAccessGate })));
const Toaster = lazy(() => import('./components/ui/sonner').then(module => ({ default: module.Toaster })));

const supabase = getSupabaseClient();

type AppState = 'loading' | 'auth' | 'profile-setup' | 'love-print-quiz' | 'love-print-results' | 'main';

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

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        await loadUserProfile(session.user.id);
      } else {
        setTimeout(() => setAppState('auth'), 2000);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setTimeout(() => setAppState('auth'), 2000);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const profile = await response.json();
        console.log('Profile loaded:', profile);
        setUserProfile(profile);
        
        // Check if user has completed Bond Print
        if (!profile.hasCompletedBondPrint) {
          setAppState('bond-print-quiz');
        } else {
          setAppState('main');
        }
      } else {
        console.log('Profile not found, going to profile setup');
        setAppState('profile-setup');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
    await supabase.auth.signOut();
    setAccessToken(null);
    setUserProfile(null);
    setAppState('auth');
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <BetaAccessGate onAccessGranted={() => console.log('Beta access granted')}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
        </div>
      </BetaAccessGate>
    </Suspense>
  );
}
