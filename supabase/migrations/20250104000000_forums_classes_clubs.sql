-- Migration: Forums, Classes, Clubs, and Related Tables
-- Created: 2025-01-04
-- Description: Adds tables for forums system, classes system, clubs system, matches, notifications, and schools

-- ============================================
-- FORUMS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('school', 'location', 'interest', 'class', 'club')),
  school_id UUID,
  location TEXT, -- For location-based forums
  interest TEXT, -- For interest-based forums
  class_code TEXT, -- For class forums
  club_id UUID, -- For club forums
  created_by UUID REFERENCES auth.users(id),
  member_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_members (
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (forum_id, user_id)
);

-- ============================================
-- CLASSES SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID,
  code TEXT NOT NULL, -- e.g., "CS 374"
  name TEXT NOT NULL,
  professor TEXT,
  semester TEXT, -- "Fall 2024"
  year INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, code, semester, year)
);

CREATE TABLE IF NOT EXISTS user_classes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'ta', 'professor')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, class_id)
);

CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  max_members INT DEFAULT 10,
  member_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_group_members (
  study_group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'leader')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (study_group_id, user_id)
);

-- ============================================
-- CLUBS & ORGANIZATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'academic', 'sports', 'cultural', 'social', etc.
  logo_url TEXT,
  cover_photo_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  join_requirement TEXT DEFAULT 'open' CHECK (join_requirement IN ('open', 'approval', 'invite_only')),
  member_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club_members (
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'officer', 'admin', 'founder')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

CREATE TABLE IF NOT EXISTS club_pinned_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  post_id UUID, -- References forum_posts.id (if forum_posts table exists)
  pinned_by UUID REFERENCES auth.users(id),
  pinned_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI MATCHING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('friend', 'roommate', 'study_buddy', 'class_partner')),
  compatibility_score FLOAT,
  match_reasons JSONB, -- Array of reasons why matched
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'connected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, match_type)
);

CREATE TABLE IF NOT EXISTS match_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('friend', 'roommate', 'study_buddy', 'class_partner')),
  score FLOAT,
  reasons JSONB,
  shown_at TIMESTAMP WITH TIME ZONE,
  interacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'message', 'match', 'post_like', 'post_comment', 'forum_mention', 'club_invite', 'study_group_invite')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- Additional data for the notification
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHOOLS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  domain TEXT, -- e.g., "illinois.edu"
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Forums indexes
CREATE INDEX IF NOT EXISTS idx_forums_school_id ON forums(school_id);
CREATE INDEX IF NOT EXISTS idx_forums_type ON forums(type);
CREATE INDEX IF NOT EXISTS idx_forum_members_user_id ON forum_members(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_members_forum_id ON forum_members(forum_id);

-- Classes indexes
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_user_classes_user_id ON user_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_classes_class_id ON user_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_class_id ON study_groups(class_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);

-- Clubs indexes
CREATE INDEX IF NOT EXISTS idx_clubs_school_id ON clubs(school_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_user_id ON match_suggestions(user_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Schools indexes
CREATE INDEX IF NOT EXISTS idx_schools_domain ON schools(domain);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_pinned_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read their own data and public data)
-- Note: These are basic policies. You should customize based on your security requirements.

-- Forums: Users can read public forums and forums they're members of
CREATE POLICY "Users can view public forums" ON forums
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Forum members: Users can view members of forums they belong to
CREATE POLICY "Users can view forum members" ON forum_members
  FOR SELECT USING (user_id = auth.uid() OR forum_id IN (SELECT forum_id FROM forum_members WHERE user_id = auth.uid()));

-- Classes: Users can view classes at their school
CREATE POLICY "Users can view classes" ON classes
  FOR SELECT USING (true); -- Adjust based on school filtering

-- User classes: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON user_classes
  FOR SELECT USING (user_id = auth.uid());

-- Study groups: Users can view study groups for classes they're enrolled in
CREATE POLICY "Users can view study groups" ON study_groups
  FOR SELECT USING (class_id IN (SELECT class_id FROM user_classes WHERE user_id = auth.uid()));

-- Clubs: Users can view public clubs and clubs they're members of
CREATE POLICY "Users can view clubs" ON clubs
  FOR SELECT USING (is_public = true OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()));

-- Matches: Users can view their own matches
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Schools: Everyone can view schools
CREATE POLICY "Everyone can view schools" ON schools
  FOR SELECT USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE forums IS 'Forums for different types (school, location, interest, class, club)';
COMMENT ON TABLE forum_members IS 'Membership in forums';
COMMENT ON TABLE classes IS 'Classes offered at schools';
COMMENT ON TABLE user_classes IS 'User enrollment in classes';
COMMENT ON TABLE study_groups IS 'Study groups for classes';
COMMENT ON TABLE clubs IS 'Clubs and organizations at schools';
COMMENT ON TABLE club_members IS 'Membership in clubs';
COMMENT ON TABLE matches IS 'AI-generated matches between users';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE schools IS 'School information including colors and branding';

