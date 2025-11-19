import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, MoreVertical, MapPin, GraduationCap, Calendar, Users, Grid3x3, Edit, Heart, MessageCircle, UserPlus, Check, X, MessageSquare, Share2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getProfile, getFriends, getPosts, updateProfile } from '../utils/api-client';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { UserProfile, ForumPost, PostsResponse, Connection, FriendshipsResponse } from '../types/api';

// Share Menu Component
function ShareMenuButton({ profileId, profileName }: { profileId: string; profileName: string }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName}'s Profile`,
          text: `Check out ${profileName}'s profile on Bonded`,
          url: profileUrl,
        });
        setShowMenu(false);
      } catch (error: unknown) {
        const err = error as Error;
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied!');
      setShowMenu(false);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: '0.5rem',
          borderRadius: '9999px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <MoreVertical className="w-5 h-5" style={{ color: '#1f2937' }} />
      </button>
      
      {showMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '0.5rem',
              minWidth: '160px',
              zIndex: 9999,
            }}
          >
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </button>
            <button
              onClick={handleCopyLink}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface ProfileModernProps {
  onBack?: () => void;
  userId?: string; // If provided, shows other user's profile
}

export function ProfileModern({ onBack, userId }: ProfileModernProps) {
  const { userProfile, accessToken } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'connections' | 'interests'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [bio, setBio] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [posts, setPosts] = useState<Array<{ id: string; gradient: string; likes: number; comments: number; timestamp: string }>>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const isOwnProfile = !userId || userId === userProfile?.id;

  useEffect(() => {
    loadProfile();
  }, [userId, userProfile?.id, accessToken]);

  useEffect(() => {
    if (activeTab === 'posts' && profile) {
      loadPosts();
    } else if (activeTab === 'connections' && profile) {
      loadConnections();
    }
  }, [activeTab, profile]);

  const loadProfile = async () => {
    if (!accessToken) {
      console.warn('No access token available for profile load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const targetUserId = userId || userProfile?.id;
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const data = await getProfile(targetUserId, accessToken) as UserProfile;
      setProfile(data);
      setBio(data.bio || '');
      setTempBio(data.bio || '');
      setInterests(data.interests || []);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // Handle 401 errors gracefully
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.warn('Authentication error - token may be expired');
        // Don't show error toast for auth issues, just log it
        // Set profile to userProfile as fallback
        if (userProfile) {
          setProfile(userProfile);
          setBio(userProfile.bio || '');
          setTempBio(userProfile.bio || '');
          setInterests(userProfile.interests || []);
        }
      } else {
        toast.error((error as Error).message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!accessToken || !profile) return;

    try {
      setPostsLoading(true);
      const targetUserId = userId || userProfile?.id;
      // Get all posts and filter by user
      const data = await getPosts(accessToken);
      const response = data as PostsResponse;
      const allPosts = response.posts || [];
      const userPosts = targetUserId 
        ? allPosts.filter((post: ForumPost) => post.authorId === targetUserId)
        : allPosts;
      
      // Transform to match UI format with gradients
      const gradients = [
        'linear-gradient(to bottom right, #fb7185, #ec4899)',
        'linear-gradient(to bottom right, #a855f7, #3b82f6)',
        'linear-gradient(to bottom right, #ec4899, #a855f7)',
        'linear-gradient(to bottom right, #f59e0b, #f97316)',
        'linear-gradient(to bottom right, #10b981, #3b82f6)',
        'linear-gradient(to bottom right, #ec4899, #f97316)',
      ];
      
      const transformedPosts = userPosts.slice(0, 9).map((post: ForumPost, i: number) => ({
        id: post.id,
        gradient: gradients[i % gradients.length],
        likes: (post as any).like_count || post.likes || 0,
        comments: (post as any).comment_count || post.comments || 0,
        timestamp: (post as any).created_at 
          ? new Date((post as any).created_at).toLocaleDateString()
          : 'Recently',
      }));
      
      setPosts(transformedPosts);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to load posts:', err);
      // Handle different error types
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        logger.warn('Authentication error loading posts');
        setPosts([]);
      } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        logger.warn('Network error loading posts');
        setPosts([]);
      } else {
        toast.error(err.message || 'Failed to load posts');
        setPosts([]);
      }
    } finally {
      setPostsLoading(false);
    }
  };

  const loadConnections = async () => {
    if (!accessToken || !profile) return;

    try {
      setConnectionsLoading(true);
      const data = await getFriends(accessToken);
      // Backend returns { friendships: [...] } with friend property
      const friendships = (data as any)?.friendships || [];
      const transformedConnections = friendships
        .filter((f: any) => f.friend) // Only include friendships with profile data
        .map((f: any) => ({
          id: f.friend.id,
          name: f.friend.name,
          profilePicture: f.friend.profilePicture || f.friend.photos?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.friend.id}`,
          year: f.friend.year || f.friend.yearLevel || 'Student',
          major: f.friend.major || 'Undeclared',
          mutualFriends: f.friend.mutualFriendsCount || 0,
        }));
      setConnections(transformedConnections);
    } catch (error: any) {
      console.error('Failed to load connections:', error);
      toast.error(error.message || 'Failed to load connections');
      setConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!accessToken || !isOwnProfile) return;

    try {
      const targetUserId = userProfile?.id || '';
      await updateProfile(targetUserId, { bio: tempBio }, accessToken);
      setBio(tempBio);
      setIsEditingBio(false);
      // Reload profile to get updated data
      await loadProfile();
      toast.success('Bio updated');
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to update bio:', err);
      // Handle different error types
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast.error('Please log in again to update your bio');
      } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(err.message || 'Failed to update bio');
      }
    }
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim() || interests.length >= 10 || !accessToken || !isOwnProfile) return;

    const originalInterests = [...interests];
    const updatedInterests = [...interests, newInterest.trim()];
    
    // Optimistically update UI
    setInterests(updatedInterests);
    setNewInterest('');
    
    try {
      const targetUserId = userProfile?.id || '';
      await updateProfile(targetUserId, { interests: updatedInterests }, accessToken);
      // Reload profile to get updated data
      await loadProfile();
      toast.success('Interest added');
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to add interest:', err);
      // Revert the optimistic update
      setInterests(originalInterests);
      setNewInterest(newInterest.trim());
      
      // Handle different error types
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast.error('Please log in again to add interests');
      } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(err.message || 'Failed to add interest');
      }
    }
  };

  const handleRemoveInterest = async (index: number) => {
    if (!accessToken || !isOwnProfile) return;

    const originalInterests = [...interests];
    const updatedInterests = interests.filter((_, i) => i !== index);
    
    // Optimistically update UI
    setInterests(updatedInterests);
    
    try {
      const targetUserId = userProfile?.id || '';
      await updateProfile(targetUserId, { interests: updatedInterests }, accessToken);
      // Reload profile to get updated data
      await loadProfile();
      toast.success('Interest removed');
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to remove interest:', err);
      // Revert the optimistic update
      setInterests(originalInterests);
      
      // Handle different error types
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast.error('Please log in again to remove interests');
      } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(err.message || 'Failed to remove interest');
      }
    }
  };

  const handleConnect = async () => {
    if (!accessToken || isOwnProfile) return;
    // TODO: Implement connect functionality
    setIsConnected(!isConnected);
    toast.success(isConnected ? 'Disconnected' : 'Connection request sent');
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff, #fed7d7)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const profileData = {
    name: profile.name || userProfile?.name || 'User',
    username: `@${(profile.name || userProfile?.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
    year: profile.year || profile.yearLevel || userProfile?.year || 'Student',
    major: profile.major || userProfile?.major || '',
    location: profile.school || userProfile?.school || 'University',
    joinDate: profile.created_at 
      ? `Joined ${new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      : 'Joined recently',
    connections: profile.friendsCount || connections.length || 0,
    mutualConnections: profile.mutualFriendsCount || 0,
    posts: posts.length,
    isPostsPublic: profile.isPostsPublic !== false, // Default to public
    profilePicture: profile.profilePicture || profile.photos?.[0] || userProfile?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id || userProfile?.id}`,
  };

  const canSeePosts = isOwnProfile || profileData.isPostsPublic;

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ 
        background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff, #fed7d7)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f3f4f6'
        }}
      >
        {isOwnProfile ? (
          <div style={{ width: '40px' }} /> // Spacer for own profile
        ) : (
          <button 
            onClick={onBack}
            style={{
              padding: '0.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#1f2937' }} />
          </button>
        )}
        <h1 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0, color: '#1f2937' }}>
          {profileData.name}
        </h1>
        <ShareMenuButton profileId={profile.id || userProfile?.id || ''} profileName={profileData.name} />
      </div>

      {/* Cover + Profile Picture */}
      <div style={{ position: 'relative' }}>
        <div 
          style={{
            height: '10rem',
            background: 'linear-gradient(to bottom right, #fb7185, #ec4899, #a855f7)'
          }} 
        />
        
        <div 
          style={{
            position: 'absolute',
            bottom: '-4rem',
            left: '1rem'
          }}
        >
          <div 
            style={{
              width: '8rem',
              height: '8rem',
              borderRadius: '9999px',
              background: profileData.profilePicture?.startsWith('http') 
                ? `url(${profileData.profilePicture}) center/cover`
                : 'linear-gradient(to bottom right, #fdba74, #c084fc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              border: '4px solid white',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            {!profileData.profilePicture?.startsWith('http') && '🎓'}
            {profileData.profilePicture?.startsWith('http') && (
              <img 
                src={profileData.profilePicture} 
                alt={profileData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div style={{ padding: '5rem 1rem 1.5rem' }}>
        {/* Name & Username */}
        <div style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#1f2937' }}>
            {profileData.name}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{profileData.username}</p>
        </div>

        {/* Bio with Edit */}
        <div style={{ marginBottom: '1rem' }}>
          {isEditingBio ? (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', border: '2px solid #fb7185' }}>
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                maxLength={150}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}
                placeholder="Write a bio..."
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{tempBio.length}/150</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleCancelBio}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: '#f3f4f6',
                      color: '#374151',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: 'linear-gradient(to right, #fb7185, #ec4899)',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <p style={{ color: '#374151', lineHeight: '1.625', paddingRight: isOwnProfile ? '2rem' : 0 }}>
                {bio || 'No bio yet'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    setIsEditingBio(true);
                    setTempBio(bio);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: '0.25rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#fb7185',
                    cursor: 'pointer'
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
            <GraduationCap className="w-4 h-4" />
            <span>{profileData.year} • {profileData.major}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
            <MapPin className="w-4 h-4" />
            <span>{profileData.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
            <Calendar className="w-4 h-4" />
            <span>{profileData.joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937' }}>{profileData.posts}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Posts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937' }}>{profileData.connections}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Connections</div>
          </div>
          {!isOwnProfile && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937' }}>{profileData.mutualConnections}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Mutual</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              onClick={handleConnect}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '9999px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: isConnected ? '#f3f4f6' : 'linear-gradient(to right, #fb7185, #ec4899)',
                color: isConnected ? '#374151' : 'white',
                boxShadow: isConnected ? 'none' : '0 10px 15px -3px rgba(251, 113, 133, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isConnected ? (
                <>
                  <Check className="w-5 h-5" />
                  Connected
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Connect
                </>
              )}
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              background: '#f3f4f6',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'posts' ? '2px solid #fb7185' : '2px solid transparent',
              color: activeTab === 'posts' ? '#fb7185' : '#6b7280',
              fontWeight: activeTab === 'posts' ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '-2px'
            }}
          >
            <Grid3x3 className="w-5 h-5" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'connections' ? '2px solid #fb7185' : '2px solid transparent',
              color: activeTab === 'connections' ? '#fb7185' : '#6b7280',
              fontWeight: activeTab === 'connections' ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '-2px'
            }}
          >
            <Users className="w-5 h-5" />
            Connections
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'interests' ? '2px solid #fb7185' : '2px solid transparent',
              color: activeTab === 'interests' ? '#fb7185' : '#6b7280',
              fontWeight: activeTab === 'interests' ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '-2px'
            }}
          >
            <Heart className="w-5 h-5" />
            Interests
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div>
            {!canSeePosts ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Posts are Private</p>
                <p style={{ fontSize: '0.875rem' }}>This user's posts are only visible to them</p>
              </div>
            ) : postsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#6b7280'
              }}>
                <p>No posts yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem' }}>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      aspectRatio: '1',
                      background: post.gradient,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      left: '0.5rem',
                      right: '0.5rem',
                      display: 'flex',
                      gap: '0.75rem',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MessageSquare className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {connectionsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <p>Loading connections...</p>
              </div>
            ) : connections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <p>No connections yet</p>
              </div>
            ) : (
              connections.map((connection: Connection) => (
                <div
                  key={connection.id}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f3f4f6',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '9999px',
                    background: connection.profilePicture 
                      ? `url(${connection.profilePicture}) center/cover`
                      : 'linear-gradient(to bottom right, #fdba74, #c084fc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {!connection.profilePicture && '👤'}
                    {connection.profilePicture && (
                      <img 
                        src={connection.profilePicture} 
                        alt={connection.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.125rem', color: '#1f2937' }}>
                      {connection.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {connection.year || 'Student'} • {connection.major || 'Undeclared'}
                    </p>
                    {connection.mutualFriends !== undefined && connection.mutualFriends > 0 && (
                      <p style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '0.125rem' }}>
                        {connection.mutualFriends} mutual connections
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'interests' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {interests.map((interest, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'white',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {interest}
                  {isOwnProfile && isEditingInterests && (
                    <button
                      onClick={() => handleRemoveInterest(index)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isOwnProfile && (
              <>
                {isEditingInterests ? (
                  <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', border: '2px solid #fb7185' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                        placeholder="Add an interest..."
                        maxLength={20}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={handleAddInterest}
                        disabled={!newInterest.trim() || interests.length >= 10}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          background: newInterest.trim() && interests.length < 10 
                            ? 'linear-gradient(to right, #fb7185, #ec4899)' 
                            : '#e5e7eb',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: newInterest.trim() && interests.length < 10 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {interests.length}/10 interests
                      </span>
                      <button
                        onClick={() => setIsEditingInterests(false)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          background: 'linear-gradient(to right, #fb7185, #ec4899)',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingInterests(true)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      border: '2px dashed #e5e7eb',
                      background: 'white',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Interests
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
