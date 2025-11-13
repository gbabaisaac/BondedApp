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
        className="fixed inset-0 flex flex-col bg-white"
          style={{
            height: '100dvh',
            overflow: 'hidden'
          }}
      >
      {/* Top Banner with Profile Picture */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#EAEAEA] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            // Profile is now accessed via top-left avatar, so just show profile view
            // Could navigate to profile if needed
          }}
          className="flex items-center gap-2 focus:outline-none"
        >
          <img
            {...getLazyImageProps(profilePicture, userProfile?.name || 'Profile')}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#2E7B91]"
          />
        </button>
        
        {/* Logo/Center */}
        <div className="flex items-center gap-2">
          <img 
            src="/Bonded_transparent_icon.png" 
            alt="bonded logo" 
            className="w-6 h-6"
          />
          <h1 className="text-xl text-[#1E4F74] lowercase font-bold tracking-wide">
            bonded
          </h1>
        </div>
        
        {/* Right side - Messages icon */}
        <button
          onClick={() => setCurrentView('messages')}
          className="flex items-center gap-2 focus:outline-none"
        >
          <MessageCircle className="w-6 h-6 text-[#1E4F74]" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <MobileLayout activeTab={currentView} onTabChange={setCurrentView} hideNavigation={isProfileDetailOpen}>
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
