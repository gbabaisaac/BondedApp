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

type View = 'discover' | 'matches' | 'messages' | 'forum' | 'scrapbook' | 'profile';

export function MainApp() {
  const { userProfile, accessToken, handleLogout } = useAppStore();
  const [currentView, setCurrentView] = useState<View>('discover');
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [shouldOpenComposer, setShouldOpenComposer] = useState(false);

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
        className="fixed inset-0 flex flex-col bg-black"
          style={{
            height: '100dvh',
            overflow: 'hidden'
          }}
      >
      {/* Top Navigation - Dark Mode */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-4 py-2.5 flex items-center justify-between safe-top">
        {/* Left: Profile Icon */}
        <button
          onClick={() => setCurrentView('profile')}
          className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
        >
          <img
            {...getLazyImageProps(profilePicture, userProfile?.name || 'Profile')}
            className="w-full h-full object-cover"
          />
        </button>
        
        {/* Center: School Name/Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('discover')}>
          {userProfile?.schoolLogo ? (
            <img 
              src={userProfile.schoolLogo} 
              alt="school logo" 
              className="w-5 h-5"
            />
          ) : (
            <img 
              src="/Bonded_transparent_icon.png" 
              alt="school logo" 
              className="w-5 h-5"
            />
          )}
          <h1 className="text-base text-soft-cream font-medium tracking-tight max-w-[120px] truncate">
            {userProfile?.school ? (() => {
              const schoolName = userProfile.school;
              // Abbreviate if longer than 15 characters
              if (schoolName.length > 15) {
                // Try to abbreviate intelligently (e.g., "University of California" -> "UC")
                const words = schoolName.split(' ');
                if (words.length > 2) {
                  return words.map(w => w[0]).join('').toUpperCase();
                }
                return schoolName.substring(0, 12) + '...';
              }
              return schoolName;
            })() : 'Bonded'}
          </h1>
        </div>
        
        {/* Right: Messages */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('messages')}
            className="w-9 h-9 flex items-center justify-center text-soft-cream/80 hover:text-soft-cream transition-colors relative"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-peach-glow rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MobileLayout 
          activeTab={currentView} 
          onTabChange={setCurrentView} 
          hideNavigation={isProfileDetailOpen || isPostComposerOpen}
          onUnreadCountChange={setUnreadCount}
          onPostComposerOpen={() => {
            if (currentView === 'forum') {
              setIsPostComposerOpen(true);
            } else {
              setCurrentView('forum');
              setShouldOpenComposer(true);
            }
          }}
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
            <Forum 
              onPostComposerChange={(isOpen) => {
                setIsPostComposerOpen(isOpen);
                if (!isOpen) {
                  setShouldOpenComposer(false);
                }
              }}
              openComposer={shouldOpenComposer}
              onComposerOpened={() => setShouldOpenComposer(false)}
            />
          )}
          {currentView === 'scrapbook' && (
            <Scrapbook
              onExit={() => setCurrentView('discover')}
            />
          )}
          {currentView === 'profile' && (
            <MyProfile />
          )}
        </MobileLayout>
      </div>
    </div>
    </>
  );
}
