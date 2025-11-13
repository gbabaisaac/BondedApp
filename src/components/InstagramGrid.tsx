import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Heart, Music, Instagram, Music2, Camera, Filter, SlidersHorizontal } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { projectId } from '../utils/supabase/config';
import { ProfileGridSkeleton } from './LoadingSkeletons';
import { EmptyState } from './EmptyStates';
import { apiGet } from '../utils/api-client';
import { EnhancedSearch } from './EnhancedSearch';
import { toast } from 'sonner';
import { getProfileCardAriaLabel, handleGridKeyDown } from '../utils/accessibility';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

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
}

export function InstagramGrid({ onProfileDetailOpen }: InstagramGridProps) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [vibeSort, setVibeSort] = useState([50]); // 0 = Chill, 100 = Extroverted
  const [filters, setFilters] = useState({
    major: 'all',
    year: 'all',
    lookingFor: 'all',
    academicGoal: 'all',
    leisureGoal: 'all',
    personalityType: 'all',
    interest: 'all',
    musicTaste: 'all',
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
      
      // Shared interests
      const sharedInterests = profile.interests?.filter((i: string) => 
        userProfile?.interests?.includes(i)
      ) || [];
      if (sharedInterests.length >= 3) {
        shared.push(`${sharedInterests.length} shared interests`);
      }
      
      // Similar sleep schedule
      if (profile.sleepSchedule && userProfile?.livingHabits?.sleepSchedule === profile.sleepSchedule) {
        shared.push('Similar sleep schedule');
      }
      
      // Shared goals
      const sharedAcademic = profile.goals?.academic?.filter((g: string) =>
        userProfile?.goals?.academic?.includes(g)
      ) || [];
      if (sharedAcademic.length > 0) {
        shared.push('Shared academic goals');
      }
      
      // High empathy match
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
    // Recalculate insights after scores load
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

  const getPersonalityTags = (profile: Profile): string[] => {
    const tags: string[] = [];
    
    // Personality type from Bond Print
    if (profile.bondPrint?.personality?.type) {
      const type = profile.bondPrint.personality.type;
      const typeMap: Record<string, string> = {
        'introvert': '🧠 The Thinker',
        'extrovert': '🌟 The Explorer',
        'ambivert': '⚖️ The Balancer',
        'analytical': '🔬 The Builder',
        'creative': '🎨 The Creator',
        'empath': '💝 The Empath',
      };
      tags.push(typeMap[type] || `🧠 ${type}`);
    }
    
    // Personality traits
    profile.personality?.slice(0, 2).forEach((trait: string) => {
      tags.push(trait);
    });
    
    return tags;
  };

  const getVibeTags = (profile: Profile): string[] => {
    const tags: string[] = [];
    
    // Interests (music, aesthetic, etc.)
    profile.interests?.slice(0, 3).forEach((interest: string) => {
      const interestMap: Record<string, string> = {
        'music': '🎵 Music',
        'indie': '🎵 Indie',
        'r&b': '🎵 R&B',
        'house': '🎵 House',
        'travel': '✈️ Travel',
        'gaming': '🎮 Gaming',
        'design': '🎨 Design',
        'fashion': '👗 Fashion',
        'fitness': '💪 Fitness',
      };
      tags.push(interestMap[interest.toLowerCase()] || interest);
    });
    
    // Vibe words from Bond Print
    if (profile.bondPrint?.traits) {
      const vibeWords = ['Chill', 'Ambitious', 'Funny', 'Deep', 'Creative', 'Adventurous'];
      vibeWords.forEach((word) => {
        if (profile.bondPrint.traits[word.toLowerCase()]) {
          tags.push(word);
        }
      });
    }
    
    return tags;
  };

  const getModeIndicator = (profile: Profile) => {
    // Check if they're in love mode (would need to check their mode preference)
    // For now, default to friend mode
    return '🫱 Friend Mode';
  };

  const getQuote = (profile: Profile): string => {
    if (profile.bio) {
      return profile.bio.length > 60 ? profile.bio.substring(0, 60) + '...' : profile.bio;
    }
    // Generate AI quote if no bio (would need backend call)
    return 'Late-night thinker, early-morning texter.';
  };

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

      return matchesSearch && matchesMajor && matchesYear && matchesLookingFor &&
        matchesAcademicGoal && matchesLeisureGoal && matchesPersonality && matchesInterest;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (filters.sortBy === 'compatibility') {
        const scoreA = bondPrintScores[a.id] || 0;
        const scoreB = bondPrintScores[b.id] || 0;
        return scoreB - scoreA;
      } else if (filters.sortBy === 'vibe') {
        // Sort by vibe slider position (would need vibe score calculation)
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
  }, [profiles, searchQuery, filters, bondPrintScores, vibeSort]);

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
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-navy-50">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-teal-200/50 px-4 py-3 z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src="/Bonded_transparent_icon.png" 
              alt="bonded logo" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-navy-600 bg-clip-text text-transparent">
              The Yearbook
            </h1>
          </div>
        </div>
        <ProfileGridSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-blue-50 to-navy-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-teal-200/50 px-4 py-3 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img 
              src="/Bonded_transparent_icon.png" 
              alt="bonded logo" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-navy-600 bg-clip-text text-transparent">
              The Yearbook
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full hover:bg-teal-100"
          >
            <SlidersHorizontal className="w-5 h-5 text-teal-600" />
          </Button>
        </div>
        
        {/* Filter Bar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t border-teal-200/50"
          >
            <EnhancedSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              availableMajors={availableMajors}
              availableAcademicGoals={availableAcademicGoals}
              availableLeisureGoals={availableLeisureGoals}
            />
            
            {/* Additional Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.personalityType}
                onChange={(e) => setFilters({ ...filters, personalityType: e.target.value })}
                className="text-sm rounded-xl border border-teal-200 px-3 py-2 bg-white/80"
              >
                <option value="all">All Personality Types</option>
                {availablePersonalityTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={filters.interest}
                onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                className="text-sm rounded-xl border border-teal-200 px-3 py-2 bg-white/80"
              >
                <option value="all">All Interests</option>
                {availableInterests.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
            </div>
            
            {/* Vibe Sort Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Chill</span>
                <span className="text-gray-600">Extroverted</span>
                <span className="text-gray-600">Deep</span>
                <span className="text-gray-600">Creative</span>
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
          </motion.div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-teal-200/30 px-4 py-3 flex justify-around text-center">
        <div>
          <p className="font-semibold text-teal-600">{filteredProfiles.length}</p>
          <p className="text-xs text-gray-600">Students</p>
        </div>
        <div>
          <p className="font-semibold text-navy-600">{userProfile?.school || 'Your School'}</p>
          <p className="text-xs text-gray-600">Campus</p>
        </div>
        <div>
          <p className="font-semibold text-green-600">Active</p>
          <p className="text-xs text-gray-600">Community</p>
        </div>
      </div>

      {/* Grid - New Profile Card Design */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {filteredProfiles.map((profile, index) => {
          const bondPrintScore = bondPrintScores[profile.id];
          const isHighMatch = bondPrintScore && bondPrintScore >= 70;
          const personalityTags = getPersonalityTags(profile);
          const vibeTags = getVibeTags(profile);
          const allTags = [...personalityTags, ...vibeTags].slice(0, 4);
          const insights = sharedInsights[profile.id] || [];
          
          return (
            <motion.button
              key={profile.id}
              onClick={() => handleProfileClick(index)}
              onKeyDown={(e) => handleGridKeyDown(
                e,
                () => handleProfileClick(index),
                index < filteredProfiles.length - 1 ? () => handleProfileClick(index + 1) : undefined,
                index > 0 ? () => handleProfileClick(index - 1) : undefined
              )}
              aria-label={getProfileCardAriaLabel(profile)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden bg-white rounded-[18px] shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 ${
                isHighMatch 
                  ? 'ring-2 ring-teal-400 ring-offset-2' 
                  : ''
              }`}
            >
              {/* Bond Print Badge */}
              {bondPrintScore && bondPrintScore >= 50 && (
                <div className={`absolute top-3 right-3 z-10 ${
                  isHighMatch 
                    ? 'bg-gradient-to-r from-teal-500 to-navy-500' 
                    : 'bg-teal-500'
                } text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                  <Sparkles className="w-3 h-3" />
                  {bondPrintScore}% Match
                </div>
              )}
              
              {/* Profile Photo - Rounded Square with Teal Ring */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-teal-100 to-navy-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden ring-4 ${
                      isHighMatch ? 'ring-teal-400 animate-pulse' : 'ring-teal-300'
                    } shadow-xl`}>
                      <img
                        src={profile.imageUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
                
                {/* Mode Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-medium text-teal-700">
                  {getModeIndicator(profile)}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                {/* Tag Row */}
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="text-[10px] bg-gradient-to-r from-lavender-100 to-peach-100 text-gray-700 px-2 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Bottom Overlay Gradient Section */}
                <div className="bg-gradient-to-br from-teal-600 to-navy-600 rounded-xl p-3 text-white space-y-1.5">
                  <div>
                    <p className="font-bold text-sm">{profile.name.split(' ')[0]}</p>
                    {profile.pronouns && (
                      <p className="text-[10px] text-teal-100">{profile.pronouns}</p>
                    )}
                  </div>
                  <p className="text-xs text-teal-50 italic line-clamp-2">
                    "{getQuote(profile)}"
                  </p>
                </div>

                {/* Social Links */}
                {(profile.instagram || profile.spotify || profile.socialConnections?.spotify || profile.socialConnections?.linkedin) && (
                  <div className="flex items-center gap-2 justify-center">
                    {profile.instagram && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {(profile.spotify || profile.socialConnections?.spotify) && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <Music2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Bonded Insights */}
                {insights.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {insights.slice(0, 2).map((insight, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200"
                      >
                        {insight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredProfiles.length === 0 && (
        <EmptyState
          type="no-profiles"
          description="No profiles match your filters. Try adjusting your search."
        />
      )}
    </div>
  );
}
