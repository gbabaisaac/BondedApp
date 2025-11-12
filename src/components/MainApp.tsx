import { useState } from 'react';
import { MobileLayout } from './MobileLayout';
import { InstagramGrid } from './InstagramGrid';
import { ChatView } from './ChatView';
import { MatchSuggestions } from './MatchSuggestions';
import { MyProfile } from './MyProfile';
import { ModeToggle } from './ModeToggle';
import { LoveModeNew } from './LoveModeNew';
import { isFeatureEnabled } from '../config/features';
import { getProfilePictureUrl, getLazyImageProps } from '../utils/image-optimization';

interface MainAppProps {
  userProfile: any;
  accessToken: string;
  onLogout: () => void;
}

type View = 'discover' | 'matches' | 'messages' | 'profile';
type AppMode = 'friend' | 'love';

export function MainApp({ userProfile, accessToken, onLogout }: MainAppProps) {
  const [currentView, setCurrentView] = useState<View>('discover');
  const [mode, setMode] = useState<AppMode>('friend');
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const loveModeEnabled = isFeatureEnabled('LOVE_MODE_ENABLED');

  // Love Mode has its own full-screen view (no mode toggle inside)
  // Only show if feature is enabled
  if (loveModeEnabled && mode === 'love') {
    return (
      <LoveModeNew
        userProfile={userProfile}
        accessToken={accessToken}
        onExit={() => setMode('friend')}
      />
    );
  }

  // Friend Mode uses the standard layout
  const profilePicture = getProfilePictureUrl(
    userProfile?.profilePicture || userProfile?.photos?.[0],
    'small'
  );
  
  return (
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
          onClick={() => setCurrentView('profile')}
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
        
        {/* Right side - placeholder for future features */}
        <div className="w-10 h-10"></div>
      </div>

      {/* Only show mode toggle if Love Mode is enabled */}
      {loveModeEnabled && <ModeToggle mode={mode} onChange={setMode} />}
      <div className="flex-1 overflow-hidden">
        <MobileLayout activeTab={currentView} onTabChange={setCurrentView} accessToken={accessToken} hideNavigation={isProfileDetailOpen}>
          {currentView === 'discover' && (
            <InstagramGrid 
              userProfile={userProfile} 
              accessToken={accessToken}
              onProfileDetailOpen={setIsProfileDetailOpen}
            />
          )}
          {currentView === 'matches' && (
            <MatchSuggestions userProfile={userProfile} accessToken={accessToken} />
          )}
          {currentView === 'messages' && (
            <ChatView userProfile={userProfile} accessToken={accessToken} />
          )}
          {currentView === 'profile' && (
            <MyProfile userProfile={userProfile} accessToken={accessToken} onLogout={onLogout} />
          )}
        </MobileLayout>
      </div>
    </div>
  );
}
