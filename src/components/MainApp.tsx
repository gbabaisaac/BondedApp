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
  const [showTopNav, setShowTopNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeen = localStorage.getItem('hasSeenAppTutorial');
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, []);

  // Handle scroll for top nav (YouTube-style) - works with content area
  useEffect(() => {
    const contentArea = document.querySelector('[data-content-area]');
    if (!contentArea) return;

    const handleScroll = () => {
      const currentScrollY = contentArea.scrollTop;
      if (currentScrollY < 10) {
        setShowTopNav(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowTopNav(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowTopNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    contentArea.addEventListener('scroll', handleScroll, { passive: true });
    return () => contentArea.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
      {/* Top Navigation - Hide/Show on Scroll (YouTube-style) */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-4 py-2.5 flex items-center justify-between safe-top transition-transform duration-300 ${
          showTopNav ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
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

      <div className="flex-1 overflow-hidden" style={{ paddingTop: showTopNav ? '3.5rem' : '0', transition: 'padding-top 0.3s' }}>
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
