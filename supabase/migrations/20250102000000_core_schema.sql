-- Migration: Core Schema for Bonded App
-- Created: 2025-01-02
-- Description: Creates universities, profiles, friendships, and core tables per spec

-- ============================================
-- UNIVERSITIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE, -- e.g., "illinois.edu"
  slug TEXT NOT NULL UNIQUE, -- e.g., "uiuc"
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for universities
CREATE INDEX IF NOT EXISTS idx_universities_domain ON universities(domain);
CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug);
CREATE INDEX IF NOT EXISTS idx_universities_active ON universities(is_active);

-- RLS for universities (public read, admin write)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active universities"
  ON universities FOR SELECT
  USING (is_active = true);

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) NOT NULL,
  
  -- Basic Info
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  display_name TEXT, -- What shows in app
  pronouns TEXT, -- he/him, she/her, they/them
  bio TEXT,
  
  -- Academic
  graduation_year INTEGER,
  major TEXT,
  minor TEXT,
  class_year TEXT, -- Freshman, Sophomore, Junior, Senior, Grad
  
  -- Profile Media
  avatar_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs
  
  -- Visibility Settings
  yearbook_visible BOOLEAN DEFAULT true,
  show_socials BOOLEAN DEFAULT false,
  
  -- Social Links (optional, hidden until profile reveal)
  instagram_handle TEXT,
  snapchat_handle TEXT,
  linkedin_url TEXT,
  
  -- AI-Generated Tags
  personality_tags JSONB DEFAULT '[]'::jsonb, -- ["Creative", "Outgoing"]
  interests JSONB DEFAULT '[]'::jsonb, -- ["Music", "Gaming"]
  vibes JSONB DEFAULT '[]'::jsonb, -- ["Energetic", "Deep"]
  
  -- Modes
  friend_mode_enabled BOOLEAN DEFAULT true,
  roommate_mode_enabled BOOLEAN DEFAULT false,
  scrapbook_enabled BOOLEAN DEFAULT false,
  
  -- Scrapbook Preferences (if enabled)
  scrapbook_preferences JSONB, -- { gender_interest: [], age_range: [], etc }
  
  -- Legacy fields (for migration compatibility)
  school TEXT, -- Keep for migration, will be deprecated
  name TEXT, -- Keep for migration, use display_name instead
  age INTEGER,
  personality JSONB DEFAULT '[]'::jsonb, -- Legacy, use personality_tags
  looking_for JSONB DEFAULT '[]'::jsonb,
  goals JSONB,
  bond_print JSONB, -- Keep existing Bond Print
  love_print JSONB, -- Keep existing Love Print
  social_connections JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  blocked_users JSONB DEFAULT '[]'::jsonb,
  additional_info TEXT,
  has_completed_bond_print BOOLEAN DEFAULT false,
  
  -- Metadata
  is_verified BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_yearbook_visible ON profiles(yearbook_visible);
CREATE INDEX IF NOT EXISTS idx_profiles_scrapbook_enabled ON profiles(scrapbook_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_school ON profiles(school); -- Legacy, for migration

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can view profiles from same university (if yearbook_visible)
CREATE POLICY "Users can view profiles from same university"
  ON profiles FOR SELECT
  USING (
    university_id = (
      SELECT university_id FROM profiles WHERE id = auth.uid()
    )
    AND yearbook_visible = true
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, friend_id)
);

-- Indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- RLS for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- ============================================
-- SCRAPBOOK RATINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS scrapbook_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(rater_id, rated_id)
);

-- Indexes for scrapbook_ratings
CREATE INDEX IF NOT EXISTS idx_scrapbook_ratings_rater ON scrapbook_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_scrapbook_ratings_rated ON scrapbook_ratings(rated_id);

-- RLS for scrapbook_ratings (strict privacy - users can only see their own ratings)
ALTER TABLE scrapbook_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create ratings"
  ON scrapbook_ratings FOR INSERT
  WITH CHECK (rater_id = auth.uid());

-- Users can NEVER see who rated them (strict privacy)
CREATE POLICY "Users can only view their own ratings"
  ON scrapbook_ratings FOR SELECT
  USING (rater_id = auth.uid());

-- ============================================
-- MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- AI scoring
  compatibility_score DECIMAL(3,2), -- 0.00 to 1.00
  match_reasoning JSONB, -- AI explanation
  
  -- Bonded Stages progression
  current_stage TEXT DEFAULT 'text' CHECK (current_stage IN ('text', 'voice', 'photo', 'revealed')),
  stage_text_unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stage_voice_unlocked_at TIMESTAMP WITH TIME ZONE,
  stage_photo_unlocked_at TIMESTAMP WITH TIME ZONE,
  stage_revealed_at TIMESTAMP WITH TIME ZONE,
  
  -- Anonymous aliases (generated by AI)
  user1_alias TEXT,
  user2_alias TEXT,
  
  -- Match status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user1_id, user2_id)
);

-- Indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(current_stage);

-- RLS for matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL, -- Group messages by conversation
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'system')),
  media_url TEXT, -- For voice notes or images
  
  -- Match context (if this is a Bonded Stages chat)
  match_id UUID REFERENCES matches(id),
  is_anonymous BOOLEAN DEFAULT false, -- For stage 1-2 chats
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'friend_request', 'match', 'message', 'quad_reply', etc
  title TEXT NOT NULL,
  body TEXT,
  
  action_url TEXT, -- Where to navigate when clicked
  
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- UPDATE FORUM POSTS TO ADD UNIVERSITY_ID
-- ============================================

-- Add university_id to forum_posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forum_posts' AND column_name = 'university_id'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN university_id UUID REFERENCES universities(id);
    CREATE INDEX IF NOT EXISTS idx_forum_posts_university ON forum_posts(university_id);
  END IF;
END $$;

-- Add title and tags to forum_posts if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forum_posts' AND column_name = 'title'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN title TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forum_posts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate match compatibility score
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
  user1_uuid UUID,
  user2_uuid UUID
)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
AS $$
DECLARE
  score DECIMAL(3,2) := 0.00;
  user1_avg_rating DECIMAL(3,2);
  user2_avg_rating DECIMAL(3,2);
  mutual_rating INTEGER;
BEGIN
  -- Get average rating user1 gave to people
  SELECT AVG(rating)::DECIMAL(3,2) INTO user1_avg_rating
  FROM scrapbook_ratings
  WHERE rater_id = user1_uuid;
  
  -- Get average rating user2 gave to people
  SELECT AVG(rating)::DECIMAL(3,2) INTO user2_avg_rating
  FROM scrapbook_ratings
  WHERE rater_id = user2_uuid;
  
  -- Get mutual rating (if user1 rated user2)
  SELECT rating INTO mutual_rating
  FROM scrapbook_ratings
  WHERE rater_id = user1_uuid AND rated_id = user2_uuid;
  
  -- Calculate score: normalize ratings to 0-1 scale
  -- If mutual rating exists, weight it more heavily
  IF mutual_rating IS NOT NULL THEN
    score := (mutual_rating::DECIMAL / 10.0) * 0.7 + ((user1_avg_rating + user2_avg_rating) / 20.0) * 0.3;
  ELSE
    score := (user1_avg_rating + user2_avg_rating) / 20.0;
  END IF;
  
  RETURN LEAST(score, 1.00);
END;
$$;

