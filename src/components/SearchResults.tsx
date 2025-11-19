import { useState, useEffect } from 'react';
import { Search, Loader2, User, MessageSquare, Users, BookOpen } from 'lucide-react';
import { globalSearch } from '../utils/api-client';
import { useAccessToken } from '../store/useAppStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../utils/logger';
import { SearchResponse } from '../types/api';

interface SearchResultsProps {
  searchQuery: string;
  searchType: 'all' | 'students' | 'posts';
}

interface SearchResult {
  users: Array<{
    id: string;
    name: string;
    major?: string;
    year?: string;
    profilePicture?: string;
    bio?: string;
    school?: string;
  }>;
  posts: Array<{
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
    likes: number;
    comments: number;
  }>;
  clubs: Array<{
    id: string;
    name: string;
    description?: string;
    category?: string;
    memberCount: number;
    logoUrl?: string;
  }>;
  classes: Array<{
    id: string;
    code: string;
    name: string;
    professor?: string;
    semester?: string;
    year?: number;
  }>;
}

export function SearchResults({ searchQuery, searchType }: SearchResultsProps) {
  const accessToken = useAccessToken();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult>({
    users: [],
    posts: [],
    clubs: [],
    classes: [],
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!accessToken || !searchQuery.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Map searchType to API type
        const apiType = searchType === 'students' ? 'users' : searchType === 'posts' ? 'posts' : 'all';
        const data = await globalSearch(searchQuery, apiType, accessToken) as SearchResponse;
        
        setResults({
          users: data.results?.users || [],
          posts: data.results?.posts || [],
          clubs: data.results?.clubs || [],
          classes: data.results?.classes || [],
        });
      } catch (error: unknown) {
        const err = error as Error;
        logger.error('Search error:', err);
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          logger.warn('Authentication error during search');
        } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
          logger.warn('Network error during search');
        } else {
          toast.error(err.message || 'Search failed');
        }
        setResults({ users: [], posts: [], clubs: [], classes: [] });
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  const totalResults = results.users.length + results.posts.length + results.clubs.length + results.classes.length;

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
        <p className="text-gray-500">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Users Results */}
      {(searchType === 'all' || searchType === 'students') && results.users.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Students ({results.users.length})
            </h3>
          </div>
          <div className="space-y-2">
            {results.users.map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left"
                onClick={() => {
                  // Navigate to profile
                  window.location.href = `/profile/${user.id}`;
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[var(--text-primary)] truncate">{user.name}</h4>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {user.major && user.year ? `${user.year} • ${user.major}` : user.major || user.year || 'Student'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Posts Results */}
      {(searchType === 'all' || searchType === 'posts') && results.posts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Posts ({results.posts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {results.posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-white rounded-lg border border-gray-200"
              >
                <p className="text-[var(--text-primary)] mb-2 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clubs Results */}
      {searchType === 'all' && results.clubs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Clubs ({results.clubs.length})
            </h3>
          </div>
          <div className="space-y-2">
            {results.clubs.map((club) => (
              <div
                key={club.id}
                className="p-4 bg-white rounded-lg border border-gray-200"
              >
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">{club.name}</h4>
                {club.description && (
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">{club.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  {club.category && <span>{club.category}</span>}
                  <span>{club.memberCount} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classes Results */}
      {searchType === 'all' && results.classes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Classes ({results.classes.length})
            </h3>
          </div>
          <div className="space-y-2">
            {results.classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 bg-white rounded-lg border border-gray-200"
              >
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                  {cls.code} - {cls.name}
                </h4>
                {cls.professor && (
                  <p className="text-sm text-[var(--text-secondary)]">Professor: {cls.professor}</p>
                )}
                {cls.semester && cls.year && (
                  <p className="text-sm text-[var(--text-secondary)]">{cls.semester} {cls.year}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

