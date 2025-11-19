import { useState, useEffect, useRef } from 'react';
import { Search, Grid3x3, List, Heart, Bell, MapPin, GraduationCap, LayoutGrid } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { getAllProfiles } from '../utils/api-client';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { UserProfile, ProfileFilters, PaginationResponse } from '../types/api';

interface Profile {
  id: string;
  name: string;
  age: number;
  school: string;
  major: string;
  year: string;
  bio: string;
  interests: string[];
  lookingFor: string[];
  imageUrl: string;
  profilePicture?: string;
  photos?: string[];
  mutualFriends?: number;
}

interface YearbookModernProps {
  onProfileDetailOpen?: (isOpen: boolean) => void;
  onNavigateToProfile?: (userId?: string) => void;
}

// Image component with error handling
function ProfileImage({ src, alt }: { src?: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  
  if (!src || imageError) {
    return <div className="text-8xl opacity-30">📸</div>;
  }
  
  return (
    <img 
      src={src} 
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

export function YearbookModern({ onProfileDetailOpen, onNavigateToProfile }: YearbookModernProps) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(2);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchStartDistance, setPinchStartDistance] = useState(0);
  const [pinchStartColumns, setPinchStartColumns] = useState<2 | 3 | 4 | 5>(2);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfiles();
  }, [accessToken, activeFilter]);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle pinch gesture for grid expansion
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== 'grid' || e.touches.length !== 2) return;
    
    const distance = getTouchDistance(e.touches[0], e.touches[1]);
    setPinchStartDistance(distance);
    setPinchStartColumns(gridColumns);
    setIsPinching(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPinching || e.touches.length !== 2 || viewMode !== 'grid') return;
    
    e.preventDefault();
    const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
    const distanceChange = currentDistance - pinchStartDistance;
    const threshold = 50; // Minimum distance change to trigger column change
    
    if (Math.abs(distanceChange) > threshold) {
      if (distanceChange > 0 && pinchStartColumns < 5) {
        // Pinch out - expand (more columns)
        const nextCol = pinchStartColumns + 1;
        const newColumns = (nextCol <= 5 ? nextCol : 5) as 2 | 3 | 4 | 5;
        setGridColumns(newColumns);
        setPinchStartDistance(currentDistance);
        setPinchStartColumns(newColumns);
      } else if (distanceChange < 0 && pinchStartColumns > 2) {
        // Pinch in - contract (fewer columns)
        const nextCol = pinchStartColumns - 1;
        const newColumns = (nextCol >= 2 ? nextCol : 2) as 2 | 3 | 4 | 5;
        setGridColumns(newColumns);
        setPinchStartDistance(currentDistance);
        setPinchStartColumns(newColumns);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPinching(false);
    setPinchStartDistance(0);
  };

  // Mouse wheel support for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'grid' || !e.ctrlKey) return; // Only when Ctrl is held (pinch zoom simulation)
    
    e.preventDefault();
    const delta = e.deltaY;
    const threshold = 50;
    
    if (Math.abs(delta) > threshold) {
      if (delta < 0 && gridColumns < 5) {
        // Scroll up - expand (more columns)
        const nextCol = gridColumns + 1;
        const newColumns = (nextCol <= 5 ? nextCol : 5) as 2 | 3 | 4 | 5;
        setGridColumns(newColumns);
      } else if (delta > 0 && gridColumns > 2) {
        // Scroll down - contract (fewer columns)
        const nextCol = gridColumns - 1;
        const newColumns = (nextCol >= 2 ? nextCol : 2) as 2 | 3 | 4 | 5;
        setGridColumns(newColumns);
      }
    }
  };

  const loadProfiles = async () => {
    if (!accessToken) {
      logger.debug('No access token, skipping profile load');
      setLoading(false);
      setProfiles([]);
      return;
    }

    // Get user's school
    const school = userProfile?.school || 'University of Illinois Urbana-Champaign';

    try {
      setLoading(true);
      
      // Build filters based on active filter - always include school
      const filters: ProfileFilters = {
        school: school,
      };
      
      if (activeFilter !== 'all') {
        filters.year = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
      }
      
      const response = await getAllProfiles(accessToken, filters) as { profiles: UserProfile[]; pagination?: PaginationResponse };
      const data = response.profiles || [];
      const transformedProfiles = data.map((p: UserProfile) => ({
        id: p.id || (p as any).user_id,
        name: p.name,
        age: p.age || 21,
        school: p.school || 'University of Illinois',
        major: p.major || 'Undeclared',
        year: p.year_level || p.year || 'Student',
        bio: p.bio || '',
        interests: p.interests || [],
        lookingFor: p.looking_for || [],
        // Prioritize actual profile photos over other images
        imageUrl: p.profile_picture || p.photos?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
        profilePicture: p.profile_picture || p.photos?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
        photos: p.photos || [],
        mutualFriends: p.mutual_friends_count || 0,
      }));
      
      setProfiles(transformedProfiles);
      
      if (transformedProfiles.length === 0) {
        toast.info('No students found matching your filters');
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to load profiles:', err);
      // Handle 401 errors gracefully
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        logger.warn('Authentication error - token may be expired');
        // Don't show error toast for auth issues, just log it
      } else {
        toast.error(err.message || 'Failed to load profiles');
      }
      
      // Fallback to empty state instead of mock data
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    if (activeFilter === 'all') return true;
    return profile.year.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleProfileClick = (index: number) => {
    setSelectedProfileIndex(index);
    onProfileDetailOpen?.(true);
  };

  const handleCloseProfileDetail = () => {
    setSelectedProfileIndex(null);
    onProfileDetailOpen?.(false);
  };

  if (selectedProfileIndex !== null) {
    return (
      <ProfileDetailView
        profile={filteredProfiles[selectedProfileIndex]}
        onClose={handleCloseProfileDetail}
        accessToken={accessToken || undefined}
        onNext={() => {}}
        onPrev={() => {}}
        hasNext={false}
        hasPrev={false}
      />
    );
  }

  const filters = [
    { id: 'all', label: '🎓 All Students' },
    { id: 'cs', label: '💻 CS Majors' },
    { id: 'athletes', label: '🏀 Athletes' },
    { id: 'creatives', label: '🎨 Creatives' },
    { id: 'musicians', label: '🎵 Musicians' },
    { id: 'new', label: '🌟 New' },
  ];

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ background: 'var(--gradient-background)', position: 'relative' }}
    >
      {/* Header - Matching Design */}
      <div 
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b"
        style={{ 
          borderColor: '#E8E8F0',
          padding: '16px 20px',
        }}
      >
        <div className="flex items-center justify-between">
          <h1 
            className="text-xl font-bold"
            style={{ 
              fontFamily: "'Outfit', sans-serif",
              fontSize: '22px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FF6B6B, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Bonded
          </h1>
          <div className="flex items-center gap-2">
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-pink-500 hover:scale-105"
              style={{ 
                background: 'white',
                borderColor: '#E8E8F0',
              }}
            >
              <Search className="w-5 h-5" style={{ color: '#2D2D2D' }} />
            </button>
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-pink-500 hover:scale-105 relative"
              style={{ 
                background: 'white',
                borderColor: '#E8E8F0',
              }}
            >
              <Bell className="w-5 h-5" style={{ color: '#2D2D2D' }} />
              <span 
                className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                style={{ 
                  background: '#FF6B6B',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters - Matching Design */}
      <div 
        className="sticky bg-white border-b"
        style={{ 
          top: '73px',
          borderColor: '#E8E8F0',
          zIndex: 40,
          padding: '12px 20px',
        }}
      >
        <style>{`
          .filter-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div 
          className="filter-scroll flex gap-2"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className="px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all"
              style={{
                background: activeFilter === filter.id 
                  ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(167, 139, 250, 0.1))'
                  : 'white',
                color: activeFilter === filter.id ? '#FF6B6B' : '#6B6B6B',
                border: activeFilter === filter.id ? '2px solid #FF6B6B' : '2px solid #E8E8F0',
                borderRadius: '20px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="overflow-y-auto"
        style={{ 
          height: 'calc(100vh - 73px - 61px - 80px)',
          padding: '16px 20px 20px',
          touchAction: viewMode === 'grid' ? 'pan-y pinch-zoom' : 'pan-y',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {loading ? (
          viewMode === 'grid' ? (
            <div 
              className="grid gap-2"
              style={{ 
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
              }}
            >
              {Array.from({ length: gridColumns * 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-2">
                    <div className="h-3 bg-gray-200 rounded mb-1 w-3/4 mx-auto" />
                    {gridColumns <= 3 && (
                      <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-70 bg-gray-200" style={{ height: '280px' }} />
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-24 bg-gray-200 rounded-full" />
                      <div className="h-6 w-24 bg-gray-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-gray-200 rounded-xl" />
                      <div className="h-10 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#6B6B6B' }}>No students found matching your filters.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div 
            className="grid gap-2"
            style={{ 
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }}
          >
            {filteredProfiles.map((profile, index) => (
              <button
                key={profile.id || `profile-${index}`}
                onClick={() => onNavigateToProfile?.(profile.id)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all text-left"
                style={{ 
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                }}
              >
                {/* Image Section - Compact for yearbook style */}
                <div 
                  className="w-full relative flex items-center justify-center overflow-hidden aspect-square"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <ProfileImage 
                    src={profile.profilePicture || profile.imageUrl} 
                    alt={profile.name || 'Student'}
                  />
                </div>

                {/* Content Section - Just name for yearbook style */}
                <div className="p-2 text-center">
                  <h3 
                    className="font-semibold truncate"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      fontSize: gridColumns >= 4 ? '11px' : gridColumns === 3 ? '12px' : '13px',
                      fontWeight: 600,
                      color: '#2D2D2D',
                      lineHeight: '1.3',
                    }}
                  >
                    {profile.name || 'Student'}
                  </h3>
                  {gridColumns <= 3 && (
                    <p 
                      className="text-xs mt-0.5 truncate"
                      style={{ 
                        color: '#6B6B6B',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '10px',
                      }}
                    >
                      {profile.year || 'Student'}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {filteredProfiles.map((profile, index) => (
              <div
                key={profile.id || `profile-${index}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`,
                  marginBottom: index < filteredProfiles.length - 1 ? '16px' : '0',
                }}
              >
                <style>{`
                  @keyframes slideInUp {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
                
                {/* Image Section - 280px height */}
                <div 
                  className="w-full relative flex items-center justify-center overflow-hidden"
                  style={{ 
                    height: '280px',
                    minHeight: '280px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <ProfileImage 
                    src={profile.profilePicture || profile.imageUrl} 
                    alt={profile.name || 'Student'}
                  />
                </div>

                {/* Content Section */}
                <div className="p-4">
                  {/* Header with Name and Mutual Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h2 
                          className="text-xl font-bold break-words"
                          style={{ 
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#2D2D2D',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {profile.name || 'Student'}
                        </h2>
                        {(profile as any).is_verified && (
                          <div 
                            className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-white text-[11px] flex-shrink-0"
                            style={{ 
                              background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                              width: '18px',
                              height: '18px',
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <div 
                        className="text-sm mb-1 flex items-center gap-1 flex-wrap"
                        style={{ 
                          color: '#6B6B6B',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '14px',
                        }}
                      >
                        {profile.age && <span>{profile.age}.</span>}
                        {profile.age && profile.year && <span>•</span>}
                        {profile.year && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{profile.year}</span>
                          </span>
                        )}
                        {profile.year && profile.major && <span>•</span>}
                        {profile.major && <span>{profile.major}</span>}
                        {!profile.age && !profile.year && !profile.major && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Student</span>
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-sm flex items-center gap-1"
                        style={{ 
                          color: '#9B9B9B',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '13px',
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.school || 'University of Illinois Urbana-Champaign'}
                      </div>
                    </div>
                    {profile.mutualFriends !== undefined && profile.mutualFriends > 0 && (
                      <div 
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap"
                        style={{ 
                          background: 'rgba(255, 107, 107, 0.1)',
                          color: '#FF6B6B',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {profile.mutualFriends} mutual
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio && profile.bio.trim() && (
                    <div 
                      className="mb-4 text-sm leading-relaxed break-words"
                      style={{ 
                        color: '#2D2D2D',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      "{profile.bio}"
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {profile.interests.map((interest, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(167, 139, 250, 0.08))',
                            border: '1px solid rgba(255, 107, 107, 0.2)',
                            borderRadius: '10px',
                            color: '#2D2D2D',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle connect
                        toast.info('Connect feature coming soon!');
                      }}
                      className="py-3 px-5 rounded-xl text-white font-semibold transition-all hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)',
                      }}
                    >
                      Connect
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToProfile?.(profile.id);
                      }}
                      className="py-3 px-5 rounded-xl font-semibold transition-all hover:scale-105"
                      style={{ 
                        background: 'white',
                        color: '#2D2D2D',
                        border: '2px solid #E8E8F0',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: 600,
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed right-5 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:rotate-90 z-50"
        style={{ 
          bottom: '100px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
          boxShadow: '0 8px 20px rgba(255, 107, 107, 0.4)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 7v4a1 1 0 0 0 1 1h3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M21 17v-4a1 1 0 0 0-1-1h-3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 9h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 7v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
