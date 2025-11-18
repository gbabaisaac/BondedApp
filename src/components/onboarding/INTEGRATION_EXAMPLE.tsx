/**
 * INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the new modern onboarding flow
 * into your existing app structure.
 */

import React, { useState } from 'react';
import { OnboardingFlowModern } from './OnboardingFlowModern';

// ============================================================================
// EXAMPLE 1: Basic Integration
// ============================================================================

export function BasicOnboardingExample() {
  const handleComplete = (profile: any) => {
    console.log('Onboarding completed with profile:', profile);
    // Navigate to main app or save profile
  };

  return (
    <OnboardingFlowModern 
      userName="Jane Doe"
      onComplete={handleComplete}
    />
  );
}

// ============================================================================
// EXAMPLE 2: With Loading State
// ============================================================================

export function OnboardingWithLoading() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (profile: any) => {
    setIsSubmitting(true);
    
    try {
      // Save to API
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) throw new Error('Failed to save profile');
      
      const data = await response.json();
      console.log('Profile saved:', data);
      
      // Navigate to main app
      window.location.href = '/app';
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return <OnboardingFlowModern onComplete={handleComplete} />;
}

// ============================================================================
// EXAMPLE 3: A/B Test Between Old and New Onboarding
// ============================================================================

import { OnboardingWizard } from '../OnboardingWizard'; // Your existing onboarding

export function OnboardingABTest({ userId }: { userId: string }) {
  // Simple A/B test logic (replace with your feature flag service)
  const useModernOnboarding = parseInt(userId, 36) % 2 === 0;

  const handleComplete = (profile: any) => {
    // Track which variant completed
    console.log('Completed:', useModernOnboarding ? 'modern' : 'legacy');
    
    // Your completion logic here
  };

  if (useModernOnboarding) {
    return <OnboardingFlowModern onComplete={handleComplete} />;
  }

  return (
    <OnboardingWizard
      userEmail="user@example.com"
      userName="User"
      userSchool="University"
      onComplete={handleComplete}
    />
  );
}

// ============================================================================
// EXAMPLE 4: With Analytics Tracking
// ============================================================================

export function OnboardingWithAnalytics() {
  const handleComplete = (profile: any) => {
    // Track completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_complete', {
        event_category: 'engagement',
        event_label: 'modern_onboarding',
        value: 1,
      });
    }

    console.log('Profile completed:', profile);
  };

  // Track onboarding start
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_start', {
        event_category: 'engagement',
        event_label: 'modern_onboarding',
      });
    }
  }, []);

  return <OnboardingFlowModern onComplete={handleComplete} />;
}

// ============================================================================
// EXAMPLE 5: With Supabase Integration
// ============================================================================

import { useAccessToken } from '../../store/useAppStore';

export function OnboardingWithSupabase() {
  const accessToken = useAccessToken();

  const handleComplete = async (profile: any) => {
    try {
      const response = await fetch(
        `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profile),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const data = await response.json();
      console.log('Profile created:', data);
      
      // Navigate to main app
      window.location.href = '/app';
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return <OnboardingFlowModern onComplete={handleComplete} />;
}

// ============================================================================
// EXAMPLE 6: Standalone Demo Page
// ============================================================================

export function OnboardingDemoPage() {
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const handleComplete = (completedProfile: any) => {
    setProfile(completedProfile);
    setCompleted(true);
  };

  const handleReset = () => {
    setCompleted(false);
    setProfile(null);
    // Reset Zustand store
    localStorage.removeItem('bonded-onboarding');
    window.location.reload();
  };

  if (completed) {
    return (
      <div style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'var(--font-body)',
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          marginBottom: 'var(--space-6)',
        }}>
          Profile Completed! 🎉
        </h1>
        
        <pre style={{
          background: 'var(--bg-secondary)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'auto',
          fontSize: 'var(--text-sm)',
        }}>
          {JSON.stringify(profile, null, 2)}
        </pre>

        <button
          onClick={handleReset}
          style={{
            marginTop: 'var(--space-6)',
            padding: '16px 32px',
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-semibold)',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return <OnboardingFlowModern onComplete={handleComplete} />;
}

// ============================================================================
// USAGE IN YOUR APP
// ============================================================================

/**
 * In your App.tsx or AuthFlow.tsx:
 * 
 * import { OnboardingWithSupabase } from './components/onboarding/INTEGRATION_EXAMPLE';
 * 
 * function App() {
 *   const [needsOnboarding, setNeedsOnboarding] = useState(true);
 * 
 *   if (needsOnboarding) {
 *     return <OnboardingWithSupabase />;
 *   }
 * 
 *   return <MainApp />;
 * }
 */


