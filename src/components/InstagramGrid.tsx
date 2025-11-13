import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { projectId } from '../utils/supabase/config';
import { ProfileGridSkeleton } from './LoadingSkeletons';
import { EmptyState } from './EmptyStates';
import { apiGet } from '../utils/api-client';
import { EnhancedSearch } from './EnhancedSearch';
import { toast } from 'sonner';
import { getProfileCardAriaLabel, handleGridKeyDown } from '../utils/accessibility';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { YearbookGridCard } from './YearbookGridCard';
import { isFeatureEnabled } from '../config/features';

interface InstagramGridProps {
  onProfileDetailOpen?: (isOpen: boolean) => void;
}

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
  personality?: string[];
  sleepSchedule?: string;
  cleanliness?: string;
  instagram?: string;
  snapchat?: string;
  spotify?: string;
  pronouns?: string;
  bondPrint?: any;
  socialConnections?: any;
  goals?: any;
  scrapbookEnabled?: boolean;
  roommateMode?: boolean;
}

export function InstagramGrid({ onProfileDetailOpen }: InstagramGridProps) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeMode, setActiveMode] = useState<'friend' | 'love'>('friend');
  const [vibeSort, setVibeSort] = useState([50]);
  const [filters, setFilters] = useState({
    major: 'all',
    year: 'all',
    lookingFor: 'all',
    academicGoal: 'all',
    leisureGoal: 'all',
    personalityType: 'all',
    interest: 'all',
    musicTaste: 'all',
    mode: 'all' as 'all' | 'scrapbook' | 'roommate' | 'friend',
    sortBy: 'newest' as 'newest' | 'compatibility' | 'name' | 'vibe',
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [bondPrintScores, setBondPrintScores] = useState<Record<string, number>>({});
  const [sharedInsights, setSharedInsights] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadProfiles();
  }, [userProfile]);

  const loadProfiles = async () => {
    if (!userProfile || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiGet<Profile[]>(
        `/profiles?school=${encodeURIComponent(userProfile.school)}`,
        accessToken,
        { maxRetries: 2 }
      );
      
      const userBlocked = userProfile.blockedUsers || [];
      const otherProfiles = data
        .filter((p: any) => p.id !== userProfile.id && !userBlocked.includes(p.id))
        .map((p: any) => ({
          ...p,
          imageUrl: p.profilePicture || p.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
          age: p.age || 20,
        }));
      
      setProfiles(otherProfiles);
      
      if (userProfile.bondPrint) {
        loadBondPrintScores(otherProfiles);
        calculateSharedInsights(otherProfiles);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load profiles';
      if (import.meta.env.DEV) {
        console.error('Error loading profiles:', error);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateSharedInsights = (profileList: Profile[]) => {
    const insights: Record<string, string[]> = {};
    
    profileList.forEach((profile) => {
      const shared: string[] = [];
      
      const sharedInterests = profile.interests?.filter((i: string) => 
        userProfile?.interests?.includes(i)
      ) || [];
      if (sharedInterests.length >= 3) {
        shared.push(`${sharedInterests.length} shared interests`);
      }
      
      if (profile.sleepSchedule && userProfile?.livingHabits?.sleepSchedule === profile.sleepSchedule) {
        shared.push('Similar sleep schedule');
      }
      
      const sharedAcademic = profile.goals?.academic?.filter((g: string) =>
        userProfile?.goals?.academic?.includes(g)
      ) || [];
      if (sharedAcademic.length > 0) {
        shared.push('Shared academic goals');
      }
      
      const bondScore = bondPrintScores[profile.id];
      if (bondScore && bondScore >= 80) {
        shared.push('High empathy match 🔥');
      }
      
      insights[profile.id] = shared;
    });
    
    setSharedInsights(insights);
  };

  const loadBondPrintScores = async (profileList: Profile[]) => {
    if (!userProfile?.bondPrint || !accessToken) return;
    
    const scores: Record<string, number> = {};
    
    const { BOND_PRINT_LIMITS } = await import('../config/app-config');
    const profilesToCheck = profileList.slice(0, BOND_PRINT_LIMITS.MAX_PARALLEL_CHECKS);
    
    await Promise.all(
      profilesToCheck.map(async (profile) => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/bond-print/compatibility/${profile.id}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.score !== undefined && data.score > 0) {
              scores[profile.id] = data.score;
            }
          }
        } catch (error) {
          // Silently fail
        }
      })
    );
    
    setBondPrintScores(scores);
    calculateSharedInsights(profileList);
  };

  const availableMajors = useMemo(() => {
    const majors = new Set<string>();
    profiles.forEach(p => {
      if (p.major) majors.add(p.major);
    });
    return Array.from(majors).sort();
  }, [profiles]);

  const availablePersonalityTypes = useMemo(() => {
    const types = new Set<string>();
    profiles.forEach(p => {
      p.personality?.forEach((t: string) => types.add(t));
      p.bondPrint?.personality?.type && types.add(p.bondPrint.personality.type);
    });
    return Array.from(types).sort();
  }, [profiles]);

  const availableInterests = useMemo(() => {
    const interests = new Set<string>();
    profiles.forEach(p => {
      p.interests?.forEach((i: string) => interests.add(i));
    });
    return Array.from(interests).sort();
  }, [profiles]);

  const availableAcademicGoals = useMemo(() => {
    const goals = new Set<string>();
    profiles.forEach(p => {
      p.goals?.academic?.forEach((g: string) => goals.add(g));
    });
    return Array.from(goals).sort();
  }, [profiles]);

  const availableLeisureGoals = useMemo(() => {
    const goals = new Set<string>();
    profiles.forEach(p => {
      p.goals?.leisure?.forEach((g: string) => goals.add(g));
    });
    return Array.from(goals).sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    let filtered = profiles.filter((profile) => {
      const matchesSearch = searchQuery === '' ||
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.interests?.some((interest: string) =>
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMajor = filters.major === 'all' || profile.major === filters.major;
      const matchesYear = filters.year === 'all' || profile.year === filters.year;
      
      const lookingForValue = filters.lookingFor.toLowerCase().replace(/\s+/g, '-');
      const matchesLookingFor = filters.lookingFor === 'all' ||
        profile.lookingFor?.includes(lookingForValue);

      const academicGoalValue = filters.academicGoal.toLowerCase().replace(/\s+/g, '-');
      const matchesAcademicGoal = filters.academicGoal === 'all' ||
        profile.goals?.academic?.some((g: string) => g.toLowerCase().includes(academicGoalValue));

      const leisureGoalValue = filters.leisureGoal.toLowerCase().replace(/\s+/g, '-');
      const matchesLeisureGoal = filters.leisureGoal === 'all' ||
        profile.goals?.leisure?.some((g: string) => g.toLowerCase().includes(leisureGoalValue));

      const matchesPersonality = filters.personalityType === 'all' ||
        profile.personality?.includes(filters.personalityType) ||
        profile.bondPrint?.personality?.type === filters.personalityType;

      const matchesInterest = filters.interest === 'all' ||
        profile.interests?.includes(filters.interest);

      // Mode filter
      let matchesMode = true;
      if (activeMode === 'love') {
        matchesMode = profile.scrapbookEnabled === true;
      } else if (filters.mode && filters.mode !== 'all') {
        if (filters.mode === 'scrapbook') {
          matchesMode = profile.scrapbookEnabled === true;
        } else if (filters.mode === 'roommate') {
          matchesMode = profile.roommateMode === true;
        } else if (filters.mode === 'friend') {
          matchesMode = !profile.scrapbookEnabled && !profile.roommateMode;
        }
      }

      return matchesSearch && matchesMajor && matchesYear && matchesLookingFor &&
        matchesAcademicGoal && matchesLeisureGoal && matchesPersonality && matchesInterest && matchesMode;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (filters.sortBy === 'compatibility') {
        const scoreA = bondPrintScores[a.id] || 0;
        const scoreB = bondPrintScores[b.id] || 0;
        return scoreB - scoreA;
      } else if (filters.sortBy === 'vibe') {
        const scoreA = bondPrintScores[a.id] || 50;
        const scoreB = bondPrintScores[b.id] || 50;
        const targetVibe = vibeSort[0];
        return Math.abs(scoreA - targetVibe) - Math.abs(scoreB - targetVibe);
      } else if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return filtered;
  }, [profiles, searchQuery, filters, bondPrintScores, vibeSort, activeMode]);

  const handleProfileClick = (index: number) => {
    const profile = filteredProfiles[index];
    const originalIndex = profiles.findIndex(p => p.id === profile.id);
    setSelectedProfileIndex(originalIndex);
    onProfileDetailOpen?.(true);
  };

  const handleClose = () => {
    setSelectedProfileIndex(null);
    onProfileDetailOpen?.(false);
  };

  const handleNext = () => {
    if (selectedProfileIndex !== null && selectedProfileIndex < profiles.length - 1) {
      setSelectedProfileIndex(selectedProfileIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedProfileIndex !== null && selectedProfileIndex > 0) {
      setSelectedProfileIndex(selectedProfileIndex - 1);
    }
  };

  if (selectedProfileIndex !== null) {
    return (
      <ProfileDetailView
        profile={profiles[selectedProfileIndex]}
        onClose={handleClose}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={selectedProfileIndex < profiles.length - 1}
        hasPrev={selectedProfileIndex > 0}
        accessToken={accessToken}
        currentIndex={selectedProfileIndex}
        totalProfiles={profiles.length}
      />
    );
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2841 50%, #0f4d5c 100%)',
          fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <ProfileGridSkeleton />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .yearbook-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 768px) {
          .yearbook-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 12px !important;
          }
          .main-content-yearbook {
            padding-top: 240px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
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
            radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-[1000] backdrop-blur-[20px] border-b border-white/10"
        style={{
          background: 'rgba(10, 22, 40, 0.9)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Bonded_transparent_icon.png"
              alt="Bonded logo"
              className="w-10 h-10"
            />
            <h1
              className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
            >
              bonded
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Campus Banner */}
      <div
        className="fixed top-[72px] left-0 right-0 z-[999] backdrop-blur-[10px] border-b border-teal-500/20 py-3 px-5"
        style={{
          background: 'rgba(16, 185, 129, 0.1)',
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-base font-bold text-white">
              {userProfile?.school || 'Your School'}
            </div>
            <div className="text-[13px] text-white/60 flex items-center gap-2">
              <span>{filteredProfiles.length} Students</span>
              <span>•</span>
              <span>Campus</span>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-xs font-semibold text-teal-300 border border-teal-500/30"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
            }}
          >
            <div
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
            />
            <span>Active Community</span>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      {isFeatureEnabled('LOVE_MODE_ENABLED') && (
        <div
          className="fixed top-[144px] left-1/2 transform -translate-x-1/2 z-[998] flex gap-3 backdrop-blur-[20px] border border-white/15 rounded-[24px] p-1.5"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setActiveMode('friend')}
            className={`px-6 py-2.5 rounded-[18px] border-none font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'friend'
                ? 'text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            style={
              activeMode === 'friend'
                ? {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }
                : {}
            }
          >
            <span>👋</span>
            <span>Friend Mode</span>
          </button>
          <button
            onClick={() => setActiveMode('love')}
            className={`px-6 py-2.5 rounded-[18px] border-none font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'love'
                ? 'text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            style={
              activeMode === 'love'
                ? {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }
                : {}
            }
          >
            <span>💕</span>
            <span>Love Mode</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 z-[998] px-5 py-3 backdrop-blur-[20px] border-b border-white/10"
            style={{
              background: 'rgba(10, 22, 40, 0.95)',
            }}
          >
            <div className="max-w-[1200px] mx-auto">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-teal-500/50"
                style={{
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 z-[998] px-5 py-4 backdrop-blur-[20px] border-b border-white/10 overflow-y-auto max-h-[60vh]"
            style={{
              background: 'rgba(10, 22, 40, 0.95)',
            }}
          >
            <div className="max-w-[1200px] mx-auto space-y-3">
              <EnhancedSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onFiltersChange={setFilters}
                availableMajors={availableMajors}
                availableAcademicGoals={availableAcademicGoals}
                availableLeisureGoals={availableLeisureGoals}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.personalityType}
                  onChange={(e) => setFilters({ ...filters, personalityType: e.target.value })}
                  className="text-sm rounded-xl border border-white/20 px-3 py-2 bg-white/5 text-white"
                >
                  <option value="all">All Personality Types</option>
                  {availablePersonalityTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  value={filters.interest}
                  onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                  className="text-sm rounded-xl border border-white/20 px-3 py-2 bg-white/5 text-white"
                >
                  <option value="all">All Interests</option>
                  {availableInterests.map((interest) => (
                    <option key={interest} value={interest}>{interest}</option>
                  ))}
                </select>
                
                <select
                  value={filters.mode}
                  onChange={(e) => setFilters({ ...filters, mode: e.target.value as any })}
                  className="text-sm rounded-xl border border-white/20 px-3 py-2 bg-white/5 text-white"
                >
                  <option value="all">All Modes</option>
                  <option value="scrapbook">💞 Scrapbook</option>
                  <option value="roommate">🏠 Roommate</option>
                  <option value="friend">👋 Friend</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Chill</span>
                  <span>Extroverted</span>
                  <span>Deep</span>
                  <span>Creative</span>
                </div>
                <Slider
                  value={vibeSort}
                  onValueChange={setVibeSort}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueCommit={() => setFilters({ ...filters, sortBy: 'vibe' })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="main-content-yearbook flex-1 pt-[220px] pb-24 relative z-[1] max-w-[1200px] mx-auto w-full px-5"
      >
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16 text-white">
            <div className="text-6xl mb-5">📖</div>
            <h3 className="text-2xl font-bold mb-3">No profiles found</h3>
            <p className="text-[15px] text-white/60 mb-6">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div
            className="yearbook-grid grid w-full gap-5"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {filteredProfiles.map((profile, index) => (
              <YearbookGridCard
                key={profile.id}
                profile={{
                  id: profile.id,
                  name: profile.name,
                  age: profile.age,
                  pronouns: profile.pronouns,
                  year: profile.year,
                  profilePicture: profile.profilePicture,
                  photos: profile.photos || (profile.profilePicture ? [profile.profilePicture] : []),
                  interests: profile.interests,
                  personality: profile.personality,
                  bondPrint: profile.bondPrint,
                  scrapbookEnabled: profile.scrapbookEnabled,
                  roommateMode: profile.roommateMode,
                }}
                onClick={() => handleProfileClick(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
