import { ReactNode, useState, useEffect } from 'react';
import { Home, Users, MessageSquare, Heart, Plus } from 'lucide-react';
import { projectId } from '../utils/supabase/config';
import { POLL_INTERVALS } from '../config/app-config';
import { useAccessToken } from '../store/useAppStore';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: 'discover' | 'matches' | 'messages' | 'forum' | 'scrapbook';
  onTabChange: (tab: 'discover' | 'matches' | 'messages' | 'forum' | 'scrapbook') => void;
  hideNavigation?: boolean; // Hide bottom nav when profile detail is open
  onUnreadCountChange?: (count: number) => void; // Callback to expose unread count
  onPostComposerOpen?: () => void; // Callback to open post composer
}

export function MobileLayout({ children, activeTab, onTabChange, hideNavigation = false, onUnreadCountChange, onPostComposerOpen }: MobileLayoutProps) {
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
    { id: 'forum' as const, icon: MessageSquare, label: 'The Quad', badge: 0 },
    { id: 'scrapbook' as const, icon: Heart, label: 'Scrapbook', badge: 0 },
  ];

  return (
    <div
      className="h-full flex flex-col"
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
          paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))', // Space for bottom nav
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {children}
      </div>

      {/* Bottom Navigation - Regular Bar Style (Instagram-like) */}
      {!hideNavigation && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="flex items-center justify-between px-2 py-2">
            {/* First two tabs */}
            {tabs.slice(0, 2).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex-1 flex flex-col items-center justify-center min-w-0 transition-all duration-300 relative"
                >
                  {/* Active Tab Indicator */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-blue rounded-full" />
                  )}
                  
                  {/* Icon Container */}
                  <div className="relative flex items-center justify-center mb-1">
                    <Icon 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive 
                          ? 'fill-teal-blue text-teal-blue scale-110' 
                          : 'text-soft-cream/60'
                      }`} 
                    />
                    {tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-peach-glow text-midnight-indigo text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-md">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={`text-[11px] font-medium transition-all duration-300 leading-tight text-center truncate w-full px-0.5 ${
                      isActive 
                        ? 'text-teal-blue' 
                        : 'text-soft-cream/60'
                    }`}
                    style={{
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Plus Button in Middle */}
            <button
              onClick={() => {
                if (onPostComposerOpen) {
                  onPostComposerOpen();
                }
              }}
              className="w-12 h-12 bg-gradient-to-r from-teal-blue to-ocean-blue rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform mx-2"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>

            {/* Last two tabs */}
            {tabs.slice(2).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex-1 flex flex-col items-center justify-center min-w-0 transition-all duration-300 relative"
                >
                  {/* Active Tab Indicator */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-blue rounded-full" />
                  )}
                  
                  {/* Icon Container */}
                  <div className="relative flex items-center justify-center mb-1">
                    <Icon 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive 
                          ? 'fill-teal-blue text-teal-blue scale-110' 
                          : 'text-soft-cream/60'
                      }`} 
                    />
                    {tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-peach-glow text-midnight-indigo text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-md">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={`text-[11px] font-medium transition-all duration-300 leading-tight text-center truncate w-full px-0.5 ${
                      isActive 
                        ? 'text-teal-blue' 
                        : 'text-soft-cream/60'
                    }`}
                    style={{
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
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
