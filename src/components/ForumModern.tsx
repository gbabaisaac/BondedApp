import { useState, useEffect, useRef } from 'react';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal, Ghost, Check, TrendingUp, Image as ImageIcon, Video, Loader2, Search, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { PostComposerDialog } from './PostComposerDialog';
import { getPosts, likePost, createPost } from '../utils/api-client';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { ForumPost, PostsResponse } from '../types/api';

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url: string;
    year_level: string;
    major: string;
    is_verified: boolean;
  };
  is_anonymous: boolean;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  tags: string[];
  has_user_liked: boolean;
  media_url?: string;
  media_type?: string;
}

interface ForumModernProps {
  onPostComposerChange?: (isOpen: boolean) => void;
  openComposer?: boolean;
  onComposerOpened?: () => void;
  onNavigateToProfile?: () => void;
}

// Mock data
const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
  id: `post-${i}`,
  content: `This is a sample post #${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 🎉`,
  author: {
    id: `user-${i}`,
    name: `User ${i + 1}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    year_level: 'Junior',
    major: 'Computer Science',
    is_verified: Math.random() > 0.7,
  },
  is_anonymous: Math.random() > 0.6,
  created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  like_count: Math.floor(Math.random() * 200),
  comment_count: Math.floor(Math.random() * 50),
  share_count: Math.floor(Math.random() * 20),
  tags: ['campus', 'life', 'thoughts'].slice(0, Math.floor(Math.random() * 3) + 1),
  has_user_liked: false,
}));

export function ForumModern({ onPostComposerChange, openComposer, onComposerOpened, onNavigateToProfile }: ForumModernProps) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    loadPosts();
  }, [accessToken, activeFilter]);

  // Handle external trigger to open composer
  useEffect(() => {
    if (openComposer && !isComposerOpen) {
      setIsComposerOpen(true);
      onComposerOpened?.();
    }
  }, [openComposer, isComposerOpen, onComposerOpened]);

  // Sync with parent state changes - debounced to prevent race conditions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onPostComposerChange?.(isComposerOpen);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isComposerOpen, onPostComposerChange]);

  const loadPosts = async () => {
    if (!accessToken) {
      setLoading(false);
      setPosts([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getPosts(accessToken, activeFilter) as PostsResponse;
      
      // Backend returns { posts: [...], pagination: {...} }
      const posts = data.posts || [];
      
      // Transform backend data to match interface
      const transformedPosts = posts.map((p: ForumPost) => ({
        id: p.id,
        content: p.content,
        author: {
          id: p.authorId,
          name: p.authorName || 'Anonymous Student',
          avatar_url: p.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.authorId}`,
          year_level: 'Student',
          major: '',
          is_verified: false,
        },
        is_anonymous: p.isAnonymous || false,
        created_at: p.createdAt,
        like_count: p.likes || 0,
        comment_count: p.comments || 0,
        share_count: 0,
        tags: [],
        has_user_liked: p.userLiked || false,
        media_url: p.mediaUrl,
        media_type: p.mediaType,
      }));
      
      setPosts(transformedPosts);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to load posts:', err);
      // Handle different error types
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        logger.warn('Authentication error loading posts');
        setPosts([]);
        // Don't show error toast for auth issues, just log it
      } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        logger.warn('Network error loading posts');
        setPosts([]);
        // Don't show error toast for network issues on initial load
      } else {
        toast.error(err.message || 'Failed to load posts');
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'trending', label: '🔥 Trending' },
    { id: 'photos', label: '📸 Photos' },
    { id: 'videos', label: '🎥 Videos' },
    { id: 'thoughts', label: '💭 Thoughts' },
    { id: 'questions', label: '❓ Questions' },
    { id: 'events', label: '🎉 Events' },
    { id: 'anonymous', label: '👻 Anonymous' },
    { id: 'study', label: '📚 Study' },
  ];

  const toggleLike = async (postId: string) => {
    if (!accessToken) {
      toast.error('Please log in to like posts');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          has_user_liked: !p.has_user_liked,
          like_count: p.has_user_liked ? p.like_count - 1 : p.like_count + 1
        };
      }
      return p;
    }));

    try {
      // The like endpoint toggles - calling it again will unlike
      await likePost(postId, accessToken);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to toggle like:', err);
      toast.error(err.message || 'Failed to update like');
      
      // Revert on error
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            has_user_liked: post.has_user_liked,
            like_count: post.like_count
          };
        }
        return p;
      }));
    }
  };

  const handleCreatePost = async (content: string, isAnonymous: boolean, mediaUrls?: string[]) => {
    if (!accessToken) {
      toast.error('Please log in to create posts');
      return;
    }

    try {
      const newPost = await createPost({ content, isAnonymous, mediaUrls }, accessToken);
      toast.success('Post created successfully!');
      
      // Close composer first
      setIsComposerOpen(false);
      onPostComposerChange?.(false);
      
      // Small delay before reloading to ensure state is updated
      setTimeout(async () => {
        await loadPosts();
      }, 100);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Failed to create post:', err);
      toast.error(err.message || 'Failed to create post');
    }
  };

  const handleSharePost = async (post: Post) => {
    const postUrl = `${window.location.origin}/forum/post/${post.id}`;
    const shareText = post.is_anonymous 
      ? `Check out this anonymous post on Bonded: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`
      : `Check out this post by ${post.author.name} on Bonded: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Post from Bonded',
          text: shareText,
          url: postUrl,
        });
        toast.success('Post shared!');
        setOpenMenuId(null);
      } catch (error: unknown) {
        // User cancelled or error occurred, fallback to clipboard
        const err = error as Error;
        if (err.name !== 'AbortError') {
          await handleCopyToClipboard(postUrl);
        }
      }
    } else {
      // Fallback to clipboard
      await handleCopyToClipboard(postUrl);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
      setOpenMenuId(null);
    } catch (error: unknown) {
      logger.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ background: 'var(--gradient-background)' }}
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
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ 
                background: 'linear-gradient(135deg, #FF6B6B, #A78BFA)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              B
            </div>
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
              Forum
            </h1>
          </div>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-pink-500 hover:scale-105"
            style={{ 
              background: 'white',
              borderColor: '#E8E8F0',
            }}
          >
            <Search className="w-5 h-5" style={{ color: '#2D2D2D' }} />
          </button>
        </div>
      </div>

      {/* Filters - Matching Design */}
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
          .forum-filter-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div 
          className="forum-filter-scroll flex gap-2"
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
        className="overflow-y-auto"
        style={{ 
          height: 'calc(100vh - 73px - 61px - 80px)',
          padding: '16px 20px 20px',
        }}
      >
        {/* Trending Topics Card */}
        <div 
          className="rounded-2xl p-4 mb-4"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(167, 139, 250, 0.1))',
            border: '2px solid rgba(255, 107, 107, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔥</span>
            <h3 className="text-base font-bold" style={{ color: '#2D2D2D' }}>
              Trending on Campus
            </h3>
          </div>
          <div className="space-y-2">
            {[
              { topic: '#MidtermSzn', count: '234 posts' },
              { topic: '#FreeFood', count: '189 posts' },
              { topic: '#RoommateSearch', count: '156 posts' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold" style={{ color: '#2D2D2D' }}>
                  {item.topic}
                </span>
                <span className="text-xs" style={{ color: '#9B9B9B' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#FF6B6B' }} />
            <p style={{ color: '#6B6B6B' }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#6B6B6B' }}>No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div 
              key={post.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all"
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
              }}
            >
              <style>{`
                @keyframes slideIn {
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
              
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ 
                    background: post.is_anonymous 
                      ? 'linear-gradient(135deg, #6B6B6B, #9B9B9B)'
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                  }}
                >
                  {post.is_anonymous ? '👻' : (post.media_type === 'video' ? '🎥' : post.media_url ? '📸' : '💭')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate" style={{ color: '#2D2D2D', fontSize: '15px' }}>
                      {post.is_anonymous ? 'Anonymous' : post.author.name}
                    </span>
                    {post.is_anonymous && (
                      <span 
                        className="px-2 py-0.5 text-xs font-bold rounded-md"
                        style={{ background: 'rgba(107, 107, 107, 0.1)', color: '#6B6B6B', fontSize: '11px' }}
                      >
                        ANON
                      </span>
                    )}
                    {!post.is_anonymous && post.author.is_verified && (
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                        style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#9B9B9B', fontSize: '13px' }}>
                    {post.is_anonymous 
                      ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                      : `${post.author.year_level || 'Student'} • ${post.author.major || 'Undeclared'} • ${formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}`
                    }
                  </p>
                </div>
                
                <div className="relative" ref={(el) => { menuRefs.current[post.id] = el; }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === post.id ? null : post.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <span style={{ color: '#2D2D2D', fontSize: '20px' }}>⋯</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openMenuId === post.id && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenuId(null)}
                        style={{ background: 'transparent' }}
                      />
                      {/* Menu */}
                      <div 
                        className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border z-50 min-w-[160px] overflow-hidden"
                        style={{
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                          borderColor: '#E8E8F0',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSharePost(post);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                          style={{
                            color: '#2D2D2D',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '14px',
                            fontWeight: 500,
                          }}
                        >
                          <Share2 className="w-4 h-4" style={{ color: '#6B6B6B' }} />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(`${window.location.origin}/forum/post/${post.id}`);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t"
                          style={{
                            color: '#2D2D2D',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '14px',
                            fontWeight: 500,
                            borderColor: '#F3F4FF',
                          }}
                        >
                          <Copy className="w-4 h-4" style={{ color: '#6B6B6B' }} />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Post Content */}
              <p className="text-base leading-relaxed mb-3" style={{ color: '#2D2D2D', fontSize: '15px', lineHeight: '1.5' }}>
                {post.content}
              </p>
              
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg"
                      style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B', fontSize: '12px', borderRadius: '8px' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Media */}
              {post.media_url && (
                <div className="rounded-xl overflow-hidden mb-3" style={{ borderRadius: '12px' }}>
                  {post.media_type === 'video' ? (
                    <div 
                      className="w-full h-60 flex flex-col items-center justify-center relative"
                      style={{ 
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                        opacity: 0.3,
                      }}
                    >
                      <span className="text-6xl">🎥</span>
                      <span className="text-4xl mt-2 opacity-80">▶️</span>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-60 flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        opacity: 0.3,
                      }}
                    >
                      <span className="text-6xl">🌅</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-5 pt-3 border-t" style={{ borderColor: '#F3F4FF' }}>
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105"
                  style={{ color: post.has_user_liked ? '#FF6B6B' : '#6B6B6B' }}
                >
                  <span className="text-xl">{post.has_user_liked ? '❤️' : '🤍'}</span>
                  <span>{post.like_count}</span>
                </button>
                
                <button className="flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105" style={{ color: '#6B6B6B' }}>
                  <span className="text-xl">💬</span>
                  <span>{post.comment_count}</span>
                </button>
                
                <button className="flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105" style={{ color: '#6B6B6B' }}>
                  <span className="text-xl">🔗</span>
                  <span>{post.share_count}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsComposerOpen(true);
          onPostComposerChange?.(true);
          onComposerOpened?.();
        }}
        className="fixed rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:rotate-90 z-[9998]"
        style={{ 
          bottom: '100px',
          right: '20px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
          boxShadow: '0 8px 20px rgba(255, 107, 107, 0.4)',
          fontSize: '28px',
          fontWeight: 300,
        }}
      >
        +
      </button>

      {/* Post Composer Dialog */}
              <PostComposerDialog 
                isOpen={isComposerOpen}
                onClose={() => {
                  setIsComposerOpen(false);
                  // Use setTimeout to prevent race conditions
                  setTimeout(() => {
                    onPostComposerChange?.(false);
                  }, 0);
                }}
                onPost={(content, isAnonymous) => {
                  handleCreatePost(content, isAnonymous);
                }}
              />
    </div>
  );
}

