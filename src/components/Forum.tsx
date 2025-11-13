import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Heart,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Send,
  Image as ImageIcon,
  Video,
  MoreVertical,
  Flag,
  X,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileDetailView } from './ProfileDetailView';
import { useUserProfile, useAccessToken } from '../store/useAppStore';

interface ForumPost {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  dislikes: number;
  comments: number;
  userLiked: boolean;
  userDisliked: boolean;
  createdAt: string;
  isAnonymous: boolean;
}

interface ForumComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  isAnonymous: boolean;
  canDelete?: boolean;
}

export function Forum() {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, ForumComment[]>>({});
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; type: 'image' | 'video'; preview: string } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
  const [showPostComposer, setShowPostComposer] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Load posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!accessToken) return;
    setLoadingFriends(true);
    try {
      // Load chats to get friends list
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chats`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const chats = await response.json();
        // Extract unique friends from chats
        const friendMap = new Map();
        chats.forEach((chat: any) => {
          if (chat.otherUser) {
            friendMap.set(chat.otherUser.id, chat.otherUser);
          }
        });
        setFriends(Array.from(friendMap.values()));
      }
    } catch (error) {
      console.error('Load friends error:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File is too large. Max size: ${type === 'image' ? '10MB' : '50MB'}`);
      return;
    }

    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia({
        file,
        type,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedMedia) {
      toast.error('Please enter some content or add media');
      return;
    }

    try {
      setUploadingMedia(true);
      let mediaUrl: string | null = null;
      let mediaType: 'image' | 'video' | null = null;

      if (selectedMedia) {
        const formData = new FormData();
        formData.append('file', selectedMedia.file);
        formData.append('type', selectedMedia.type);

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/upload-media`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          mediaUrl = uploadData.url;
          mediaType = selectedMedia.type;
        } else {
          toast.error('Failed to upload media');
          setUploadingMedia(false);
          return;
        }
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: newPost.trim() || (selectedMedia ? `Shared a ${selectedMedia.type}` : ''),
            mediaUrl,
            mediaType,
            isAnonymous: isAnonymous,
          }),
        }
      );

      if (response.ok) {
        toast.success('Post created!');
      setNewPost('');
      setSelectedMedia(null);
      setIsAnonymous(true);
      setShowPostComposer(false);
      loadPosts();
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('Failed to create post');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Post deleted');
        loadPosts();
        setShowPostMenu(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Comment deleted');
        loadComments(postId);
        loadPosts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        loadPosts();
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}/dislike`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        loadPosts();
      }
    } catch (error) {
      console.error('Dislike error:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPostComments(prev => ({ ...prev, [postId]: data.comments || [] }));
      }
    } catch (error) {
      console.error('Load comments error:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: commentText,
            isAnonymous: true,
          }),
        }
      );

      if (response.ok) {
        toast.success('Comment added!');
        setCommentText('');
        loadComments(postId);
        loadPosts();
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleSharePost = async (targetUserId: string) => {
    if (!sharePostId) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${sharePostId}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ targetUserId }),
        }
      );

      if (response.ok) {
        toast.success('Post shared!');
        setShowShareDialog(false);
        setSharePostId(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to share post');
      }
    } catch (error) {
      console.error('Share post error:', error);
      toast.error('Failed to share post');
    }
  };

  const openShareDialog = (postId: string) => {
    setSharePostId(postId);
    setShowShareDialog(true);
    loadFriends();
  };

  const handleProfileClick = async (authorId: string) => {
    if (!authorId) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile/${authorId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const profile = await response.json();
        setSelectedProfile(profile);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const isPostAuthor = (post: ForumPost) => {
    return userProfile?.id === post.authorId;
  };

  const getPreviewComments = (postId: string) => {
    const comments = postComments[postId] || [];
    return comments.slice(0, 2); // Show first 2 comments in preview
  };

  return (
    <div className="min-h-screen pb-28 w-full overflow-x-hidden bg-black" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Quad Section Header - Dark Mode */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-soft-cream mb-1">
          The Quad
        </h1>
        <p className="text-sm text-soft-cream/60">Anonymous campus-wide posts.</p>
      </div>

      {/* Floating Create Post Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowPostComposer(true)}
          className="w-14 h-14 bg-gradient-to-r from-teal-blue to-ocean-blue rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Create Post Modal - Dark Mode */}
      <AnimatePresence>
        {showPostComposer && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowPostComposer(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-gray-900 rounded-t-3xl sm:rounded-3xl border-t border-gray-700/50 sm:border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-soft-cream">Create Post</h2>
                  <button
                    onClick={() => setShowPostComposer(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-soft-cream transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={userProfile?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-blue to-lavender-mist text-soft-cream font-medium text-sm">
                      {userProfile?.name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[120px] resize-none rounded-2xl bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400 text-sm focus:border-teal-blue/40 focus:ring-1 focus:ring-teal-blue/20"
                    />
                    {selectedMedia && (
                      <div className="mt-3 relative rounded-2xl overflow-hidden">
                        {selectedMedia.type === 'image' ? (
                          <img
                            src={selectedMedia.preview}
                            alt="Preview"
                            className="w-full max-h-64 object-cover"
                          />
                        ) : (
                          <video
                            src={selectedMedia.preview}
                            controls
                            className="w-full max-h-64"
                          />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                          onClick={() => setSelectedMedia(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Anonymous Toggle - More Visible */}
                        <button
                          onClick={() => setIsAnonymous(!isAnonymous)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                            isAnonymous
                              ? 'bg-teal-blue text-white border-2 border-teal-blue shadow-lg shadow-teal-blue/30'
                              : 'bg-gray-800/70 text-gray-400 border-2 border-gray-700/70'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                            isAnonymous ? 'bg-white' : 'bg-gray-500'
                          }`} />
                          Anonymous
                        </button>
                        
                        {/* Media Icons - Evenly Spaced */}
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaSelect(e, 'image')}
                            className="hidden"
                            id="forum-image-upload"
                          />
                          <label htmlFor="forum-image-upload" className="cursor-pointer">
                            <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-teal-blue transition-colors bg-gray-800/50 rounded-full">
                              <ImageIcon className="w-4.5 h-4.5" />
                            </button>
                          </label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleMediaSelect(e, 'video')}
                            className="hidden"
                            id="forum-video-upload"
                          />
                          <label htmlFor="forum-video-upload" className="cursor-pointer">
                            <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-lavender-mist transition-colors bg-gray-800/50 rounded-full">
                              <Video className="w-4.5 h-4.5" />
                            </button>
                          </label>
                        </div>
                      </div>
                      
                      {/* Post Button */}
                      <Button
                        onClick={() => {
                          handleCreatePost();
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-teal-blue to-ocean-blue text-soft-cream rounded-full px-5 h-9 text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
                        disabled={uploadingMedia}
                      >
                        {uploadingMedia ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1.5" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Posts Feed - Clean & Spacious */}
      {loading ? (
        <div className="p-12 text-center text-soft-cream/60">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-soft-cream/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-soft-cream">No posts yet</h3>
          <p className="text-soft-cream/60">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4 px-4 pb-6">
          {posts.map((post) => {
            const isExpanded = expandedPost === post.id;
            const previewComments = getPreviewComments(post.id);
            const allComments = postComments[post.id] || [];
            const showAllComments = showComments === post.id;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div
                  className={`bg-gray-900/80 rounded-2xl overflow-hidden transition-all border border-gray-700/30 ${
                    isExpanded ? 'ring-1 ring-teal-blue/40' : ''
                  }`}
                >
                  <div className="p-4">
                    {/* Post Header - One Line */}
                    <div className="flex items-center justify-between mb-3 relative">
                      <div
                        className={`flex items-center gap-2.5 flex-1 ${!post.isAnonymous ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={() => !post.isAnonymous && handleProfileClick(post.authorId)}
                      >
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-lavender-mist to-peach-glow text-midnight-indigo font-medium text-sm">
                            {post.isAnonymous ? '?' : post.authorName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-soft-cream truncate">
                              {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                            </p>
                            <span className="text-xs text-soft-cream/50">•</span>
                            <p className="text-xs text-soft-cream/60">
                              {formatTimeAgo(post.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-soft-cream/50 hover:text-soft-cream transition-colors"
                          onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showPostMenu === post.id && (
                          <div className="absolute right-0 top-10 bg-midnight-indigo/95 backdrop-blur-xl rounded-2xl py-2 z-50 min-w-[120px] border border-soft-cream/20 shadow-lg">
                            {isPostAuthor(post) && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                            <button
                              onClick={() => {
                                openShareDialog(post.id);
                                setShowPostMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-soft-cream hover:bg-soft-cream/10 flex items-center gap-2 rounded-lg transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Title (if exists) */}
                    {post.title && (
                      <h3 className="text-base font-bold text-soft-cream mb-2.5">
                        {post.title}
                      </h3>
                    )}

                    {/* Post Content */}
                    <p className="text-sm text-soft-cream mb-3 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>

                    {/* Post Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-lavender-mist/30 text-lavender-mist border border-lavender-mist/50 shadow-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Media - Softly Rounded */}
                    {post.mediaUrl && (
                      <div className="mb-3 rounded-2xl overflow-hidden">
                        {post.mediaType === 'video' ? (
                          <video src={post.mediaUrl} controls className="w-full max-h-64 object-cover" />
                        ) : (
                          <img src={post.mediaUrl} alt="Post media" className="w-full max-h-96 object-cover" />
                        )}
                      </div>
                    )}

                    {/* Engagement Metrics - Properly Sized & Spaced */}
                    <div className="flex items-center gap-4 pt-3 border-t border-soft-cream/10">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-soft-cream/60 hover:text-peach-glow transition-colors ${
                          post.userLiked ? 'text-peach-glow' : ''
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => handleDislike(post.id)}
                        className={`flex items-center gap-1.5 text-soft-cream/60 hover:text-red-400 transition-colors ${
                          post.userDisliked ? 'text-red-400' : ''
                        }`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${post.userDisliked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">{post.dislikes}</span>
                      </button>

                      <button
                        onClick={() => {
                          const newShowState = showComments === post.id ? null : post.id;
                          setShowComments(newShowState);
                          if (newShowState && !postComments[post.id]) {
                            loadComments(post.id);
                          }
                        }}
                        className="flex items-center gap-1.5 text-soft-cream/60 hover:text-teal-blue transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{post.comments}</span>
                      </button>

                      <button
                        onClick={() => openShareDialog(post.id)}
                        className="flex items-center gap-1.5 text-soft-cream/60 hover:text-teal-blue transition-colors ml-auto"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview Comments (1-2 comments) - Clean Design */}
                    {!isExpanded && previewComments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-soft-cream/10">
                        <div className="space-y-2">
                          {previewComments.map((comment) => (
                            <div key={comment.id} className="flex gap-2 text-sm">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback className="bg-teal-blue/30 text-teal-blue text-xs font-bold">
                                  {comment.isAnonymous ? '?' : comment.authorName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs text-soft-cream">
                                  {comment.isAnonymous ? 'Anonymous Student' : comment.authorName}
                                </p>
                                <p className="text-soft-cream/90 text-sm">{comment.content}</p>
                              </div>
                              {comment.canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-soft-cream/40 hover:text-red-400"
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {allComments.length > 2 && (
                          <button
                            onClick={() => {
                              setExpandedPost(post.id);
                              if (!postComments[post.id]) {
                                loadComments(post.id);
                              }
                            }}
                            className="text-xs text-purple-600 font-medium mt-2 flex items-center gap-1"
                          >
                            View all {allComments.length} comments
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                           {/* Expanded View / Full Comments - Bonded Design */}
                           {(isExpanded || showAllComments) && (
                             <motion.div
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               exit={{ opacity: 0, height: 0 }}
                               className="mt-3 pt-3 border-t border-soft-cream/10"
                             >
                               {isExpanded && (
                                 <button
                                   onClick={() => setExpandedPost(null)}
                                   className="text-xs text-teal-blue font-medium mb-3 flex items-center gap-1 hover:text-lavender-mist transition-colors"
                                 >
                                   Show less
                                   <ChevronUp className="w-3 h-3" />
                                 </button>
                               )}
                               <div className="flex gap-2 mb-3">
                                 <Input
                                   placeholder="Add a comment..."
                                   value={commentText}
                                   onChange={(e) => setCommentText(e.target.value)}
                                   onKeyPress={(e) => {
                                     if (e.key === 'Enter') {
                                       handleComment(post.id);
                                     }
                                   }}
                                   className="flex-1 h-9 text-sm rounded-full bg-soft-cream/8 border-soft-cream/20 text-soft-cream placeholder:text-soft-cream/50 focus:border-teal-blue/40 focus:ring-1 focus:ring-teal-blue/20"
                                 />
                                 <Button
                                   onClick={() => handleComment(post.id)}
                                   size="sm"
                                   className="h-9 rounded-full bg-gradient-to-r from-teal-blue to-ocean-blue text-soft-cream px-4 hover:opacity-90 transition-opacity"
                                 >
                                   <Send className="w-3.5 h-3.5" />
                                 </Button>
                               </div>
                               <div className="space-y-2 max-h-96 overflow-y-auto">
                                 {allComments.map((comment) => (
                                   <div key={comment.id} className="flex gap-2 text-sm group">
                                     <Avatar className="w-6 h-6 flex-shrink-0">
                                       <AvatarImage src={comment.authorAvatar} />
                                       <AvatarFallback className="bg-teal-blue/30 text-teal-blue text-xs font-bold">
                                         {comment.isAnonymous ? '?' : comment.authorName[0]}
                                       </AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1 min-w-0">
                                       <p className="font-semibold text-xs text-soft-cream">
                                         {comment.isAnonymous ? 'Anonymous Student' : comment.authorName}
                                       </p>
                                       <p className="text-soft-cream/90 text-sm">{comment.content}</p>
                                       <p className="text-[10px] text-soft-cream/60 mt-0.5">
                                         {formatTimeAgo(comment.createdAt)}
                                       </p>
                                     </div>
                                     {comment.canDelete && (
                                       <Button
                                         variant="ghost"
                                         size="icon"
                                         className="h-6 w-6 text-soft-cream/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                         onClick={() => handleDeleteComment(post.id, comment.id)}
                                       >
                                         <Trash2 className="w-3 h-3" />
                                       </Button>
                                     )}
                                   </div>
                                 ))}
                                 {allComments.length === 0 && (
                                   <p className="text-xs text-soft-cream/50 text-center py-4">
                                     No comments yet. Be the first!
                                   </p>
                                 )}
                               </div>
                             </motion.div>
                           )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Share Dialog - Modern Design */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-midnight-indigo/95 backdrop-blur-xl border border-soft-cream/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-soft-cream">Share Post</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFriends ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-blue" />
                <p className="text-sm text-soft-cream/60">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-soft-cream/60">No friends to share with yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSharePost(friend.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-soft-cream/10 transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-blue to-lavender-mist text-soft-cream">
                        {friend.name?.[0] || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm text-soft-cream">{friend.name}</p>
                      <p className="text-xs text-soft-cream/60">{friend.major || 'Student'}</p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-teal-blue to-ocean-blue text-soft-cream px-4 hover:opacity-90"
                    >
                      Send
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailView
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onNext={() => {}}
          onPrev={() => {}}
          hasNext={false}
          hasPrev={false}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}
