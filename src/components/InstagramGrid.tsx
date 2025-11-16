import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Filter, ChevronDown, ChevronUp, X, Users, Camera, CheckCircle2, Plus } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { projectId } from '../utils/supabase/config';
import { ProfileGridSkeleton } from './LoadingSkeletons';
import { EmptyState } from './EmptyStates';
import { apiGet } from '../utils/api-client';
import { EnhancedSearch } from './EnhancedSearch';
import { toast } from 'sonner';
import { getProfileCardAriaLabel, handleGridKeyDown } from '../utils/accessibility';
import { useUserProfile, useAccessToken } from '../store/useAppStore';

interface InstagramGridProps {
  onProfileDetailOpen?: (isOpen: boolean) => void; // Callback to notify parent
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
}



export function InstagramGrid({ onProfileDetailOpen }: InstagramGridProps) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    major: 'all',
    year: 'all',
    lookingFor: 'all',
    academicGoal: 'all',
    leisureGoal: 'all',
    sortBy: 'newest' as 'newest' | 'compatibility' | 'name',
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [bondPrintScores, setBondPrintScores] = useState<Record<string, number>>({});
  const [showFilters, setShowFilters] = useState(false);

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
      
      // Filter out current user and blocked users, map to expected format
      const userBlocked = userProfile.blockedUsers || [];
      const otherProfiles = data
        .filter((p: any) => p.id !== userProfile.id && !userBlocked.includes(p.id))
        .map((p: any) => ({
          ...p,
          imageUrl: p.profilePicture || p.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
          age: p.age || 20, // Default age if not provided
        }));
      
      setProfiles(otherProfiles);
      
      // Load Bond Print compatibility scores for all profiles
      if (userProfile.bondPrint) {
        loadBondPrintScores(otherProfiles);
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

  const loadBondPrintScores = async (profileList: Profile[]) => {
    if (!userProfile?.bondPrint || !accessToken) return;
    
    const scores: Record<string, number> = {};
    
    // Batch fetch compatibility scores (limit to avoid too many requests)
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
            // Handle both score format and error format
            if (data.score !== undefined && data.score > 0) {
              scores[profile.id] = data.score;
            }
          } else if (response.status === 404) {
            // Profile or Bond Print not found - skip silently
            // This is expected for users without Bond Prints
          }
        } catch (error) {
          // Silently fail - not all users will have Bond Prints
          // Don't log errors for missing Bond Prints
        }
      })
    );
    
    setBondPrintScores(scores);
  };

  // Extract unique values for filter options
  const availableMajors = useMemo(() => {
    const majors = new Set<string>();
    profiles.forEach(p => {
      if (p.major) majors.add(p.major);
    });
    return Array.from(majors).sort();
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
      // Search filter
      const matchesSearch = searchQuery === '' ||
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.interests?.some((interest: string) =>
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      // Major filter
      const matchesMajor = filters.major === 'all' || profile.major === filters.major;

      // Year filter
      const matchesYear = filters.year === 'all' || profile.year === filters.year;

      // Looking For filter
      const lookingForValue = filters.lookingFor.toLowerCase().replace(/\s+/g, '-');
      const matchesLookingFor = filters.lookingFor === 'all' ||
        profile.lookingFor?.includes(lookingForValue);

      // Academic Goal filter
      const academicGoalValue = filters.academicGoal.toLowerCase().replace(/\s+/g, '-');
      const matchesAcademicGoal = filters.academicGoal === 'all' ||
        profile.goals?.academic?.some((g: string) => g.toLowerCase().includes(academicGoalValue));

      // Leisure Goal filter
      const leisureGoalValue = filters.leisureGoal.toLowerCase().replace(/\s+/g, '-');
      const matchesLeisureGoal = filters.leisureGoal === 'all' ||
        profile.goals?.leisure?.some((g: string) => g.toLowerCase().includes(leisureGoalValue));

      return matchesSearch && matchesMajor && matchesYear && matchesLookingFor &&
        matchesAcademicGoal && matchesLeisureGoal;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (filters.sortBy === 'compatibility') {
        const scoreA = bondPrintScores[a.id] || 0;
        const scoreB = bondPrintScores[b.id] || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
      } else if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // 'newest' - keep original order (already sorted by load order)
      return 0;
    });

    return filtered;
  }, [profiles, searchQuery, filters, bondPrintScores]);

  const handleProfileClick = (index: number) => {
    // Map back to original index
    const profile = filteredProfiles[index];
    const originalIndex = profiles.findIndex(p => p.id === profile.id);
    setSelectedProfileIndex(originalIndex);
    onProfileDetailOpen?.(true); // Notify parent that profile detail is open
  };

  const handleClose = () => {
    setSelectedProfileIndex(null);
    onProfileDetailOpen?.(false); // Notify parent that profile detail is closed
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
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <ProfileGridSkeleton />
      </div>
    );
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== 'all' && v !== 'All'
  ).length;

  const clearFilters = () => {
    setFilters({
      major: 'all',
      year: 'all',
      lookingFor: 'all',
      academicGoal: 'all',
      leisureGoal: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Stats Bar with Expandable Filters */}
      <div className="mx-4 mt-3 mb-3">
        <div className="bg-gray-900/80 rounded-2xl px-4 py-3 border border-gray-700/30">
          <div className="flex items-center justify-between">
            {/* Student Counter */}
            <div className="text-center">
              <p className="font-semibold text-teal-blue">{filteredProfiles.length}</p>
              <p className="text-xs text-gray-400">Students</p>
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-teal-blue text-white'
                  : 'bg-gray-800/50 text-soft-cream/70'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="mt-2 bg-gray-900/80 rounded-2xl p-4 border border-gray-700/30">
            <EnhancedSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              availableMajors={availableMajors}
              availableAcademicGoals={availableAcademicGoals}
              availableLeisureGoals={availableLeisureGoals}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 text-soft-cream/70 rounded-full text-sm font-medium hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid - Card Style */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {filteredProfiles.map((profile, index) => {
          const bondPrintScore = bondPrintScores[profile.id];
          const isHighMatch = bondPrintScore && bondPrintScore >= 70;
          const isMediumMatch = bondPrintScore && bondPrintScore >= 50 && bondPrintScore < 70;
          
          return (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(index)}
              onKeyDown={(e) => handleGridKeyDown(
                e,
                () => handleProfileClick(index),
                index < filteredProfiles.length - 1 ? () => handleProfileClick(index + 1) : undefined,
                index > 0 ? () => handleProfileClick(index - 1) : undefined
              )}
              aria-label={getProfileCardAriaLabel(profile)}
              className={`relative overflow-hidden bg-gray-900/90 rounded-2xl border border-gray-700/50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-blue transition-all ${
                isHighMatch 
                  ? 'ring-2 ring-teal-blue/50' 
                  : isMediumMatch 
                  ? 'ring-1 ring-ocean-blue/50'
                  : ''
              }`}
            >
              {/* Profile Picture - Top Section */}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                {/* Verified Badge - Top Right */}
                {bondPrintScore && bondPrintScore >= 70 && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                {/* Name with Verified Badge */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-soft-cream truncate">{profile.name}</h3>
                  {bondPrintScore && bondPrintScore >= 70 && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>

                {/* Bio/Profession */}
                {profile.bio && (
                  <p className="text-sm text-soft-cream/70 line-clamp-2 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                {!profile.bio && profile.major && (
                  <p className="text-sm text-soft-cream/70">
                    {profile.major} {profile.year && `• ${profile.year}`}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-700/50">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-soft-cream/60" />
                    <span className="text-sm font-medium text-soft-cream">
                      {profile.connectionsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-soft-cream/60" />
                    <span className="text-sm font-medium text-soft-cream">
                      {profile.postsCount || 0}
                    </span>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle follow action
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/70 hover:bg-gray-700/70 text-soft-cream rounded-full text-sm font-medium transition-colors border border-gray-700/50"
                >
                  <Plus className="w-4 h-4" />
                  Connect
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
