-- Migration: Forum and Social Connections
-- Created: 2025-01-01
-- Description: Adds forum posts, comments, likes/dislikes, and social connections support

-- ============================================
-- FORUM TABLES
-- ============================================

-- Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  is_anonymous BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Post Likes/Dislikes Table
CREATE TABLE IF NOT EXISTS forum_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL, -- true for like, false for dislike
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Forum Comments Table
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Forum posts indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_anonymous ON forum_posts(is_anonymous);

-- Forum likes indexes
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON forum_post_likes(user_id);

-- Forum comments indexes
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created ON forum_comments(created_at DESC);

-- ============================================
-- FUNCTIONS FOR AUTO-UPDATING COUNTS
-- ============================================

-- Function to update post likes/dislikes count
CREATE OR REPLACE FUNCTION update_forum_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET 
    likes_count = (
      SELECT COUNT(*) FROM forum_post_likes 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND is_like = true
    ),
    dislikes_count = (
      SELECT COUNT(*) FROM forum_post_likes 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND is_like = false
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update counts when likes/dislikes change
CREATE TRIGGER trigger_update_forum_post_counts
  AFTER INSERT OR UPDATE OR DELETE ON forum_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_counts();

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_forum_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET 
    comments_count = (
      SELECT COUNT(*) FROM forum_comments 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comments count
CREATE TRIGGER trigger_update_forum_comments_count
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_comments_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on forum tables
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Forum Posts Policies
CREATE POLICY "Anyone can view forum posts"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Forum Likes Policies
CREATE POLICY "Anyone can view likes"
  ON forum_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like/dislike"
  ON forum_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own likes"
  ON forum_post_likes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON forum_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Forum Comments Policies
CREATE POLICY "Anyone can view comments"
  ON forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON forum_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON forum_comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- SOCIAL CONNECTIONS
-- ============================================
-- Note: Social connections are stored in the existing profiles KV store
-- This migration adds a helper column if needed, but we'll use JSONB in profiles

-- Add social_connections column to profiles if using a profiles table
-- If using KV store, this is handled in the application layer
-- For reference, here's what the structure should be:
/*
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_connections JSONB DEFAULT '{}';

-- Example structure in JSONB:
{
  "linkedin": {
    "connected": true,
    "username": "john-doe",
    "profileUrl": "https://linkedin.com/in/john-doe",
    "accessToken": "encrypted_token",
    "scrapedData": {
      "headline": "Software Engineer",
      "location": "San Francisco, CA",
      "experience": [...],
      "education": [...]
    }
  },
  "instagram": {
    "connected": true,
    "username": "johndoe",
    "profileUrl": "https://instagram.com/johndoe",
    "accessToken": "encrypted_token",
    "scrapedData": {
      "bio": "...",
      "followerCount": 1234,
      "followingCount": 567
    }
  },
  "spotify": {
    "connected": true,
    "username": "johndoe",
    "profileUrl": "https://open.spotify.com/user/johndoe",
    "accessToken": "encrypted_token",
    "refreshToken": "encrypted_token",
    "topArtists": [...],
    "topTracks": [...]
  },
  "appleMusic": {
    "connected": true,
    "userToken": "encrypted_token",
    "topArtists": [...],
    "topTracks": [...]
  }
}
*/

