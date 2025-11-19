import React, { useEffect, Suspense, lazy } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initSentry } from './config/sentry';
import { AuthCallback } from './components/AuthCallback';
import { useAppStore } from './store/useAppStore';
import { projectId } from './utils/supabase/info';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';

// Initialize Sentry for error tracking
initSentry();

// Import components directly (not lazy) to avoid module resolution issues
import { AuthFlowModern } from './components/AuthFlowModern';
import { ProfileSetup } from './components/ProfileSetup';
import { BetaAccessGate } from './components/BetaAccessGate';
import { Toaster } from './components/ui/sonner';

// Lazy load only optional components - use .then() for named exports
const MainApp = lazy(() => import('./components/MainApp').then(m => ({ default: m.MainApp || m.default })));
const BondPrintQuiz = lazy(() => import('./components/BondPrintQuiz').then(m => ({ default: m.BondPrintQuiz || m.default })));
const BondPrintResults = lazy(() => import('./components/BondPrintResults').then(m => ({ default: m.BondPrintResults || m.default })));

export default function App() {
  const {
    appState,
    userProfile,
    bondPrintData,
    appKey,
    setAppState,
    setUserProfile,
    setBondPrintData,
    checkSession,
    handleAuthSuccess,
    handleLogout,
  } = useAppStore();
  
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  // Debug: Log app state
  useEffect(() => {
    console.log('🔄 App State:', appState);
    console.log('👤 User Profile:', userProfile);
  }, [appState, userProfile]);

  // Check if we're on an OAuth callback page
  useEffect(() => {
    console.log('🚀 App mounted, checking session...');
    const path = window.location.pathname;
    if (path.includes('/auth/') && path.includes('/callback')) {
      // Don't check session, just show callback handler
      console.log('📍 On OAuth callback page');
      return;
    }
    console.log('✅ Calling checkSession()');
    checkSession();
  }, [checkSession]);

  const handleProfileComplete = async (profile: any) => {
    console.log('🎊 handleProfileComplete called in App.tsx');
    console.log('📦 Profile data received:', profile);
    
    setIsSavingProfile(true);
    
    try {
      // Get the access token from the store
      const accessToken = useAppStore.getState().accessToken;
      
      if (!accessToken) {
        console.error('❌ No access token available');
        setIsSavingProfile(false);
        throw new Error('Not authenticated');
      }

      console.log('📤 Saving profile to Supabase...');
      console.log('📦 Profile data:', {
        name: profile.profile?.fullName || profile.fullName || profile.name,
        school: profile.school?.name || profile.school,
        major: profile.profile?.major || profile.major,
        interests: profile.interests,
        personality: profile.personality,
      });
      
      // Save profile to database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            // Map onboarding data to profile schema
            name: profile.profile?.fullName || profile.fullName || profile.name,
            school: profile.school?.name || profile.school,
            age: profile.profile?.age || profile.age,
            major: profile.profile?.major || profile.major,
            year: profile.profile?.year || profile.year,
            bio: '', // Not collected in onboarding, user can add later
            interests: profile.interests || [],
            personality: profile.personality || [],
            lookingFor: profile.goals?.makeConnect || [], // What brings them here
            photos: profile.photos || [],
            profilePicture: profile.photos?.[0] || '',
            // Default living habits - user can update later in settings
            sleepSchedule: 'moderate',
            cleanliness: 'moderate',
            guests: 'sometimes',
            noise: 'moderate',
            goals: {
              academic: [], // Can be added later
              leisure: [], // Can be added later
              career: profile.goals?.careerGoal || undefined,
              personal: undefined,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Profile save failed:', errorData);
        
        // Handle content moderation errors specifically
        if (errorData.error?.includes('Content moderation') || errorData.error?.includes('Inappropriate')) {
          console.error('🚫 Content moderation details:', errorData);
          const flaggedWords = errorData.flaggedWords?.length 
            ? `\n\n⚠️ Flagged words: ${errorData.flaggedWords.join(', ')}` 
            : '';
          const reason = errorData.reason || 'Inappropriate content detected';
          
          alert(`Content Moderation Error:\n${reason}${flaggedWords}\n\n` +
                `Please review:\n` +
                `- Your name\n` +
                `- Major field\n` +
                `- Selected interests\n\n` +
                `And remove any inappropriate language.`);
          
          throw new Error(`${reason}${flaggedWords}`);
        }
        
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const savedProfile = await response.json();
      console.log('✅ Profile saved successfully:', savedProfile);
      
      // Update local state with the saved profile
      setUserProfile(savedProfile);
      
      // After profile setup, go to Bond Print quiz
      console.log('✅ Transitioning to bond-print-quiz state');
      setAppState('bond-print-quiz');
      console.log('✅ State transition complete, new state should be: bond-print-quiz');
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      alert(`Failed to save profile: ${error.message}. Please try again.`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Debug: Track appState changes
  React.useEffect(() => {
    console.log('🔄 App State Changed:', appState);
  }, [appState]);

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
    <QueryProvider>
      <ThemeProvider>
        <ErrorBoundary>
        <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)' }}>
          <Suspense fallback={<LoadingScreen />}>
            <BetaAccessGate key={appKey} onAccessGranted={() => console.log('Beta access granted')}>
              {appState === 'loading' && <LoadingScreen />}
              {appState === 'auth' && <AuthFlowModern onAuthSuccess={handleAuthSuccess} />}
              {appState === 'profile-setup' && (
                isSavingProfile ? (
                  <LoadingScreen />
                ) : (
                  <ProfileSetup onComplete={handleProfileComplete} />
                )
              )}
              {appState === 'bond-print-quiz' && userProfile && (
                <Suspense fallback={<LoadingScreen />}>
                  <BondPrintQuiz
                    userProfile={userProfile}
                    accessToken={useAppStore.getState().accessToken}
                    onComplete={handleBondPrintComplete}
                    onSkip={handleSkipBondPrint}
                  />
                </Suspense>
              )}
              {appState === 'bond-print-results' && bondPrintData && (
                <Suspense fallback={<LoadingScreen />}>
                  <BondPrintResults
                    bondPrint={bondPrintData}
                    onContinue={handleBondPrintResultsContinue}
                  />
                </Suspense>
              )}
              {appState === 'main' && userProfile && (
                <Suspense fallback={<LoadingScreen />}>
                  <MainApp />
                </Suspense>
              )}
            </BetaAccessGate>
          </Suspense>
          <Toaster />
        </div>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryProvider>
  );
}
