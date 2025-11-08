import { useState, useEffect } from 'react';
import { ProfileCard } from './ProfileCard';
import { ProfileDetail } from './ProfileDetail';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Filter, Users } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Skeleton } from './ui/skeleton';

interface ProfileGridProps {
  userProfile: any;
  accessToken: string;
}

export function ProfileGrid({ userProfile, accessToken }: ProfileGridProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLookingFor, setFilterLookingFor] = useState('all');

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, searchQuery, filterLookingFor]);

  const loadProfiles = async () => {
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
        // Filter out current user
        const otherProfiles = data.filter((p: any) => p.id !== userProfile.id);
        setProfiles(otherProfiles);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.major?.toLowerCase().includes(query) ||
          p.bio?.toLowerCase().includes(query) ||
          p.interests?.some((i: string) => i.toLowerCase().includes(query))
      );
    }

    // Looking for filter
    if (filterLookingFor !== 'all') {
      filtered = filtered.filter((p) =>
        p.lookingFor?.includes(filterLookingFor)
      );
    }

    setFilteredProfiles(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg">Find Students at {userProfile.school}</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, major, interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterLookingFor} onValueChange={setFilterLookingFor}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="Roommate">Looking for Roommate</SelectItem>
                <SelectItem value="Friends">Looking for Friends</SelectItem>
                <SelectItem value="Study Buddies">Study Buddies</SelectItem>
                <SelectItem value="Community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{filteredProfiles.length} students found</span>
          </div>
        </div>

        {/* Profile Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-600 mb-2">No profiles found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedProfile(profile)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetail
          profile={selectedProfile}
          userProfile={userProfile}
          accessToken={accessToken}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
}
