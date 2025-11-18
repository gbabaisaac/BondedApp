# 🚀 Feature Enhancements Roadmap - Bonded App

## 💡 New Feature Ideas & Implementation Plan

Based on user feedback, here are the proposed enhancements with implementation priorities and technical considerations.

---

## 🎓 **SCHOOL-SPECIFIC FEATURES**

### 1. **School Name in Yearbook Header** ✅ Quick Win
**Priority:** High | **Effort:** Low | **Impact:** High

**Implementation:**
- [ ] Display school name at top of YearbookModern component
- [ ] Get school from userProfile.school
- [ ] Style with school colors if available
- [ ] Add school logo/icon if available

**Files to modify:**
- `src/components/YearbookModern.tsx` - Add school name to header

**Design:**
```
┌─────────────────────────────────┐
│  University of Illinois         │  ← School name
│  🔍  🔔                         │
└─────────────────────────────────┘
```

---

### 2. **School-Based Forum System** 🎯 Core Feature
**Priority:** Critical | **Effort:** High | **Impact:** Very High

**Current State:** Forum shows all posts
**Desired State:** 
- Default: Show only your school's forum
- Option: Browse other schools' forums
- Group forums (like YikYak) - location/interest-based

**Implementation Plan:**

#### Phase 1: School-Scoped Forums
- [ ] Add `school_id` filter to forum posts query
- [ ] Default filter to user's school
- [ ] Add school selector in ForumModern header
- [ ] Store selected school in state/localStorage
- [ ] Update backend to filter by school

#### Phase 2: Group Forums
- [ ] Create "Group Forums" concept
- [ ] Forum types: School, Location, Interest, Class, Club
- [ ] Add forum creation UI
- [ ] Forum discovery page
- [ ] Forum-specific post feeds

#### Phase 3: Forum Pages
- [ ] Create forum detail page (`/forum/:forumId`)
- [ ] Forum info (description, members, rules)
- [ ] Forum-specific posts
- [ ] Join/Leave forum functionality
- [ ] Forum moderation tools

**Database Schema:**
```sql
CREATE TABLE forums (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'school', 'location', 'interest', 'class', 'club'
  school_id UUID REFERENCES schools(id),
  location TEXT, -- For location-based forums
  interest TEXT, -- For interest-based forums
  class_code TEXT, -- For class forums
  club_id UUID REFERENCES clubs(id), -- For club forums
  created_by UUID REFERENCES users(id),
  member_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_members (
  forum_id UUID REFERENCES forums(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member', -- 'member', 'moderator', 'admin'
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (forum_id, user_id)
);
```

**API Endpoints Needed:**
- `GET /forums?school_id=xxx` - Get forums for a school
- `GET /forums?type=group` - Get group forums
- `POST /forums` - Create a forum
- `GET /forums/:id` - Get forum details
- `POST /forums/:id/join` - Join a forum
- `POST /forums/:id/leave` - Leave a forum
- `GET /forums/:id/posts` - Get posts in a forum

**Files to modify:**
- `src/components/ForumModern.tsx` - Add school filter, forum selector
- `src/utils/api-client.ts` - Add forum API functions
- `supabase/functions/make-server-2516be19/index.ts` - Add forum endpoints
- `src/components/ForumDetailView.tsx` - New component for forum pages

---

### 3. **Global Search - School-Wide** 🔍 Core Feature
**Priority:** High | **Effort:** Medium | **Impact:** High

**Current State:** No search functionality
**Desired State:** Search anyone in your school

**Implementation:**
- [ ] Add search bar to top navigation
- [ ] Search users by name, major, year, interests
- [ ] Search posts by content, tags
- [ ] Search clubs/orgs
- [ ] Search classes
- [ ] Filter results by type (People, Posts, Clubs, Classes)
- [ ] Recent searches history
- [ ] Trending searches

**Search Algorithm:**
- Full-text search on user names, bios, majors
- Tag matching for interests
- Fuzzy matching for typos
- Relevance scoring

**API Endpoints:**
- `GET /search?q=query&type=users&school_id=xxx`
- `GET /search?q=query&type=posts&school_id=xxx`
- `GET /search?q=query&type=clubs&school_id=xxx`
- `GET /search?q=query&type=classes&school_id=xxx`

**Files to create:**
- `src/components/SearchPage.tsx` - Main search interface
- `src/components/SearchResults.tsx` - Results display
- `src/utils/search.ts` - Search utilities

---

## 🤖 **AI MATCHING SYSTEM** 🧠 Advanced Feature
**Priority:** High | **Effort:** Very High | **Impact:** Very High

**Current State:** No active matching
**Desired State:** AI actively matches users for:
- Friends
- Roommates
- Study buddies
- Class partners

**Implementation Plan:**

### Phase 1: Matching Algorithm
- [ ] Create matching service/algorithm
- [ ] Factors to consider:
  - Shared interests
  - Same major/classes
  - Bond Print compatibility
  - Year level
  - Living preferences (for roommates)
  - Study habits (for study buddies)
  - Personality traits
- [ ] Calculate compatibility scores
- [ ] Rank potential matches

### Phase 2: Active Matching System
- [ ] Background job to find matches
- [ ] Daily/weekly match suggestions
- [ ] "People You Should Meet" section
- [ ] Match notifications
- [ ] Match reasons (why you're matched)

### Phase 3: Match Types
- [ ] Friend matches (general compatibility)
- [ ] Roommate matches (living preferences, habits)
- [ ] Study buddy matches (same classes, study style)
- [ ] Class partner matches (same courses, complementary skills)

**Database Schema:**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  match_type TEXT NOT NULL, -- 'friend', 'roommate', 'study_buddy', 'class_partner'
  compatibility_score FLOAT,
  match_reasons JSONB, -- Array of reasons why matched
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'connected'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, match_type)
);

CREATE TABLE match_suggestions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  suggested_user_id UUID REFERENCES users(id),
  match_type TEXT NOT NULL,
  score FLOAT,
  reasons JSONB,
  shown_at TIMESTAMP,
  interacted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**AI/ML Considerations:**
- Use machine learning for better matching over time
- Track successful matches to improve algorithm
- Consider user feedback on matches
- A/B test different matching strategies

**API Endpoints:**
- `GET /matches?type=friend` - Get friend matches
- `GET /matches?type=roommate` - Get roommate matches
- `GET /matches?type=study_buddy` - Get study buddy matches
- `POST /matches/:id/accept` - Accept a match
- `POST /matches/:id/decline` - Decline a match
- `GET /match-suggestions` - Get daily suggestions

**Files to create:**
- `src/components/MatchSuggestions.tsx` - Display matches
- `src/components/MatchCard.tsx` - Individual match card
- `src/utils/matching-algorithm.ts` - Matching logic
- `supabase/functions/match-engine/index.ts` - Backend matching service

---

## 📚 **CLASS SCHEDULE INTEGRATION** 🎓 Advanced Feature
**Priority:** High | **Effort:** High | **Impact:** Very High

**Current State:** No class integration
**Desired State:**
- Connect class schedule
- See people in same classes
- Create study groups
- Class-specific forums (locked to enrolled students)

**Implementation Plan:**

### Phase 1: Schedule Management
- [ ] Add schedule import (from school system or manual)
- [ ] Store class schedule in user profile
- [ ] Class data: code, name, professor, time, location
- [ ] Schedule display on profile
- [ ] Schedule privacy settings

### Phase 2: Class Connections
- [ ] Find classmates (same class code)
- [ ] Display classmates in class detail view
- [ ] "People in Your Classes" section
- [ ] Classmate suggestions

### Phase 3: Study Groups
- [ ] Create study group from class
- [ ] Invite classmates
- [ ] Study group chat
- [ ] Study group calendar/meetings
- [ ] Study group resources sharing

### Phase 4: Class Forums
- [ ] Auto-create forum for each class
- [ ] Lock forum to enrolled students only
- [ ] Class-specific posts (homework help, notes, etc.)
- [ ] Professor announcements (if professor joins)
- [ ] Class resources section

**Database Schema:**
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  code TEXT NOT NULL, -- e.g., "CS 374"
  name TEXT NOT NULL,
  professor TEXT,
  semester TEXT, -- "Fall 2024"
  year INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(school_id, code, semester, year)
);

CREATE TABLE user_classes (
  user_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  role TEXT DEFAULT 'student', -- 'student', 'ta', 'professor'
  enrolled_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, class_id)
);

CREATE TABLE study_groups (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES classes(id),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  max_members INT DEFAULT 10,
  member_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_group_members (
  study_group_id UUID REFERENCES study_groups(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member', -- 'member', 'leader'
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (study_group_id, user_id)
);
```

**Integration Options:**
1. **Manual Entry** - User adds classes manually
2. **CSV Import** - Upload schedule CSV
3. **School API** - Integrate with school's student portal (if available)
4. **Calendar Import** - Import from Google Calendar/iCal

**API Endpoints:**
- `POST /classes/import` - Import schedule
- `GET /classes/my-classes` - Get user's classes
- `GET /classes/:id/classmates` - Get classmates
- `POST /study-groups` - Create study group
- `GET /study-groups?class_id=xxx` - Get study groups for class
- `POST /study-groups/:id/join` - Join study group
- `GET /classes/:id/forum` - Get class forum

**Files to create:**
- `src/components/ScheduleManager.tsx` - Schedule import/management
- `src/components/ClassDetailView.tsx` - Class page with classmates
- `src/components/StudyGroupCreator.tsx` - Create study groups
- `src/components/StudyGroupCard.tsx` - Study group display
- `src/components/ClassForum.tsx` - Class-specific forum

---

## 🎨 **SCHOOL COLORS & THEMING** 🎨 Medium Priority
**Priority:** Medium | **Effort:** Medium | **Impact:** Medium

**Current State:** Fixed color scheme
**Desired State:** App colors match user's school colors

**Implementation:**
- [ ] Add school colors to database
- [ ] Primary color, secondary color, accent color
- [ ] Apply colors dynamically via CSS variables
- [ ] Update theme on school selection/login
- [ ] Store school colors in school table
- [ ] Fallback to default colors if school colors not set

**Database Schema:**
```sql
ALTER TABLE schools ADD COLUMN primary_color TEXT;
ALTER TABLE schools ADD COLUMN secondary_color TEXT;
ALTER TABLE schools ADD COLUMN accent_color TEXT;
ALTER TABLE schools ADD COLUMN logo_url TEXT;
```

**Implementation:**
- [ ] Create theme provider that reads school colors
- [ ] Update CSS variables based on school
- [ ] Apply to all components
- [ ] Cache theme in localStorage
- [ ] Add theme preview in settings

**Files to modify:**
- `src/styles/design-tokens.css` - Make colors dynamic
- `src/contexts/ThemeContext.tsx` - Add school color support
- `src/utils/theme.ts` - Theme utilities

---

## 🏛️ **CLUBS & ORGANIZATIONS** 🎭 Major Feature
**Priority:** High | **Effort:** Very High | **Impact:** Very High

**Current State:** No club/org support
**Desired State:**
- Create club/org profiles
- Add members to clubs
- Member status on user profiles
- Club-specific forums
- Club-specific yearbook
- Pinned posts (paid feature)

**Implementation Plan:**

### Phase 1: Club Profiles
- [ ] Create club profile type
- [ ] Club info: name, description, category, logo, cover photo
- [ ] Club creation flow
- [ ] Club settings (public/private, join requirements)
- [ ] Club admin/moderator roles

### Phase 2: Membership System
- [ ] Join/Leave club functionality
- [ ] Member roles (member, officer, admin)
- [ ] Member list display
- [ ] Member status badge on user profiles
- [ ] Membership verification

### Phase 3: Club Features
- [ ] Club-specific forum
- [ ] Club yearbook (members only)
- [ ] Club events calendar
- [ ] Club announcements
- [ ] Club resources/documents

### Phase 4: Monetization Features
- [ ] Pinned posts (paid feature)
- [ ] Club promotion/ads
- [ ] Premium club features
- [ ] Payment integration

**Database Schema:**
```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'academic', 'sports', 'cultural', 'social', etc.
  logo_url TEXT,
  cover_photo_url TEXT,
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  join_requirement TEXT, -- 'open', 'approval', 'invite_only'
  member_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE club_members (
  club_id UUID REFERENCES clubs(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member', -- 'member', 'officer', 'admin', 'founder'
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

CREATE TABLE club_pinned_posts (
  id UUID PRIMARY KEY,
  club_id UUID REFERENCES clubs(id),
  post_id UUID REFERENCES forum_posts(id),
  pinned_by UUID REFERENCES users(id),
  pinned_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- `POST /clubs` - Create a club
- `GET /clubs?school_id=xxx` - Get clubs for school
- `GET /clubs/:id` - Get club details
- `POST /clubs/:id/join` - Join club
- `POST /clubs/:id/leave` - Leave club
- `POST /clubs/:id/members/:userId` - Add/remove member (admin)
- `GET /clubs/:id/members` - Get club members
- `GET /clubs/:id/forum` - Get club forum
- `GET /clubs/:id/yearbook` - Get club yearbook
- `POST /clubs/:id/pin-post` - Pin a post (paid)

**Files to create:**
- `src/components/ClubProfile.tsx` - Club profile page
- `src/components/ClubCreator.tsx` - Create club flow
- `src/components/ClubMemberList.tsx` - Member management
- `src/components/ClubForum.tsx` - Club-specific forum
- `src/components/ClubYearbook.tsx` - Club yearbook view
- `src/components/MemberBadge.tsx` - Show club membership on profiles

---

## 📊 **IMPLEMENTATION PRIORITY**

### Phase 1: Quick Wins (Week 1)
1. ✅ School name in Yearbook header
2. ✅ School-scoped forum (default filter)
3. ✅ Basic search functionality

### Phase 2: Core Features (Weeks 2-3)
4. 🎯 Group forums system
5. 🎯 Forum pages (view/create forums)
6. 🎯 School colors theming
7. 🎯 Enhanced search (people, posts, clubs)

### Phase 3: Advanced Features (Weeks 4-6)
8. 🤖 AI matching system
9. 📚 Class schedule integration
10. 🏛️ Clubs & organizations

### Phase 4: Monetization (Week 7+)
11. 💰 Pinned posts (paid)
12. 💰 Club premium features
13. 💰 Analytics for clubs

---

## 🎯 **TECHNICAL CONSIDERATIONS**

### Performance
- **Caching:** Cache school data, forum lists, club lists
- **Pagination:** All lists need pagination
- **Indexing:** Database indexes on school_id, forum_id, club_id
- **Real-time:** WebSocket for forum updates, match notifications

### Scalability
- **Background Jobs:** Matching algorithm should run as background job
- **Search:** Consider Elasticsearch for full-text search
- **CDN:** Club logos, school logos should be on CDN
- **Rate Limiting:** Forum creation, club creation need rate limits

### Security
- **Verification:** Verify student enrollment for class forums
- **Moderation:** Club admins can moderate club forums
- **Privacy:** Class schedules should be private by default
- **Permissions:** Role-based access for clubs (member/officer/admin)

### User Experience
- **Onboarding:** Guide users to connect schedule, join clubs
- **Notifications:** Notify about matches, classmate connections
- **Discovery:** Help users discover relevant forums, clubs, classes
- **Gamification:** Badges for club membership, class participation

---

## 📝 **UPDATED CHECKLIST ITEMS**

Add these to the main checklist:

### School Features
- [ ] School name in Yearbook header
- [ ] School-scoped forum filtering
- [ ] School color theming
- [ ] School logo display

### Forum Enhancements
- [ ] Group forums (location, interest-based)
- [ ] Forum creation
- [ ] Forum pages/detail views
- [ ] Forum discovery
- [ ] Join/Leave forums
- [ ] Forum-specific post feeds

### Search
- [ ] Global search (users, posts, clubs, classes)
- [ ] Search filters
- [ ] Recent searches
- [ ] Trending searches

### AI Matching
- [ ] Matching algorithm
- [ ] Friend matches
- [ ] Roommate matches
- [ ] Study buddy matches
- [ ] Class partner matches
- [ ] Match suggestions
- [ ] Match notifications

### Class Integration
- [ ] Schedule import
- [ ] Classmate discovery
- [ ] Study group creation
- [ ] Class forums (locked)
- [ ] Class resources

### Clubs/Orgs
- [ ] Club profiles
- [ ] Club creation
- [ ] Membership system
- [ ] Club forums
- [ ] Club yearbooks
- [ ] Member badges
- [ ] Pinned posts (paid)

---

## 💭 **MY THOUGHTS & RECOMMENDATIONS**

### Excellent Ideas! 🎉

These features would make Bonded incredibly valuable for college students:

1. **School-specific forums** - Creates community feel
2. **Class integration** - Solves real pain point (finding study partners)
3. **AI matching** - Differentiates from other apps
4. **Clubs system** - Builds engagement and retention
5. **School theming** - Creates school pride/identity

### Implementation Strategy

**Start Small, Build Up:**
1. Begin with school-scoped forums (easy win)
2. Add school colors (quick visual impact)
3. Build class integration (high value)
4. Add clubs (community building)
5. Implement AI matching (advanced feature)

**Technical Debt to Avoid:**
- Don't hardcode school data - use database
- Make forum system flexible from start
- Design matching algorithm to be extensible
- Plan for multi-school from beginning

**Monetization Opportunities:**
- Pinned posts for clubs ($)
- Club promotion/ads ($$)
- Premium matching features ($$$)
- Study group premium features ($$)

### Questions to Consider

1. **Class Schedule Integration:**
   - How will you verify enrollment? (School API? Manual verification?)
   - What if school doesn't have API?

2. **Club Verification:**
   - How to verify official clubs vs. student groups?
   - Who can create clubs? (Anyone? Verified students only?)

3. **AI Matching:**
   - What's the matching frequency? (Daily? Weekly?)
   - How many matches per user?
   - Opt-in or automatic?

4. **Forum Moderation:**
   - Who moderates group forums?
   - Auto-moderation for class forums?
   - Reporting system?

---

**Next Steps:**
1. Prioritize which features to build first
2. Create detailed technical specs for each
3. Design database schema
4. Build API endpoints
5. Implement frontend components

Would you like me to start implementing any of these features? I'd recommend starting with:
1. School name in header (5 min)
2. School-scoped forums (2-3 hours)
3. School colors theming (1-2 hours)

These are quick wins that will have immediate impact!

