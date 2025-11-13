import { useEffect, Suspense, lazy } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initSentry } from './config/sentry';
import { AuthCallback } from './components/AuthCallback';
import { useAppStore } from './store/useAppStore';

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

  // Check if we're on an OAuth callback page
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/auth/') && path.includes('/callback')) {
      // Don't check session, just show callback handler
      return;
    }
    checkSession();
  }, [checkSession]);

  const handleProfileComplete = (profile: any) => {
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
          <div className="min-h-screen bg-black overflow-x-hidden">
          {appState === 'loading' && <LoadingScreen />}
          <Suspense fallback={<LoadingScreen />}>
            {appState === 'auth' && <AuthFlow onAuthSuccess={handleAuthSuccess} />}
              {appState === 'profile-setup' && (
                <ProfileSetup
                  onComplete={handleProfileComplete}
                />
              )}
              {appState === 'bond-print-quiz' && userProfile && (
                <BondPrintQuiz
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
                <MainApp />
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
