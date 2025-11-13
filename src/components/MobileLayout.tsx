import { ReactNode, useState, useEffect } from 'react';
import { Home, Users, MessageCircle, MessageSquare } from 'lucide-react';
import { projectId } from '../utils/supabase/config';
import { POLL_INTERVALS } from '../config/app-config';
import { useAccessToken } from '../store/useAppStore';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: 'discover' | 'matches' | 'messages' | 'forum';
  onTabChange: (tab: 'discover' | 'matches' | 'messages' | 'forum') => void;
  hideNavigation?: boolean; // Hide bottom nav when profile detail is open
  onUnreadCountChange?: (count: number) => void; // Callback to expose unread count
}

export function MobileLayout({ children, activeTab, onTabChange, hideNavigation = false, onUnreadCountChange }: MobileLayoutProps) {
  const accessToken = useAccessToken();
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
    { id: 'discover' as const, icon: Home, label: 'Yearbook', badge: 0 },
    { id: 'matches' as const, icon: Users, label: 'Friends', badge: pendingCount },
    { id: 'messages' as const, icon: MessageCircle, label: 'Quad', badge: unreadCount },
    { id: 'forum' as const, icon: MessageSquare, label: 'Scrapbook', badge: 0 },
  ];

  return (
    <div
      className="h-full flex flex-col bg-transparent"
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

      {/* Bottom Navigation - Dark translucent style */}
      {!hideNavigation && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 z-50"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <div className="flex items-center justify-around h-20 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Map tab IDs to icon colors based on image
              const getIconColor = () => {
                if (isActive) {
                  if (tab.id === 'discover') return 'text-[#2E7B91]'; // Teal for Yearbook
                  if (tab.id === 'matches') return 'text-purple-400'; // Purple for Friends
                  if (tab.id === 'messages') return 'text-gray-300'; // Gray for Quad
                  if (tab.id === 'forum') return 'text-pink-400'; // Pink for Scrapbook
                }
                return 'text-gray-400';
              };
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex flex-col items-center justify-center flex-1 h-full transition-all relative group"
                >
                  <div className={`relative p-2 rounded-xl transition-all ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''} ${getIconColor()}`} />
                    {tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-black/20">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
