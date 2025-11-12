import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Heart,
  MessageCircle,
  ThumbsDown,
  Share2,
  Send,
  Image as ImageIcon,
  Video,
  MoreVertical,
  Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';

interface ForumProps {
  userProfile: any;
  accessToken: string;
}

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

export function Forum({ userProfile, accessToken }: ForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});

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

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/forum/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: newPost,
            isAnonymous: true, // Forum is anonymous by default
          }),
        }
      );

      if (response.ok) {
        toast.success('Post created!');
        setNewPost('');
        loadPosts();
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('Failed to create post');
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <h1 className="text-xl font-bold text-[#1E4F74]">Campus Forum</h1>
        <p className="text-xs text-gray-600">Anonymous posts from your campus</p>
      </div>

      {/* Create Post */}
      <div className="p-4 border-b bg-white">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userProfile?.profilePicture} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {userProfile?.name?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's on your mind? Share anonymously..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {post.isAnonymous ? '?' : post.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {post.isAnonymous ? 'Anonymous Student' : post.authorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                  {/* Media */}
                  {post.mediaUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} controls className="w-full" />
                      ) : (
                        <img src={post.mediaUrl} alt="Post media" className="w-full" />
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 ${
                        post.userLiked ? 'text-pink-600' : 'text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.likes}</span>
                    </button>

                    <button
                      onClick={() => handleDislike(post.id)}
                      className={`flex items-center gap-1.5 ${
                        post.userDisliked ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${post.userDisliked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.dislikes}</span>
                    </button>

                    <button
                      onClick={() => {
                        const newShowState = showComments === post.id ? null : post.id;
                        setShowComments(newShowState);
                        if (newShowState && !postComments[post.id]) {
                          loadComments(post.id);
                        }
                      }}
                      className="flex items-center gap-1.5 text-gray-600"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.comments}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-gray-600 ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {showComments === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t"
                      >
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
                            className="flex-1 h-8 text-sm"
                          />
                          <Button
                            onClick={() => handleComment(post.id)}
                            size="sm"
                            className="h-8"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                        {/* Comments list */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {postComments[post.id]?.map((comment: any) => (
                            <div key={comment.id} className="flex gap-2 text-sm">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                  {comment.isAnonymous ? '?' : comment.authorName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs">
                                  {comment.isAnonymous ? 'Anonymous Student' : comment.authorName}
                                </p>
                                <p className="text-gray-700">{comment.content}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {formatTimeAgo(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {postComments[post.id]?.length === 0 && (
                            <p className="text-xs text-gray-500 text-center py-2">
                              No comments yet. Be the first!
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

