import { useState, useEffect } from 'react';
import { MobileLayout } from './MobileLayout';
import { InstagramGrid } from './InstagramGrid';
import { ChatView } from './ChatView';
import { MatchSuggestions } from './MatchSuggestions';
import { MyProfile } from './MyProfile';
import { Scrapbook } from './Scrapbook';
import { AppTutorial } from './AppTutorial';
import { Forum } from './Forum';
import { getProfilePictureUrl, getLazyImageProps } from '../utils/image-optimization';
import { useAppStore } from '../store/useAppStore';
import { MessageCircle } from 'lucide-react';

type View = 'discover' | 'matches' | 'messages' | 'forum' | 'scrapbook';

export function MainApp() {
  const { userProfile, accessToken, handleLogout } = useAppStore();
  const [currentView, setCurrentView] = useState<View>('discover');
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeen = localStorage.getItem('hasSeenAppTutorial');
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, []);

  // Friend Mode uses the standard layout
  const profilePicture = getProfilePictureUrl(
    userProfile?.profilePicture || userProfile?.photos?.[0],
    'small'
  );
  
  return (
    <>
      {showTutorial && (
        <AppTutorial
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}
      <div
        className="fixed inset-0 flex flex-col bg-gradient-hero bg-pattern"
          style={{
            height: '100dvh',
            overflow: 'hidden'
          }}
      >
      {/* Top Banner with Profile Picture - Bonded Design */}
      <div className="sticky top-0 z-50 bg-midnight-indigo/95 backdrop-blur-lg border-b border-teal-blue/20 px-4 py-3 flex items-center justify-between safe-top">
        <button
          onClick={() => {
            // Profile is now accessed via top-left avatar, so just show profile view
            // Could navigate to profile if needed
          }}
          className="btn-icon"
        >
          <img
            {...getLazyImageProps(profilePicture, userProfile?.name || 'Profile')}
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-blue/50"
          />
        </button>
        
        {/* Logo/Center */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('discover')}>
          <img 
            src="/Bonded_transparent_icon.png" 
            alt="bonded logo" 
            className="w-6 h-6"
          />
          <h1 className="text-xl text-gradient lowercase font-bold tracking-brand">
            bonded
          </h1>
        </div>
        
        {/* Right side - Messages icon */}
        <button
          onClick={() => setCurrentView('messages')}
          className="btn-icon relative"
        >
          <MessageCircle className="w-6 h-6 text-soft-cream" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-peach-glow text-midnight-indigo text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <MobileLayout 
          activeTab={currentView} 
          onTabChange={setCurrentView} 
          hideNavigation={isProfileDetailOpen}
          onUnreadCountChange={setUnreadCount}
        >
          {currentView === 'discover' && (
            <InstagramGrid 
              onProfileDetailOpen={setIsProfileDetailOpen}
            />
          )}
          {currentView === 'matches' && (
            <MatchSuggestions />
          )}
          {currentView === 'messages' && (
            <ChatView />
          )}
          {currentView === 'forum' && (
            <Forum />
          )}
          {currentView === 'scrapbook' && (
            <Scrapbook
              onExit={() => setCurrentView('discover')}
            />
          )}
        </MobileLayout>
      </div>
    </div>
    </>
  );
}
