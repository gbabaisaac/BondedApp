import { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-[#F9F6F3]">
        <div className="sticky top-0 bg-white border-b border-[#EAEAEA] px-4 py-3 z-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src="/Bonded_transparent_icon.png" 
              alt="bonded logo" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl text-[#1E4F74] lowercase font-bold tracking-wide">
              bonded
            </h1>
          </div>
        </div>
        <ProfileGridSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F3]">
      {/* Enhanced Search and Filter Bar - positioned below top banner */}
      <div className="sticky top-[60px] bg-white border-b border-[#EAEAEA] px-4 py-3 z-10">
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

      {/* Stats Bar */}
      <div className="bg-white border-b px-4 py-3 flex justify-around text-center">
        <div>
          <p className="font-semibold text-[#2E7B91]">{filteredProfiles.length}</p>
          <p className="text-xs text-[#475569]">Students</p>
        </div>
        <div>
          <p className="font-semibold">{userProfile?.school || 'Your School'}</p>
          <p className="text-xs text-[#475569]">University</p>
        </div>
        <div>
          <p className="font-semibold text-green-600">Active</p>
          <p className="text-xs text-[#475569]">Community</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 p-3">
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
              className={`relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#2E7B91] focus:ring-offset-2 ${
                isHighMatch 
                  ? 'ring-2 ring-[#2E7B91] ring-offset-2' 
                  : isMediumMatch 
                  ? 'ring-1 ring-[#25658A]'
                  : ''
              }`}
            >
              {/* Bond Print Badge */}
              {bondPrintScore && bondPrintScore >= 50 && (
                <div className={`absolute top-2 right-2 z-10 ${
                  isHighMatch 
                    ? 'bg-gradient-to-r from-[#2E7B91] to-[#B69CFF]' 
                    : 'bg-[#25658A]'
                } text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                  <Sparkles className="w-3 h-3" />
                  {bondPrintScore}% Match
                </div>
              )}
              
              <div className="aspect-[3/4] relative">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white text-left">
                  <p className="text-sm font-semibold truncate">{profile.name}</p>
                  <p className="text-xs text-gray-200 truncate">{profile.major}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {profile.lookingFor?.slice(0, 2).map((item: string, i: number) => {
                      // Convert normalized format (study-partner) to display format (Study Partner)
                      const displayText = item.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
                      return (
                        <span key={i} className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
                          {displayText}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
