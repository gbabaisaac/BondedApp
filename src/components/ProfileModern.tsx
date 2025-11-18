import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, MoreVertical, MapPin, Check, Camera, Users, UsersRound, Grid3x3, Edit, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';
import { getProfile } from '../utils/api-client';
import { toast } from 'sonner';

interface ProfileModernProps {
  onBack?: () => void;
}

export function ProfileModern({ onBack }: ProfileModernProps) {
  const { userProfile, accessToken, handleLogout } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(userProfile);

  useEffect(() => {
    loadProfile();
  }, [userProfile?.id, accessToken]);

  const loadProfile = async () => {
    if (!userProfile?.id || !accessToken) {
      setProfile(userProfile);
      return;
    }

    try {
      setLoading(true);
      const data = await getProfile(userProfile.id, accessToken);
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error(error.message || 'Failed to load profile');
      // Fallback to user profile from store
      setProfile(userProfile);
    } finally {
      setLoading(false);
    }
  };

  const mockProfile = {
    name: profile?.name || userProfile?.name || 'User',
    age: profile?.age || userProfile?.age || 21,
    isVerified: profile?.isVerified || false,
    year: profile?.year || profile?.yearLevel || userProfile?.year || 'Student',
    major: profile?.major || userProfile?.major || '',
    school: profile?.school || userProfile?.school || '',
    coverPhoto: profile?.photos?.[0] || userProfile?.photos?.[0] || null,
    profilePicture: profile?.profilePicture || userProfile?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || userProfile?.id}`,
    stats: {
      connections: profile?.friendsCount || 0,
      mutual: profile?.mutualFriendsCount || 0,
      groups: profile?.groupsCount || 0,
    },
    about: profile?.about || userProfile?.about || [],
    interests: profile?.interests?.map((i: string) => ({
      emoji: getEmojiForInterest(i),
      label: i,
    })) || userProfile?.interests?.map((i: string) => ({
      emoji: getEmojiForInterest(i),
      label: i,
    })) || [],
    lookingFor: profile?.lookingFor?.map((l: string) => ({
      emoji: getEmojiForLookingFor(l),
      label: l,
    })) || userProfile?.lookingFor?.map((l: string) => ({
      emoji: getEmojiForLookingFor(l),
      label: l,
    })) || [],
    personality: profile?.bondPrint?.personality || userProfile?.bondPrint?.personality || [],
  };

  // Helper functions for emojis
  function getEmojiForInterest(interest: string): string {
    const emojiMap: Record<string, string> = {
      'Gaming': '🎮', 'Travel': '✈️', 'Music': '🎵', 'Fitness': '💪',
      'Coffee': '☕', 'Design': '🎨', 'Reading': '📚', 'Coding': '💻',
      'Sports': '⚽', 'Art': '🎨', 'Photography': '📸', 'Food': '🍕',
    };
    return emojiMap[interest] || '✨';
  }

  function getEmojiForLookingFor(item: string): string {
    const emojiMap: Record<string, string> = {
      'Study Partners': '👥', 'Friends': '🎉', 'Roommates': '🏠',
      'Dating': '💕', 'Networking': '🤝', 'Mentorship': '📚',
    };
    return emojiMap[item] || '👋';
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--gradient-background)' }}>
      {/* Header - UNIFIED */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b"
        style={{ 
          borderColor: 'var(--color-border-light)',
          height: 'var(--header-height)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="px-4 h-full flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#1A1D2E' }} />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <Plus className="w-5 h-5" style={{ color: '#1A1D2E' }} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" style={{ color: '#1A1D2E' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Content - with top padding for fixed header */}
      <div style={{ paddingTop: 'var(--header-height)' }}>
        {/* Cover Photo - UNIFIED GRADIENT */}
        <div 
          className="relative w-full flex items-center justify-center"
          style={{ 
            height: '240px',
            background: mockProfile.coverPhoto 
              ? `url(${mockProfile.coverPhoto}) center/cover`
              : 'var(--gradient-accent)'
          }}
        >
          {!mockProfile.coverPhoto && (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Camera 
                  className="w-8 h-8"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Profile Info Card - UNIFIED */}
        <div className="px-4 -mt-6">
          <div 
            className="bg-white rounded-3xl p-5"
            style={{ 
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Name & Verification */}
            <div className="flex items-center gap-2 mb-2">
              <h1 
                className="text-2xl font-bold"
                style={{ 
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-h2)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                {mockProfile.name}, {mockProfile.age}
              </h1>
              {mockProfile.isVerified && (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Education & School */}
            <div className="flex items-center gap-2 mb-4">
              <span 
                className="text-sm"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-caption)',
                }}
              >
                🎓 {mockProfile.year} • {mockProfile.major}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-5">
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span 
                className="text-sm font-semibold"
                style={{ 
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-caption)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {mockProfile.school}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center">
                <div 
                  className="text-2xl font-bold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {mockProfile.stats.connections}
                </div>
                <div className="text-xs font-semibold" style={{ color: '#6B6B6B' }}>
                  Connections
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {mockProfile.stats.mutual}
                </div>
                <div className="text-xs font-semibold" style={{ color: '#6B6B6B' }}>
                  Mutual
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {mockProfile.stats.groups}
                </div>
                <div className="text-xs font-semibold" style={{ color: '#6B6B6B' }}>
                  Groups
                </div>
              </div>
            </div>

            {/* Edit Profile Button - Your Own Profile */}
            <button 
              className="w-full py-3 rounded-2xl text-white text-base font-bold transition-all flex items-center justify-center gap-2"
              style={{ 
                background: 'var(--gradient-accent)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: 'var(--shadow-md)',
                height: 'var(--button-height-sm)',
              }}
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* About Section - UNIFIED */}
        <div className="px-4 mt-6">
          <h2 
            className="text-xl font-bold mb-3"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            About
          </h2>
          <div className="space-y-3">
            {mockProfile.about.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-4 border-2"
                style={{ borderColor: '#FFE5EC', background: 'rgba(255, 235, 236, 0.3)' }}
              >
                <div className="text-sm font-bold mb-2" style={{ color: '#FF6B6B' }}>
                  {item.prompt}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: '#1A1D2E' }}>
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests Section - UNIFIED */}
        <div className="px-4 mt-6">
          <h2 
            className="text-xl font-bold mb-3"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {mockProfile.interests.map((interest, index) => (
              <div 
                key={index}
                className="px-4 py-2 rounded-full border-2 flex items-center gap-2"
                style={{ 
                  borderColor: 'var(--color-primary)',
                  background: 'var(--color-primary-bg)',
                  borderRadius: 'var(--pill-radius)',
                }}
              >
                <span className="text-base">{interest.emoji}</span>
                <span 
                  className="text-sm font-semibold"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {interest.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Looking For Section - UNIFIED */}
        <div className="px-4 mt-6">
          <h2 
            className="text-xl font-bold mb-3"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Looking For
          </h2>
          <div className="flex flex-wrap gap-2">
            {mockProfile.lookingFor.map((item, index) => (
              <div 
                key={index}
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{ 
                  background: 'var(--gradient-accent)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--pill-radius)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span className="text-base">{item.emoji}</span>
                <span 
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Personality Section */}
        <div className="px-4 mt-6 pb-6">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1A1D2E' }}>Personality</h2>
          <div className="flex flex-wrap gap-2">
            {mockProfile.personality.map((trait, index) => (
              <div 
                key={index}
                className="px-4 py-2 rounded-full border-2"
                style={{ borderColor: '#FF6B6B', background: 'rgba(255, 107, 107, 0.05)' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#1A1D2E' }}>
                  {trait}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
