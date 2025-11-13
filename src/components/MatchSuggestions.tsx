import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Users, Send, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { ProfileDetailView } from './ProfileDetailView';
import { ConnectionCardSkeleton } from './LoadingSkeletons';
import { EmptyState } from './EmptyStates';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { getProfilePictureUrl } from '../utils/image-optimization';

type Tab = 'friends' | 'requests' | 'suggestions';

export function MatchSuggestions() {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [pendingIntros, setPendingIntros] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, accessToken]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        await loadConnections();
      } else if (activeTab === 'requests') {
        await loadPendingIntros();
      } else {
        await loadSuggestions();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPendingIntros = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intros/incoming`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load pending intros');

      const intros = await response.json();
      setPendingIntros(intros.filter((i: any) => i.status === 'pending'));
    } catch (error) {
      console.error('Load pending intros error:', error);
      toast.error('Failed to load requests');
    }
  };

  const loadConnections = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/connections`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load connections: ${response.status}`);
      }

      const data = await response.json();
      const connectionsArray = Array.isArray(data) ? data : (data.connections || data.data || []);
      setConnections(connectionsArray);
    } catch (error) {
      console.error('Load connections error:', error);
      toast.error('Failed to load connections');
      setConnections([]);
    }
  };

  const loadSuggestions = async () => {
    try {
      // Load profiles from same school, excluding connections
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profiles?school=${encodeURIComponent(userProfile?.school || '')}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const allProfiles = await response.json();
        const connectionIds = new Set(connections.map((c: any) => c.id));
        const pendingIds = new Set(pendingIntros.map((i: any) => i.senderProfile?.id || i.receiverProfile?.id));
        
        const suggested = allProfiles
          .filter((p: any) => 
            p.id !== userProfile?.id &&
            !connectionIds.has(p.id) &&
            !pendingIds.has(p.id)
          )
          .slice(0, 20);
        
        setSuggestions(suggested);
      }
    } catch (error) {
      console.error('Load suggestions error:', error);
    }
  };

  const handleAccept = async (introId: string) => {
    setProcessing(introId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intro/${introId}/accept`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to accept intro');

      toast.success('Friend request accepted! ✅');
      loadPendingIntros();
      loadConnections();
    } catch (error) {
      console.error('Accept intro error:', error);
      toast.error('Failed to accept connection');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (introId: string) => {
    setProcessing(introId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intro/${introId}/deny`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to deny intro');

      toast.success('Request declined');
      loadPendingIntros();
    } catch (error) {
      console.error('Decline intro error:', error);
      toast.error('Failed to decline request');
    } finally {
      setProcessing(null);
    }
  };

  const handleConnect = async (profileId: string) => {
    try {
      // Send soft intro request
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/soft-intro`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            targetUserId: profileId,
            reason: 'I think we could be a great connection!',
          }),
        }
      );

      if (response.ok) {
        toast.success('Connection request sent! 📤');
        loadSuggestions();
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (selectedProfile) {
    return (
      <ProfileDetailView
        profile={selectedProfile}
        accessToken={accessToken}
        onClose={() => setSelectedProfile(null)}
        onNext={() => {}}
        onPrev={() => {}}
        hasNext={false}
        hasPrev={false}
        currentIndex={0}
        totalProfiles={1}
      />
    );
  }

  const filteredConnections = connections.filter((c: any) =>
    searchQuery === '' || c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = pendingIntros.filter((intro: any) =>
    searchQuery === '' || intro.senderProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter((s: any) =>
    searchQuery === '' || s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2841 50%, #0f4d5c 100%)',
        fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-[1000] backdrop-blur-[20px] border-b border-white/10"
        style={{
          background: 'rgba(10, 22, 40, 0.95)',
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              👥
            </div>
            <h1
              className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
            >
              friends
            </h1>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 z-[999] px-5 py-3 backdrop-blur-[20px] border-b border-white/10"
            style={{
              background: 'rgba(10, 22, 40, 0.95)',
            }}
          >
            <div className="max-w-[1200px] mx-auto">
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                style={{
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div
        className="fixed left-0 right-0 z-[999] backdrop-blur-[20px] border-b border-white/10 overflow-x-auto"
        style={{
          background: 'rgba(10, 22, 40, 0.9)',
          top: showSearch ? 'calc(72px + 48px + env(safe-area-inset-top, 0))' : 'calc(72px + env(safe-area-inset-top, 0))',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .tabs-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="max-w-[1200px] mx-auto flex px-4 sm:px-5 min-w-max">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-[15px] cursor-pointer transition-all duration-300 border-b-2 touch-manipulation whitespace-nowrap ${
              activeTab === 'friends'
                ? 'text-teal-400 border-teal-400'
                : 'text-white/60 border-transparent active:text-white'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            My Friends ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-[15px] cursor-pointer transition-all duration-300 border-b-2 touch-manipulation whitespace-nowrap ${
              activeTab === 'requests'
                ? 'text-teal-400 border-teal-400'
                : 'text-white/60 border-transparent active:text-white'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Requests ({pendingIntros.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-[15px] cursor-pointer transition-all duration-300 border-b-2 touch-manipulation whitespace-nowrap ${
              activeTab === 'suggestions'
                ? 'text-teal-400 border-teal-400'
                : 'text-white/60 border-transparent active:text-white'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Suggestions
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 pt-[140px] pb-24 relative z-[1] max-w-[1200px] mx-auto w-full px-4 sm:px-5"
        style={{
          marginTop: showSearch ? '48px' : '0',
          paddingTop: 'calc(140px + env(safe-area-inset-top, 0))',
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0))',
        }}
      >
        {loading ? (
          <div className="p-4">
            <ConnectionCardSkeleton />
          </div>
        ) : (
          <>
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 flex items-center gap-2">
                  💙 My Friends ({filteredConnections.length})
                </h2>
                {filteredConnections.length === 0 ? (
                  <div className="text-center py-16 text-white">
                    <div className="text-6xl mb-5">👥</div>
                    <h3 className="text-2xl font-bold mb-3">No friends yet</h3>
                    <p className="text-[15px] text-white/60 mb-6">
                      Accept connection requests to start building your network!
                    </p>
                    <Button
                      onClick={() => setActiveTab('requests')}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                    >
                      Check Requests
                    </Button>
                  </div>
                ) : (
                  <div
                    className="grid gap-3 sm:gap-4 w-full"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    }}
                  >
                    <style>{`
                      @media (max-width: 640px) {
                        .friends-grid {
                          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
                        }
                      }
                    `}</style>
                    {filteredConnections.map((connection: any) => (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="bg-white/5 backdrop-blur-[20px] rounded-2xl border border-white/10 p-3 sm:p-4 text-center cursor-pointer transition-all duration-300 active:scale-95 touch-manipulation"
                        onClick={() => setSelectedProfile(connection)}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Avatar className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 border-2 border-white/20">
                          <AvatarImage src={getProfilePictureUrl(connection.profilePicture || connection.imageUrl, 'small')} />
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white text-xl">
                            {getInitials(connection.name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-bold text-sm sm:text-[15px] text-white mb-1 truncate w-full">
                          {connection.name || 'Unknown'}
                        </div>
                        <div className="text-[10px] sm:text-xs text-white/50 flex items-center justify-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span>Online</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  📬 Friend Requests ({filteredRequests.length})
                </h2>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-16 text-white">
                    <div className="text-6xl mb-5">📭</div>
                    <h3 className="text-2xl font-bold mb-3">No requests</h3>
                    <p className="text-[15px] text-white/60">
                      When someone sends you a connection request, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div
                    className="grid gap-3 sm:gap-4 w-full"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    }}
                  >
                    <style>{`
                      @media (max-width: 640px) {
                        .requests-grid {
                          grid-template-columns: 1fr !important;
                        }
                      }
                    `}</style>
                    {filteredRequests.map((intro: any) => {
                      const profile = intro.senderProfile || intro;
                      return (
                        <motion.div
                          key={intro.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                          className="bg-white/5 backdrop-blur-[20px] rounded-2xl border border-white/10 p-4 transition-all duration-300 hover:border-white/15"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar
                              className="w-12 h-12 cursor-pointer"
                              onClick={() => setSelectedProfile(profile)}
                            >
                              <AvatarImage src={getProfilePictureUrl(profile?.profilePicture, 'small')} />
                              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                                {getInitials(profile?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div
                                className="font-bold text-base text-white mb-0.5 cursor-pointer hover:opacity-80"
                                onClick={() => setSelectedProfile(profile)}
                              >
                                {profile?.name || 'Unknown'}
                              </div>
                              <div className="text-xs text-white/50">
                                {profile?.age || ''} {profile?.age && '•'} {profile?.year || ''} {profile?.year && '•'} {intro.mutualFriends || 0} mutual friends
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAccept(intro.id)}
                              disabled={processing === intro.id}
                              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-[10px] border-none font-semibold text-xs sm:text-[13px] cursor-pointer transition-all duration-300 text-white touch-manipulation active:scale-95 min-h-[44px]"
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                WebkitTapHighlightColor: 'transparent',
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(intro.id)}
                              disabled={processing === intro.id}
                              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-[10px] border-none font-semibold text-xs sm:text-[13px] cursor-pointer transition-all duration-300 text-white bg-white/10 border border-white/20 touch-manipulation active:scale-95 min-h-[44px]"
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              Decline
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  ✨ People You May Know
                </h2>
                {filteredSuggestions.length === 0 ? (
                  <div className="text-center py-16 text-white">
                    <div className="text-6xl mb-5">✨</div>
                    <h3 className="text-2xl font-bold mb-3">No suggestions</h3>
                    <p className="text-[15px] text-white/60">
                      Check back later for new connection suggestions!
                    </p>
                  </div>
                ) : (
                  <div
                    className="grid gap-4 w-full"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    }}
                  >
                    {filteredSuggestions.map((suggestion: any) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="bg-white/5 backdrop-blur-[20px] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/15"
                      >
                        <div
                          className="w-full aspect-[4/3] bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center text-6xl relative overflow-hidden"
                        >
                          {suggestion.profilePicture || suggestion.imageUrl ? (
                            <img
                              src={getProfilePictureUrl(suggestion.profilePicture || suggestion.imageUrl, 'medium')}
                              alt={suggestion.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div>👤</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div
                            className="font-bold text-base text-white mb-1 cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedProfile(suggestion)}
                          >
                            {suggestion.name || 'Unknown'}
                          </div>
                          <div className="text-[13px] text-white/50 mb-3">
                            {suggestion.age || ''} {suggestion.age && '•'} {suggestion.year || ''} {suggestion.year && '•'} {suggestion.mutualFriends || 0} mutual friends
                          </div>
                          {suggestion.interests && suggestion.interests.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mb-3">
                              {suggestion.interests.slice(0, 2).map((interest: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => handleConnect(suggestion.id)}
                            className="w-full px-4 py-2.5 rounded-[10px] border-none font-semibold text-xs sm:text-[13px] cursor-pointer transition-all duration-300 text-white touch-manipulation active:scale-95 min-h-[44px]"
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                          >
                            Connect
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
