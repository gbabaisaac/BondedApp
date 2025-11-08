import { ReactNode, useState, useEffect } from 'react';
import { Home, Users, MessageCircle, User } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: 'discover' | 'matches' | 'messages' | 'profile';
  onTabChange: (tab: 'discover' | 'matches' | 'messages' | 'profile') => void;
  accessToken?: string;
}

export function MobileLayout({ children, activeTab, onTabChange, accessToken }: MobileLayoutProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (accessToken) {
      loadCounts();
      const interval = setInterval(loadCounts, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const loadCounts = async () => {
    if (!accessToken) return;

    try {
      // Load pending connection requests
      const pendingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intros/incoming`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (pendingResponse.ok) {
        const intros = await pendingResponse.json();
        const pending = intros.filter((i: any) => i.status === 'pending');
        setPendingCount(pending.length);
      }

      // Load unread messages (simplified - counts all chats for now)
      const chatsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chats`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (chatsResponse.ok) {
        const chats = await chatsResponse.json();
        // For now, show badge if there are any chats
        // In future, track actual unread status
        setUnreadCount(chats.length > 0 ? chats.length : 0);
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const tabs = [
    { id: 'discover' as const, icon: Home, label: 'Discover', badge: 0 },
    { id: 'matches' as const, icon: Users, label: 'Connections', badge: pendingCount },
    { id: 'messages' as const, icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { id: 'profile' as const, icon: User, label: 'Profile', badge: 0 },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-indigo-600' : ''}`} />
                  {tab.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
