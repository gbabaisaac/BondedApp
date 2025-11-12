import { ReactNode, useState, useEffect } from 'react';
import { Home, Users, MessageCircle, User } from 'lucide-react';
import { projectId } from '../utils/supabase/config';
import { POLL_INTERVALS } from '../config/app-config';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: 'discover' | 'matches' | 'messages' | 'profile';
  onTabChange: (tab: 'discover' | 'matches' | 'messages' | 'profile') => void;
  accessToken?: string;
  hideNavigation?: boolean; // Hide bottom nav when profile detail is open
  onUnreadCountChange?: (count: number) => void; // Callback to expose unread count
}

export function MobileLayout({ children, activeTab, onTabChange, accessToken, hideNavigation = false, onUnreadCountChange }: MobileLayoutProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (accessToken) {
      loadCounts();
      const interval = setInterval(loadCounts, POLL_INTERVALS.CHAT_COUNTS);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  // Expose unread count to parent via callback
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

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

      // Load unread messages - sum up unreadCount from all chats
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
        // Sum up unreadCount from all chats
        const totalUnread = chats.reduce((sum: number, chat: any) => {
          return sum + (chat.unreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      // Error loading counts - will retry on next interval
      if (error instanceof Error) {
        // Only log in development
        if (import.meta.env.DEV) {
          console.error('Error loading counts:', error);
        }
      }
    }
  };

  // Expose loadCounts so parent can trigger refresh
  useEffect(() => {
    // Store loadCounts in a ref or expose via window for ChatView to call
    (window as any).__refreshNavCounts = loadCounts;
    return () => {
      delete (window as any).__refreshNavCounts;
    };
  }, [accessToken]);

  const tabs = [
    { id: 'discover' as const, icon: Home, label: 'Discover', badge: 0 },
    { id: 'matches' as const, icon: Users, label: 'Connections', badge: pendingCount },
    { id: 'messages' as const, icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { id: 'profile' as const, icon: User, label: 'Profile', badge: 0 },
  ];

  return (
    <div
      className="h-full flex flex-col bg-white"
      style={{
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Main Content Area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))'
        }}
      >
        {children}
      </div>

      {/* Bottom Navigation - Hidden when profile detail is open */}
      {!hideNavigation && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <div className="flex items-center justify-around h-16 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                    isActive ? 'text-[#2E7B91]' : 'text-[#64748b]'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${isActive ? 'fill-[#2E7B91]' : ''}`} />
                    {tab.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
