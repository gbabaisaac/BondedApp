import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { projectId } from '../utils/supabase/info';
import { ProfileGridSkeleton } from './LoadingSkeletons';

interface InstagramGridProps {
  userProfile?: any;
  accessToken?: string;
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



export function InstagramGrid({ userProfile, accessToken }: InstagramGridProps) {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLookingFor, setFilterLookingFor] = useState<string>('All');
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profiles?school=${encodeURIComponent(userProfile.school)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter out current user and map to expected format
        const otherProfiles = data
          .filter((p: any) => p.id !== userProfile.id)
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
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBondPrintScores = async (profileList: Profile[]) => {
    if (!userProfile?.bondPrint || !accessToken) return;
    
    const scores: Record<string, number> = {};
    
    // Batch fetch compatibility scores (limit to avoid too many requests)
    const profilesToCheck = profileList.slice(0, 20); // Check first 20
    
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
            if (data.score > 0) {
              scores[profile.id] = data.score;
            }
          }
        } catch (error) {
          console.error(`Error loading Bond Print score for ${profile.id}:`, error);
        }
      })
    );
    
    setBondPrintScores(scores);
  };

  const filteredProfiles = profiles
    .filter(profile => {
      const matchesSearch = searchQuery === '' || 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterLookingFor === 'All' || 
        profile.lookingFor.some(lf => lf.toLowerCase().includes(filterLookingFor.toLowerCase()));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort by Bond Print score (highest first), then by name
      const scoreA = bondPrintScores[a.id] || 0;
      const scoreB = bondPrintScores[b.id] || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return a.name.localeCompare(b.name);
    });

  const handleProfileClick = (index: number) => {
    // Map back to original index
    const profile = filteredProfiles[index];
    const originalIndex = profiles.findIndex(p => p.id === profile.id);
    setSelectedProfileIndex(originalIndex);
  };

  const handleClose = () => {
    setSelectedProfileIndex(null);
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
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
          <h1 className="text-2xl text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            bonded
          </h1>
        </div>
        <ProfileGridSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          bonded
        </h1>
        
        {/* Search and Filter */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterLookingFor}
            onChange={(e) => setFilterLookingFor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All</option>
            <option value="Friends">Friends</option>
            <option value="Roommate">Roommate</option>
            <option value="Study Buddies">Study Buddies</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b px-4 py-3 flex justify-around text-center">
        <div>
          <p className="font-semibold text-indigo-600">{filteredProfiles.length}</p>
          <p className="text-xs text-gray-600">Students</p>
        </div>
        <div>
          <p className="font-semibold">{userProfile?.school || 'Your School'}</p>
          <p className="text-xs text-gray-600">University</p>
        </div>
        <div>
          <p className="font-semibold text-green-600">Active</p>
          <p className="text-xs text-gray-600">Community</p>
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
              className={`relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all ${
                isHighMatch 
                  ? 'ring-2 ring-purple-500 ring-offset-2' 
                  : isMediumMatch 
                  ? 'ring-1 ring-purple-300'
                  : ''
              }`}
            >
              {/* Bond Print Badge */}
              {bondPrintScore && bondPrintScore >= 50 && (
                <div className={`absolute top-2 right-2 z-10 ${
                  isHighMatch 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-purple-500'
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
                    {profile.lookingFor?.slice(0, 2).map((item: string, i: number) => (
                      <span key={i} className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {item}
                      </span>
                    ))}
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
