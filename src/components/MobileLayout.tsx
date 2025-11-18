import { ReactNode, useState, useEffect } from 'react';
import { Home, Users, MessageSquare, Heart, Plus } from 'lucide-react';
import { projectId } from '../utils/supabase/config';
import { POLL_INTERVALS } from '../config/app-config';
import { useAccessToken } from '../store/useAppStore';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: 'discover' | 'matches' | 'messages' | 'forum' | 'scrapbook' | 'profile';
  onTabChange: (tab: 'discover' | 'matches' | 'messages' | 'forum' | 'scrapbook' | 'profile') => void;
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
    { id: 'discover' as const, emoji: '🏠', label: 'Yearbook', badge: 0 },
    { id: 'forum' as const, emoji: '💭', label: 'Forum', badge: 0 },
    { id: 'matches' as const, emoji: '👥', label: 'Friends', badge: pendingCount },
    { id: 'messages' as const, emoji: '💬', label: 'Messages', badge: unreadCount },
    { id: 'profile' as const, emoji: '👤', label: 'Profile', badge: 0 },
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
        data-content-area
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))', // Space for bottom nav
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {children}
      </div>

      {/* Bottom Navigation - Modern Light Design */}
              {!hideNavigation && (
                <div
                  className="fixed bottom-0 left-0 right-0 z-[9999]"
                  style={{
                    position: 'fixed',
                    zIndex: 9999,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderTop: '1px solid var(--color-border-light)',
                    height: 'var(--bottom-nav-height)',
                    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                >
          <div className="flex items-center justify-around px-2 py-3">
            {/* All tabs - no plus button in middle for 5 tabs */}
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative"
                >
                  {/* Icon Container */}
                  <div className="relative flex items-center justify-center">
                    <span 
                      className="text-2xl transition-all duration-300"
                      style={{ 
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        opacity: isActive ? 1 : 0.5
                      }}
                    >
                      {tab.emoji}
                    </span>
                    {tab.badge > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full min-w-[18px] h-4.5 px-1.5 flex items-center justify-center shadow-md"
                        style={{ background: 'var(--gradient-accent)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', boxShadow: 'var(--shadow-md)' }}
                      >
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  {/* Label */}
                  <span 
                    className="text-xs font-semibold transition-colors"
                    style={{ 
                      color: isActive ? '#FF6B6B' : '#6B6B6B',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '11px'
                    }}
                  >
                    {tab.label}
                  </span>
                  {/* Active Indicator */}
                  {isActive && (
                    <div 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
