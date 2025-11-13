import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { projectId } from '../utils/supabase/config';
import { ProfileGridSkeleton } from './LoadingSkeletons';
import { EmptyState } from './EmptyStates';
import { apiGet } from '../utils/api-client';
import { EnhancedSearch } from './EnhancedSearch';
import { toast } from 'sonner';
import { getProfileCardAriaLabel, handleGridKeyDown } from '../utils/accessibility';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { getProfileEmoji, getTagColor } from '../utils/emoji-mapper';

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
      <div className="min-h-screen bg-transparent">
        <div className="sticky top-0 bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-3 z-10">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl text-white lowercase font-bold tracking-wide">
              Yearbook
            </h1>
          </div>
        </div>
        <ProfileGridSkeleton />
      </div>
    );
  }

  // Get pronouns from profile (if available)
  const getPronouns = (profile: Profile): string => {
    // Try to get from profile data, default to he/him
    return (profile as any).pronouns || 'he/him';
  };

  // Get tags for display (interests + personality)
  const getDisplayTags = (profile: Profile): string[] => {
    const tags: string[] = [];
    if (profile.personality && profile.personality.length > 0) {
      tags.push(...profile.personality.slice(0, 1));
    }
    if (profile.interests && profile.interests.length > 0) {
      tags.push(...profile.interests.slice(0, 1));
    }
    if (profile.personality && profile.personality.length > 1) {
      tags.push(profile.personality[1]);
    }
    return tags.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Enhanced Search and Filter Bar */}
      <div className="sticky top-0 bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-3 z-10">
        <EnhancedSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          availableMajors={availableMajors}
          availableAcademicGoals={availableAcademicGoals}
          availableLeisureGoals={availableLeisureGoals}
        />
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="overflow-x-auto pb-4 pt-4" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
          {filteredProfiles.map((profile, index) => {
            const bondPrintScore = bondPrintScores[profile.id];
            const emoji = getProfileEmoji(profile);
            const tags = getDisplayTags(profile);
            const pronouns = getPronouns(profile);
            const totalProfiles = filteredProfiles.length;
            
            return (
              <div
                key={profile.id}
                style={{ scrollSnapAlign: 'start', minWidth: '280px', maxWidth: '280px' }}
                className="relative"
              >
                <button
                  onClick={() => handleProfileClick(index)}
                  onKeyDown={(e) => handleGridKeyDown(
                    e,
                    () => handleProfileClick(index),
                    index < filteredProfiles.length - 1 ? () => handleProfileClick(index + 1) : undefined,
                    index > 0 ? () => handleProfileClick(index - 1) : undefined
                  )}
                  aria-label={getProfileCardAriaLabel(profile)}
                  className="relative w-full h-[500px] overflow-hidden bg-gradient-to-br from-[#1E4F74] via-[#2E7B91] to-[#1E4F74] rounded-3xl shadow-2xl hover:shadow-[#2E7B91]/50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2E7B91] focus:ring-offset-2"
                >
                  {/* Top Left - Friend Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-xs font-semibold">Friend</span>
                  </div>

                  {/* Top Right - Pagination */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-white/80 text-xs font-medium">
                      {index + 1}/{totalProfiles}
                    </span>
                  </div>

                  {/* Center - Large Emoji */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-9xl" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
                      {emoji}
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                    {/* Name and Age */}
                    <div className="mb-3">
                      <p className="text-white text-xl font-bold mb-1">
                        {profile.name} {profile.age || 20}
                      </p>
                      <p className="text-white/70 text-sm">
                        {pronouns} • {profile.year || 'Student'}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, tagIndex) => {
                        const displayTag = tag.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ');
                        return (
                          <span
                            key={tagIndex}
                            className={`${getTagColor(tag, tagIndex)} text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg`}
                          >
                            {displayTag}
                          </span>
                        );
                      })}
                    </div>

                    {/* Bond Print Score Badge (if high match) */}
                    {bondPrintScore && bondPrintScore >= 70 && (
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2E7B91] to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {bondPrintScore}% Match
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredProfiles.length === 0 && !loading && (
        <div className="flex items-center justify-center h-96">
          <EmptyState type="no-profiles" />
        </div>
      )}
    </div>
  );
}
