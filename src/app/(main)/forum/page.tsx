'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { 
  TrendingUp, Image as ImageIcon, Video, MessageCircle, 
  HelpCircle, Calendar, Ghost, Plus, Heart, Share2, 
  MoreHorizontal, Check 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Mock posts
const mockPosts = Array.from({ length: 10 }, (_, i) => ({
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

const ForumFilters = ({ activeFilter, onChange }: { activeFilter: string; onChange: (id: string) => void }) => {
  const filters = [
    { id: 'trending', label: '🔥 Trending' },
    { id: 'photos', label: '📸 Photos' },
    { id: 'videos', label: '🎥 Videos' },
    { id: 'thoughts', label: '💭 Thoughts' },
    { id: 'questions', label: '❓ Questions' },
    { id: 'events', label: '🎉 Events' },
    { id: 'anonymous', label: '👻 Anonymous' },
  ];
  
  return (
    <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            variant="filter"
            selected={activeFilter === filter.id}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>
    </div>
  );
};

const TrendingTopics = () => {
  const topics = [
    { tag: 'campus-life', count: 234 },
    { tag: 'study-tips', count: 189 },
    { tag: 'events', count: 156 },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-border mb-4"
    >
      <h3 className="text-lg font-bold text-foreground mb-3">🔥 Trending Topics</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Chip key={topic.tag} variant="tag">
            #{topic.tag}
            <span className="ml-1.5 opacity-70">({topic.count})</span>
          </Chip>
        ))}
      </div>
    </motion.div>
  );
};

const PostCard = ({ post, index }: { post: any; index: number }) => {
  const [hasLiked, setHasLiked] = useState(post.has_user_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);

  const toggleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount(hasLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all border border-border"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
          {post.is_anonymous ? (
            <Ghost className="w-5 h-5 text-white" />
          ) : (
            <Image
              src={post.author.avatar_url}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-xl object-cover"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm truncate">
              {post.is_anonymous ? 'Anonymous' : post.author.name}
            </span>
            {post.is_anonymous && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold rounded-md">
                ANON
              </span>
            )}
            {!post.is_anonymous && post.author.is_verified && (
              <div className="w-4 h-4 gradient-bg rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {!post.is_anonymous && `${post.author.year_level} • ${post.author.major} • `}
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="mb-3">
        <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/forum?tag=${tag}`}
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-border">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleLike}
          className={cn(
            'flex items-center gap-2 text-sm font-semibold transition-all',
            hasLiked
              ? 'text-red-500 scale-110'
              : 'text-muted-foreground hover:text-red-500 hover:scale-105'
          )}
        >
          <Heart className={cn('h-5 w-5', hasLiked && 'fill-current')} />
          <span>{likeCount}</span>
        </motion.button>
        
        <Link
          href={`/forum/post/${post.id}`}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.comment_count}</span>
        </Link>
        
        <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <Share2 className="h-5 w-5" />
          <span>{post.share_count}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default function ForumPage() {
  const [activeFilter, setActiveFilter] = useState('trending');
  
  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">Forum</h1>
          </div>
        </div>
      </header>
      
      {/* Filters */}
      <ForumFilters activeFilter={activeFilter} onChange={setActiveFilter} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <TrendingTopics />
        
        {/* Post Feed */}
        {mockPosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </main>
      
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {/* TODO: Open create post */}}
        className="fixed bottom-24 right-6 w-14 h-14 gradient-bg rounded-full flex items-center justify-center shadow-xl z-40"
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
}
