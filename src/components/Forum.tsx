import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, ThumbsDown, Share2, Send, Image as ImageIcon, Video, X, Loader2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileDetailView } from './ProfileDetailView';
import { useUserProfile, useAccessToken } from '../store/useAppStore';
import { getProfilePictureUrl } from '../utils/image-optimization';

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
  canDelete?: boolean;
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
  const [postTitle, setPostTitle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<Record<string, ForumComment[]>>({});
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; type: 'image' | 'video'; preview: string } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>(['#Finals', '#CampusEvents', '#StudySpots', '#FoodRecs', '#Housing']);

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
        setPostTitle('');
        setSelectedMedia(null);
        setIsAnonymous(true);
        setShowCreatePost(false);
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
        setSelectedPost(null);
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
        if (selectedPost?.id === postId) {
          const updatedPost = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          ).then(res => res.json());
          setSelectedPost(updatedPost.post);
        }
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
        if (selectedPost?.id === postId) {
          const updatedPost = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          ).then(res => res.json());
          setSelectedPost(updatedPost.post);
        }
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
            isAnonymous: false,
          }),
        }
      );

      if (response.ok) {
        toast.success('Comment added!');
        setCommentText('');
        loadComments(postId);
        loadPosts();
        if (selectedPost?.id === postId) {
          const updatedPost = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts/${postId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          ).then(res => res.json());
          setSelectedPost(updatedPost.post);
        }
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

  // Extract title from content (first sentence or first 50 chars)
  const getPostTitle = (content: string) => {
    if (!content) return '';
    const firstSentence = content.split(/[.!?]/)[0];
    if (firstSentence.length > 50) {
      return firstSentence.substring(0, 50) + '...';
    }
    return firstSentence || content.substring(0, 50);
  };

  // Extract tags from content
  const extractTags = (content: string) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches || [];
  };

  // Full post view (expanded)
  if (selectedPost) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 bg-gray-50 flex flex-col z-50"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2841 50%, #0f4d5c 100%)',
          fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-[20px] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)} className="text-white">
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Post Details</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-[20px] rounded-[20px] border border-white/10 p-5 mb-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                className={`w-11 h-11 ${!selectedPost.isAnonymous ? 'cursor-pointer' : ''}`}
                onClick={() => !selectedPost.isAnonymous && handleProfileClick(selectedPost.authorId)}
              >
                <AvatarImage src={getProfilePictureUrl(selectedPost.authorAvatar, 'small')} />
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                  {selectedPost.isAnonymous ? '?' : selectedPost.authorName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div
                  className={`text-[15px] font-bold text-white mb-0.5 ${!selectedPost.isAnonymous ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => !selectedPost.isAnonymous && handleProfileClick(selectedPost.authorId)}
                >
                  {selectedPost.isAnonymous ? 'Anonymous Student' : selectedPost.authorName}
                </div>
                <div className="text-xs text-white/50">
                  {userProfile?.year || 'Student'} • {formatTimeAgo(selectedPost.createdAt)}
                </div>
              </div>
              {selectedPost.canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="text-white/60 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <h2 className="text-lg font-bold text-white mb-2">
              {getPostTitle(selectedPost.content)}
            </h2>

            <p className="text-[15px] leading-relaxed text-white/80 mb-4">
              {selectedPost.content}
            </p>

            {selectedPost.mediaUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                {selectedPost.mediaType === 'video' ? (
                  <video src={selectedPost.mediaUrl} controls className="w-full" />
                ) : (
                  <img src={selectedPost.mediaUrl} alt="Post media" className="w-full rounded-xl" />
                )}
              </div>
            )}

            {extractTags(selectedPost.content).length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {extractTags(selectedPost.content).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => handleLike(selectedPost.id)}
                className={`flex items-center gap-1.5 transition-all ${
                  selectedPost.userLiked ? 'text-pink-400' : 'text-white/60 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${selectedPost.userLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-semibold">{selectedPost.likes}</span>
              </button>

              <button
                onClick={() => handleDislike(selectedPost.id)}
                className={`flex items-center gap-1.5 transition-all ${
                  selectedPost.userDisliked ? 'text-red-400' : 'text-white/60 hover:text-red-400'
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${selectedPost.userDisliked ? 'fill-current' : ''}`} />
                <span className="text-sm font-semibold">{selectedPost.dislikes}</span>
              </button>

              <button className="flex items-center gap-1.5 text-white/60">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{selectedPost.comments}</span>
              </button>

              <button
                onClick={() => openShareDialog(selectedPost.id)}
                className="flex items-center gap-1.5 text-white/60 hover:text-teal-400 ml-auto"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Comments Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Comments</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(selectedPost.id);
                  }
                }}
                className="flex-1 h-9 text-sm rounded-full border-white/20 bg-white/5 text-white placeholder-white/40 focus:border-teal-500/50"
              />
              <Button
                onClick={() => handleComment(selectedPost.id)}
                size="sm"
                className="h-9 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {postComments[selectedPost.id]?.length === 0 ? (
                <p className="text-xs text-white/50 text-center py-2">
                  No comments yet. Be the first!
                </p>
              ) : (
                postComments[selectedPost.id]?.map((comment: ForumComment) => (
                  <div key={comment.id} className="flex gap-2 text-sm items-start bg-white/5 backdrop-blur-[10px] rounded-xl p-3">
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarImage src={getProfilePictureUrl(comment.authorAvatar, 'small')} />
                      <AvatarFallback className="bg-teal-500/20 text-teal-300 text-xs">
                        {comment.isAnonymous ? '?' : comment.authorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-white mb-1">
                        {comment.isAnonymous ? 'Anonymous Student' : comment.authorName}
                        <span className="text-[10px] text-white/50 ml-2">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </p>
                      <p className="text-white/80">{comment.content}</p>
                    </div>
                    {comment.canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/40 hover:text-red-400"
                        onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2841 50%, #0f4d5c 100%)',
        fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-[1000] backdrop-blur-[20px] border-b border-white/10"
        style={{
          background: 'rgba(10, 22, 40, 0.95)',
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        <div className="max-w-[800px] mx-auto px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              💬
            </div>
            <h1
              className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
            >
              the quad
            </h1>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-[20px] border-none font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-300 text-white touch-manipulation active:scale-95 min-h-[44px]"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            + New Post
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 pt-20 pb-24 max-w-[800px] mx-auto w-full px-4 sm:px-5"
        style={{
          paddingTop: 'calc(80px + env(safe-area-inset-top, 0))',
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0))',
        }}
      >
        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-[20px] rounded-[20px] border border-white/10 p-4 sm:p-5 mb-4 sm:mb-6"
        >
          <div className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            🔥 Trending Now
          </div>
          <div className="flex gap-2 sm:gap-2.5 flex-wrap overflow-x-auto pb-2 -mx-2 px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {trendingTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => {
                  setNewPost(topic + ' ');
                  setShowCreatePost(true);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-[20px] border-none cursor-pointer transition-all duration-300 text-xs sm:text-[13px] font-semibold text-teal-300 border border-teal-400/30 touch-manipulation active:scale-95 whitespace-nowrap min-h-[36px]"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Create Post Dialog */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-3xl bg-white/10 backdrop-blur-[20px] border-white/20 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Create New Post</DialogTitle>
              <DialogDescription className="text-white/60">
                Share what's on your mind with your campus
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-title" className="text-white/80 mb-2 block">
                  Title (optional)
                </Label>
                <Input
                  id="post-title"
                  placeholder="Give your post a title..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder-white/40"
                />
              </div>
              <div>
                <Label htmlFor="post-content" className="text-white/80 mb-2 block">
                  Content
                </Label>
                <Textarea
                  id="post-content"
                  placeholder="What's on your mind? Share with your campus..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder-white/40"
                />
              </div>
              {selectedMedia && (
                <div className="relative rounded-xl overflow-hidden">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      className="data-[state=checked]:bg-teal-500"
                    />
                    <Label htmlFor="anonymous" className="text-xs text-white/60 cursor-pointer">
                      Post anonymously
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMediaSelect(e, 'image')}
                      className="hidden"
                      id="forum-image-upload"
                    />
                    <label htmlFor="forum-image-upload">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-white/10 cursor-pointer text-white"
                        asChild
                      >
                        <span>
                          <ImageIcon className="w-5 h-5" />
                        </span>
                      </Button>
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleMediaSelect(e, 'video')}
                      className="hidden"
                      id="forum-video-upload"
                    />
                    <label htmlFor="forum-video-upload">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-white/10 cursor-pointer text-white"
                        asChild
                      >
                        <span>
                          <Video className="w-5 h-5" />
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={uploadingMedia}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-full px-6"
                >
                  {uploadingMedia ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Posts Feed */}
        {loading ? (
          <div className="p-8 text-center text-white/60">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-white">
            <div className="text-6xl mb-5">💬</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-white/60">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const tags = extractTags(post.content);
              const title = getPostTitle(post.content);
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="bg-white/5 backdrop-blur-[20px] rounded-[20px] border border-white/10 p-4 sm:p-5 cursor-pointer transition-all duration-300 active:scale-[0.98] touch-manipulation"
                  onClick={() => {
                    setSelectedPost(post);
                    loadComments(post.id);
                  }}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar
                      className={`w-11 h-11 ${!post.isAnonymous ? 'cursor-pointer' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        !post.isAnonymous && handleProfileClick(post.authorId);
                      }}
                    >
                      <AvatarImage src={getProfilePictureUrl(post.authorAvatar, 'small')} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                        {post.isAnonymous ? '?' : post.authorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div
                        className={`text-[15px] font-bold text-white mb-0.5 ${!post.isAnonymous ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          !post.isAnonymous && handleProfileClick(post.authorId);
                        }}
                      >
                        {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                      </div>
                      <div className="text-xs text-white/50">
                        {userProfile?.year || 'Student'} • {formatTimeAgo(post.createdAt)}
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPostMenu(showPostMenu === post.id ? null : post.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      {showPostMenu === post.id && (
                        <div className="absolute right-0 top-10 bg-white/10 backdrop-blur-[20px] rounded-2xl border border-white/20 py-2 z-50 min-w-[120px]">
                          {post.canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openShareDialog(post.id);
                              setShowPostMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-white mb-2">
                    {title}
                  </h2>

                  <p className="text-sm sm:text-[15px] leading-relaxed text-white/80 mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} controls className="w-full" />
                      ) : (
                        <img src={post.mediaUrl} alt="Post media" className="w-full rounded-xl" />
                      )}
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 sm:gap-4 pt-4 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                      className={`flex items-center gap-1.5 transition-all touch-manipulation active:scale-95 min-h-[44px] ${
                        post.userLiked ? 'text-pink-400' : 'text-white/60 active:text-pink-400'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Heart className={`w-5 h-5 ${post.userLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs sm:text-sm font-semibold">{post.likes}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDislike(post.id);
                      }}
                      className={`flex items-center gap-1.5 transition-all touch-manipulation active:scale-95 min-h-[44px] ${
                        post.userDisliked ? 'text-red-400' : 'text-white/60 active:text-red-400'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <ThumbsDown className={`w-5 h-5 ${post.userDisliked ? 'fill-current' : ''}`} />
                      <span className="text-xs sm:text-sm font-semibold">{post.dislikes}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                        loadComments(post.id);
                      }}
                      className="flex items-center gap-1.5 text-white/60 active:text-teal-400 touch-manipulation active:scale-95 min-h-[44px]"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs sm:text-sm font-semibold">{post.comments} replies</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white/10 backdrop-blur-[20px] border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Share Post</DialogTitle>
            <DialogDescription className="text-white/60">
              Share this post with a friend
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFriends ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                <p className="text-sm text-white/60">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-white/60">No friends to share with yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSharePost(friend.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getProfilePictureUrl(friend.profilePicture, 'small')} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                        {friend.name?.[0] || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm text-white">{friend.name}</p>
                      <p className="text-xs text-white/50">{friend.major || 'Student'}</p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
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
          currentIndex={0}
          totalProfiles={1}
        />
      )}
    </div>
  );
}
