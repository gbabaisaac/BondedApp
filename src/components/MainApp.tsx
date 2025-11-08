import { useState } from 'react';
import { MobileLayout } from './MobileLayout';
import { InstagramGrid } from './InstagramGrid';
import { ChatView } from './ChatView';
import { MatchSuggestions } from './MatchSuggestions';
import { MyProfile } from './MyProfile';
import { ModeToggle } from './ModeToggle';
import { LoveMode } from './LoveMode';

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

  // Love Mode has its own full-screen view (no mode toggle inside)
  if (mode === 'love') {
    return (
      <LoveMode 
        userProfile={userProfile} 
        accessToken={accessToken}
        onExit={() => setMode('friend')}
      />
    );
  }

  // Friend Mode uses the standard layout
  return (
    <div
      className="fixed inset-0 flex flex-col bg-white"
      style={{
        height: '100vh',
        height: '100dvh',
        overflow: 'hidden'
      }}
    >
      <ModeToggle mode={mode} onChange={setMode} />
      <div className="flex-1 overflow-hidden">
        <MobileLayout activeTab={currentView} onTabChange={setCurrentView} accessToken={accessToken}>
          {currentView === 'discover' && (
            <InstagramGrid userProfile={userProfile} accessToken={accessToken} />
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
