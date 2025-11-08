import { useState, useEffect } from 'react';
import { LoveModeOnboarding } from './LoveModeOnboarding';
import { LoveModeHeader } from './LoveModeHeader';
import { LoveModeLayout } from './LoveModeLayout';
import { LoveModeRating } from './LoveModeRating';
import { LoveModeMatches } from './LoveModeMatches';
import { LoveModeChat } from './LoveModeChat';
import { LoveModeProfile } from './LoveModeProfile';
import { LovePrintQuiz } from './LovePrintQuiz';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

interface LoveModeProps {
  userProfile: any;
  accessToken: string;
  onExit: () => void;
}

type LoveModeTab = 'discover' | 'matches' | 'profile';
type LoveModeView = 'onboarding' | 'lovePrintQuiz' | 'rating' | 'matches' | 'chat' | 'profile';

export function LoveMode({ userProfile, accessToken, onExit }: LoveModeProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<LoveModeTab>('discover');
  const [currentView, setCurrentView] = useState<LoveModeView>('onboarding');
  const [activeRelationship, setActiveRelationship] = useState<any>(null);
  const [relationships, setRelationships] = useState<any[]>([]);

  useEffect(() => {
    checkLoveModeActivation();
  }, []);

  const checkLoveModeActivation = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/activation-status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsActivated(data.isActivated || false);
        
        if (data.isActivated) {
          setCurrentView('rating');
          loadRelationships();
        }
      } else {
        // If endpoint doesn't exist yet, default to onboarding
        setIsActivated(false);
      }
    } catch (error) {
      console.error('Check activation error:', error);
      // Default to onboarding on error
      setIsActivated(false);
    } finally {
      setLoading(false);
    }
  };

  const activateLoveMode = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/activate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setIsActivated(true);
        
        // Check if user has Love Print
        if (!userProfile.lovePrint) {
          setCurrentView('lovePrintQuiz');
        } else {
          setCurrentView('rating');
          setCurrentTab('discover');
        }
        
        toast.success('Welcome to Love Mode');
        loadRelationships();
      } else {
        throw new Error('Failed to activate');
      }
    } catch (error) {
      console.error('Activate Love Mode error:', error);
      toast.error('Failed to activate Love Mode');
    }
  };

  const handleLovePrintComplete = async (lovePrint: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/love-print`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ lovePrint }),
        }
      );

      if (response.ok) {
        toast.success('Love Print completed! You\'ll get better AI matches.');
        setCurrentView('rating');
        setCurrentTab('discover');
      }
    } catch (error) {
      console.error('Save Love Print error:', error);
      toast.error('Failed to save Love Print');
    }
  };

  const skipLovePrint = () => {
    setCurrentView('rating');
    setCurrentTab('discover');
  };

  const deactivateLoveMode = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/deactivate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Love Mode paused');
        onExit();
      }
    } catch (error) {
      console.error('Deactivate error:', error);
      toast.error('Failed to deactivate');
    }
  };

  const loadRelationships = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/relationships`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load relationships');

      const data = await response.json();
      setRelationships(data.relationships || []);
    } catch (error) {
      console.error('Load relationships error:', error);
    }
  };

  const handleTabChange = (tab: LoveModeTab) => {
    setCurrentTab(tab);
    
    switch (tab) {
      case 'discover':
        setCurrentView('rating');
        break;
      case 'matches':
        setCurrentView('matches');
        loadRelationships();
        break;
      case 'profile':
        setCurrentView('profile');
        break;
    }
  };

  const handleRatingComplete = () => {
    loadRelationships();
    setCurrentTab('matches');
    setCurrentView('matches');
  };

  const openChat = (relationship: any) => {
    setActiveRelationship(relationship);
    setCurrentView('chat');
  };

  const closeChat = () => {
    loadRelationships();
    setCurrentView('matches');
    setCurrentTab('matches');
  };

  // Show onboarding if not activated
  if (!isActivated && !loading) {
    return (
      <LoveModeOnboarding
        onActivate={activateLoveMode}
        onCancel={onExit}
      />
    );
  }

  // Show Love Print quiz after activation
  if (currentView === 'lovePrintQuiz') {
    return (
      <LovePrintQuiz
        onComplete={handleLovePrintComplete}
        onSkip={skipLovePrint}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Love Mode...</p>
        </div>
      </div>
    );
  }

  // Chat view (full screen, no navigation)
  if (currentView === 'chat' && activeRelationship) {
    return (
      <LoveModeChat
        relationship={activeRelationship}
        userProfile={userProfile}
        accessToken={accessToken}
        onBack={closeChat}
      />
    );
  }

  // Main Love Mode with navigation
  return (
    <div className="min-h-screen flex flex-col">
      <LoveModeHeader onBack={onExit} />
      <div className="flex-1 overflow-x-hidden">
        <LoveModeLayout activeTab={currentTab} onTabChange={handleTabChange}>
          {currentView === 'rating' && (
            <LoveModeRating
              userProfile={userProfile}
              accessToken={accessToken}
              onRatingComplete={handleRatingComplete}
            />
          )}

          {currentView === 'matches' && (
            <LoveModeMatches
              userProfile={userProfile}
              accessToken={accessToken}
              relationships={relationships}
              onOpenChat={openChat}
              onRefresh={loadRelationships}
              onStartRating={() => {
                setCurrentView('rating');
                setCurrentTab('discover');
              }}
            />
          )}

          {currentView === 'profile' && (
            <LoveModeProfile
              userProfile={userProfile}
              accessToken={accessToken}
              onDeactivate={deactivateLoveMode}
            />
          )}
        </LoveModeLayout>
      </div>
    </div>
  );
}
