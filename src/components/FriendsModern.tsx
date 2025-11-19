import { useState, useEffect } from 'react';
import { Users, Check, X, Heart, Loader2 } from 'lucide-react';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { getFriends, getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../utils/api-client';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { FriendshipsResponse } from '../types/api';

interface Friend {
  id: string;
  name: string;
  avatar_url: string;
  major: string;
  mutualFriends: number;
  compatibility?: number;
  requestId?: string;
}

// Mock data
const mockFriends: Friend[] = Array.from({ length: 12 }, (_, i) => ({
  id: `friend-${i}`,
  name: `Friend ${i + 1}`,
  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=friend${i}`,
  major: 'Computer Science',
  mutualFriends: Math.floor(Math.random() * 20),
  compatibility: Math.random() > 0.5 ? Math.floor(Math.random() * 30 + 70) : undefined,
}));

const mockRequests: Friend[] = Array.from({ length: 3 }, (_, i) => ({
  id: `request-${i}`,
  name: `User ${i + 1}`,
  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=request${i}`,
  major: 'Engineering',
  mutualFriends: Math.floor(Math.random() * 10),
}));

interface FriendsModernProps {
  onNavigateToProfile?: () => void;
}

export function FriendsModern({ onNavigateToProfile }: FriendsModernProps = {}) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('requests');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [accessToken, activeTab]);

  const loadData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (activeTab === 'friends') {
        const data = await getFriends(accessToken) as unknown as FriendshipsResponse;
        // Backend returns { friendships: [...] } with friend property
        const friendships = (data as FriendshipsResponse).friendships || [];
        const transformedFriends = friendships
          .filter((f) => (f as any).friend_id && (f as any).friend) // Only include valid friendships with friend data
          .map((f) => {
            const friendData = (f as any).friend || {};
            return {
              id: friendData.id || (f as any).friend_id,
              name: friendData.name || 'Unknown',
              avatar_url: friendData.profilePicture || friendData.photos?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendData.id || (f as any).friend_id}`,
              major: friendData.major || 'Student',
              mutualFriends: 0, // TODO: Calculate mutual friends
              compatibility: friendData.bondPrint ? Math.floor(Math.random() * 30 + 70) : undefined,
            };
          });
        setFriends(transformedFriends);
      } else {
        const data = await getFriendRequests(accessToken) as unknown as FriendshipsResponse;
        // Backend returns { friendships: [...] } with status=pending
        const friendships = (data as FriendshipsResponse).friendships || [];
        const transformedRequests = friendships
          .filter((r) => (r as any).friend_id && (r as any).friend) // Only include valid requests with friend data
          .map((r) => {
            const friendData = (r as any).friend || {};
            return {
              id: friendData.id || (r as any).friend_id,
              requestId: r.id, // Friendship ID for accept/reject
              name: friendData.name || 'Unknown',
              avatar_url: friendData.profilePicture || friendData.photos?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendData.id || (r as any).friend_id}`,
              major: friendData.major || 'Student',
              mutualFriends: 0, // TODO: Calculate mutual friends
            };
          });
        setRequests(transformedRequests);
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to load data:', err);
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request || !accessToken) return;

    try {
      setActionLoading(id);
      await acceptFriendRequest(request.requestId || id, accessToken);
      toast.success(`You're now friends with ${request.name}!`);
      
      // Remove from requests and add to friends
      setRequests(requests.filter(r => r.id !== id));
      setFriends([...friends, request]);
      
      // Reload to get fresh data
      await loadData();
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to accept request:', err);
      toast.error(err.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request || !accessToken) return;

    try {
      setActionLoading(id);
      await rejectFriendRequest(request.requestId || id, accessToken);
      toast.success('Request rejected');
      setRequests(requests.filter(r => r.id !== id));
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to reject request:', err);
      toast.error(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ background: 'var(--gradient-background)' }}
    >
      {/* Header - Matching Design */}
      <div 
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b"
        style={{ 
          borderColor: '#E8E8F0',
          padding: '16px 20px',
        }}
      >
        <h1 
          className="text-2xl font-bold"
          style={{ 
            fontFamily: "'Outfit', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#2D2D2D',
          }}
        >
          Friends
        </h1>
      </div>

      {/* Tabs - Matching Design */}
      <div 
        className="sticky bg-white border-b-2"
        style={{ 
          top: '60px',
          borderColor: '#E8E8F0',
          zIndex: 40,
        }}
      >
        <div className="flex">
          {[
            { id: 'friends', label: 'My Friends' },
            { id: 'requests', label: 'Requests' },
            { id: 'suggestions', label: 'Suggestions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'friends' | 'requests' | 'suggestions')}
              className="flex-1 py-4 text-center text-sm font-semibold transition-all relative"
              style={{
                color: activeTab === tab.id ? '#FF6B6B' : '#6B6B6B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ 
                    background: 'linear-gradient(90deg, #FF6B6B, #FF8E8E)',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div 
        className="overflow-y-auto"
        style={{ 
          height: 'calc(100vh - 60px - 57px - 80px)',
          padding: '20px',
        }}
      >
        {/* Stats Card - Only show on Requests tab */}
        {activeTab === 'requests' && (
          <div 
            className="rounded-2xl p-5 mb-5"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(167, 139, 250, 0.1))',
              border: '2px solid rgba(255, 107, 107, 0.2)',
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div 
                  className="text-2xl font-extrabold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B6B, #A78BFA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '24px',
                    fontWeight: 800,
                  }}
                >
                  247
                </div>
                <div className="text-xs font-semibold" style={{ color: '#6B6B6B', fontSize: '12px' }}>
                  Friends
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-extrabold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B6B, #A78BFA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '24px',
                    fontWeight: 800,
                  }}
                >
                  {requests.length}
                </div>
                <div className="text-xs font-semibold" style={{ color: '#6B6B6B', fontSize: '12px' }}>
                  Pending
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-extrabold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B6B, #A78BFA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '24px',
                    fontWeight: 800,
                  }}
                >
                  89
                </div>
                <div className="text-xs font-semibold" style={{ color: '#6B6B6B', fontSize: '12px' }}>
                  Mutual
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' ? (
          <div className="grid grid-cols-2 gap-3">
            {friends.map((friend) => (
              <div 
                key={friend.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div 
                  className="relative aspect-square"
                  style={{ background: 'var(--gradient-accent)' }}
                >
                  <img
                    src={friend.avatar_url}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                  {friend.compatibility && (
                    <div 
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"
                      style={{ 
                        background: 'var(--gradient-accent)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-bold)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      {friend.compatibility}%
                    </div>
                  )}
                </div>
                <div 
                  className="p-3 text-center"
                  style={{ padding: 'var(--space-3)' }}
                >
                  <h3 
                    className="font-bold text-sm mb-1 truncate"
                    style={{
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-caption)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {friend.name}
                  </h3>
                  <p 
                    className="text-xs text-gray-600 truncate"
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    {friend.major}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{
                      color: 'var(--color-text-tertiary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    {friend.mutualFriends} mutual
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'requests' ? (
          <div>
            {/* Section Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 
                className="text-lg font-bold"
                style={{ 
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#2D2D2D',
                }}
              >
                Connection Requests
              </h2>
              <button 
                className="text-sm font-semibold"
                style={{ color: '#FF6B6B', fontSize: '14px', fontWeight: 600 }}
              >
                See all
              </button>
            </div>

            <div className="space-y-3">
              {requests.length === 0 ? (
                <div 
                  className="bg-white rounded-2xl p-4 text-center"
                  style={{
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <p 
                    className="text-sm"
                    style={{
                      color: '#6B6B6B',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  >
                    No new friend requests.
                  </p>
                </div>
              ) : (
                requests.map(request => (
                  <div 
                    key={request.id}
                    className="bg-white rounded-2xl p-4 flex items-start gap-3 transition-all hover:shadow-md"
                    style={{
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      animation: 'slideIn 0.3s ease-out',
                    }}
                  >
                    <style>{`
                      @keyframes slideIn {
                        from {
                          opacity: 0;
                          transform: translateX(-20px);
                        }
                        to {
                          opacity: 1;
                          transform: translateX(0);
                        }
                      }
                    `}</style>
                    <div 
                      className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '16px',
                      }}
                    >
                      {request.avatar_url ? (
                        <img 
                          src={request.avatar_url} 
                          alt={request.name} 
                          className="w-full h-full rounded-2xl object-cover" 
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <h3 
                          className="text-base font-bold truncate"
                          style={{
                            color: '#2D2D2D',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                          }}
                        >
                          {request.name}
                        </h3>
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                          style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' }}
                        >
                          ✓
                        </div>
                      </div>
                      <p 
                        className="text-sm mb-0.5"
                        style={{
                          color: '#6B6B6B',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '13px',
                        }}
                      >
                        {request.major || 'Student'}
                      </p>
                      <p 
                        className="text-xs font-semibold"
                        style={{
                          color: '#FF6B6B',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {request.mutualFriends} mutual friends
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleAccept(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold transition-all hover:scale-105 disabled:opacity-60"
                          style={{
                            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            boxShadow: actionLoading !== request.id ? '0 4px 12px rgba(255, 107, 107, 0.3)' : 'none',
                          }}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            'Accept'
                          )}
                        </button>
                        <button 
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-60"
                          style={{
                            background: 'white',
                            color: '#6B6B6B',
                            border: '2px solid #E8E8F0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            'Decline'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Suggestions Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 
                  className="text-lg font-bold"
                  style={{ 
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#2D2D2D',
                  }}
                >
                  People You May Know
                </h2>
                <button 
                  onClick={() => {
                    toast.info('See all suggestions feature coming soon!');
                  }}
                  className="text-sm font-semibold"
                  style={{ color: '#FF6B6B', fontSize: '14px', fontWeight: 600 }}
                >
                  See all
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Alex Turner', reason: 'Also in Computer Science', tags: ['🎮 Gaming', '💻 Coding'], emoji: '🎨' },
                  { name: 'Sofia Martinez', reason: '3 mutual friends', tags: ['🎵 Music', '📚 Reading'], emoji: '🎭' },
                  { name: 'Ryan Lee', reason: 'Same graduation year', tags: ['⚽ Sports', '🎬 Movies'], emoji: '⚡' },
                ].map((suggestion, i) => (
                  <div 
                    key={i}
                    className="bg-white rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                        borderRadius: '14px',
                      }}
                    >
                      {suggestion.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm font-bold mb-0.5"
                        style={{
                          color: '#2D2D2D',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        {suggestion.name}
                      </h3>
                      <p 
                        className="text-xs mb-1.5"
                        style={{
                          color: '#6B6B6B',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '12px',
                        }}
                      >
                        {suggestion.reason}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {suggestion.tags.map((tag, j) => (
                          <span 
                            key={j}
                            className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{
                              background: 'rgba(255, 107, 107, 0.1)',
                              color: '#FF6B6B',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!accessToken) {
                          toast.error('Please log in to connect');
                          return;
                        }
                        try {
                          // Use AI assistant soft intro endpoint for better matching
                          const { projectId } = await import('../utils/supabase/info');
                          const response = await fetch(
                            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/soft-intro`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                              },
                              body: JSON.stringify({
                                targetUserId: suggestion.id || `user-${i}`,
                                reason: `I think we could be a great connection!`,
                                context: 'Sent from Friends suggestions'
                              }),
                            }
                          );
                          if (!response.ok) throw new Error('Failed to send request');
                          toast.success(`Connection request sent to ${suggestion.name}!`);
                        } catch (error: unknown) {
                          const err = error as Error;
                          toast.error(err.message || 'Failed to send connection request');
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-white font-semibold whitespace-nowrap transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: '#6B6B6B' }}>Suggestions coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
