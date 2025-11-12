# Bonded - Strategic Overview & Roadmap

**Last Updated:** November 2024  
**Status:** Beta Launch - User Acquisition Phase

---

## 🎯 What is Bonded?

Bonded is a social networking platform designed exclusively for college students to find meaningful connections on campus. Unlike traditional dating apps, Bonded focuses on helping students discover friends, roommates, study partners, co-founders, and activity companions through AI-powered matching and personalized introductions.

**Core Value Proposition:**  
*"Find your people on campus - friends, roommates, study partners, and collaborators who actually get you."*

---

## ✨ Current Features (Beta Launch)

### 1. **Profile Creation & Bond Print**
- Comprehensive onboarding with 10-step wizard
- **Bond Print Quiz** - AI-powered personality assessment for friend/roommate/study partner compatibility
- Profile fields: Name, age, school, major, year, bio, interests, personality traits, living habits
- Goals tracking: Academic, leisure, career, and personal goals
- "Anything else we should know" field for AI matching context
- Photo uploads (multiple photos supported)

### 2. **Discover Feed (Instagram-Style Grid)**
- Swipeable profile cards with photos
- Bond Print compatibility scores displayed (highlighted for high matches)
- Advanced filtering:
  - By school
  - By major
  - By year
  - By "Looking For" (Friends, Roommate, Study Partner, etc.)
  - By academic/leisure goals
- Search functionality
- Profile detail view with full information

### 3. **Connections & Matching**
- Like profiles
- **Soft Intros** - AI-generated personalized introduction messages
- Connection requests with accept/decline
- Established connections list
- Pending/sent connections tracking

### 4. **Messaging**
- Real-time chat between connected users
- Unread message indicators
- Typing indicators
- Read receipts (toggleable in settings)
- Message timestamps
- Chat list with last message preview

### 5. **User Settings**
- Edit profile (direct editing, not full onboarding)
- Read receipts toggle
- Privacy settings

### 6. **Design System**
- **Brand Colors:** Teal Blue (#2E7B91), Ocean Blue (#25658A), Royal Navy (#1E4F74), Midnight Indigo (#132E54)
- **Typography:** Satoshi font (with Inter/Helvetica Neue fallbacks)
- **Visual Identity:** Fingerprint logo, soft gradients, rounded corners (12-16px)
- **Mobile-First:** Optimized for iOS Safari and mobile browsers
- **PWA:** Progressive Web App with offline capabilities

---

## 🚀 Features Coming Soon (Rollout Timeline)

### **Q1 2025 (January - March 2025)**

#### **January 2025 - Critical Launch Window**
**Target:** High school seniors who have committed to colleges

**Priority Features:**
1. **Link - AI Assistant** ⚡ *High Priority*
   - AI-powered connection finder
   - Natural language search ("find me a co-founder for my startup")
   - Smart profile matching based on goals and interests
   - Automated soft introductions with confirmation flow
   - **Status:** Built, disabled via feature flag (`AI_ASSISTANT_ENABLED: false`)
   - **Rollout:** Enable when user base reaches 500+ active users

2. **Enhanced Bond Print Matching**
   - Real-time compatibility scoring
   - Match explanations ("You're compatible because...")
   - Highlighted matches in grid view
   - **Status:** Partially implemented, needs refinement

**Why January is Critical:**
- High school seniors commit to colleges by January 1st (Early Decision) and January 15th (Regular Decision)
- They're actively looking for roommates and friends before starting college
- Perfect timing for "Find your roommate" campaigns

---

### **Q2 2025 (April - June 2025)**

#### **April 2025 - Pre-Fall Semester Push**
**Target:** Incoming freshmen and current students preparing for next year

1. **Classes Feature** 📚
   - Class schedule upload/input
   - Find study partners by class
   - Study group formation
   - Class-based matching
   - **Status:** Planned, UI placeholders removed
   - **Timeline:** 6-8 weeks development

2. **Feed Feature** 📱
   - Campus activity feed
   - Event discovery
   - Group activities
   - Campus news and updates
   - **Status:** Planned, UI placeholders removed
   - **Timeline:** 8-10 weeks development

3. **Enhanced Search & Discovery**
   - Advanced filters (location, interests, availability)
   - Saved searches
   - Recommended matches daily
   - **Timeline:** 4-6 weeks development

---

### **Q3 2025 (July - September 2025)**

#### **July 2025 - Fall Semester Prep**
**Target:** All college students preparing for fall semester

1. **Love Mode** 💕
   - Romantic matching feature
   - Blind matching system
   - Progressive reveal stages
   - **Status:** Built, disabled via feature flag (`LOVE_MODE_ENABLED: false`)
   - **Rollout:** Q3 2025 (after establishing strong friend mode base)
   - **Timeline:** Enable existing feature, add enhancements (4-6 weeks)

2. **Group Features**
   - Create and join groups
   - Study groups
   - Interest-based clubs
   - Event organization
   - **Timeline:** 10-12 weeks development

3. **Notifications System**
   - Push notifications (PWA)
   - Email notifications
   - In-app notification center
   - **Timeline:** 4-6 weeks development

---

### **Q4 2025 (October - December 2025)**

1. **Campus Integration**
   - University-specific features
   - Integration with campus systems (optional)
   - Verified student status
   - **Timeline:** 12-16 weeks development

2. **Advanced AI Features**
   - Personalized daily matches
   - Activity suggestions
   - Conversation starters
   - **Timeline:** 8-10 weeks development

---

## 🎨 Design Philosophy & Choices

### **Brand Identity**
- **Emotional Intelligence:** Warm, safe, modern, emotionally intelligent
- **Human + AI Harmony:** Technology that enhances, not replaces, human connection
- **Trust & Safety:** Grounded in trust, with safety as a core principle

### **Visual Design**
- **Color Palette:** Calming blues (trust, serenity) with subtle accent colors (connection, empathy)
- **Typography:** Satoshi - geometric, humanist sans-serif (warmth + clarity)
- **UI Elements:** Rounded corners (12-16px), soft gradients, subtle glows
- **Photography:** Emotive realism, natural lighting, calm tones

### **UX Principles**
- **Mobile-First:** Optimized for iPhone/Safari (primary user base)
- **Progressive Disclosure:** Information revealed as needed
- **Minimal Friction:** Easy onboarding, clear CTAs
- **Accessibility:** High contrast, readable fonts, touch-friendly targets

---

## 📈 Go-to-Market (GTM) Strategy

### **Phase 1: Beta Launch (November 2024 - January 2025)**
**Goal:** Acquire 1,000-2,000 active users

**Tactics:**
1. **High School Senior Focus**
   - Target: Seniors who have committed to colleges (Early Decision: Jan 1, Regular Decision: Jan 15)
   - Channels: TikTok, Instagram, Reddit (r/ApplyingToCollege, r/college)
   - Message: "Find your roommate and friends before you even get to campus"
   - Timing: **CRITICAL** - Launch campaigns mid-December through January

2. **Campus Ambassador Program**
   - Recruit 10-20 ambassadors at target schools
   - Provide exclusive beta access
   - Incentivize referrals (early access to Love Mode, premium features)

3. **Content Marketing**
   - "How to find a roommate" guides
   - "Making friends in college" content
   - User success stories
   - TikTok/Instagram Reels showing app features

4. **Partnerships**
   - College orientation programs
   - Student housing services
   - Campus clubs and organizations

### **Phase 2: Growth (February - April 2025)**
**Goal:** 5,000-10,000 active users

**Tactics:**
1. **Viral Features**
   - Enable Link AI Assistant (creates shareable moments)
   - Bond Print sharing (social media integration)
   - Referral program with rewards

2. **Campus Expansion**
   - Target top 50 universities
   - School-specific onboarding
   - Campus events and tabling

3. **Influencer Partnerships**
   - College lifestyle influencers
   - Study/college advice creators
   - Micro-influencers at target schools

### **Phase 3: Scale (May - August 2025)**
**Goal:** 25,000-50,000 active users

**Tactics:**
1. **Product-Led Growth**
   - Enable Classes and Feed features
   - Network effects (more users = better matches)
   - Organic sharing and referrals

2. **Paid Acquisition**
   - Meta Ads (Instagram, Facebook)
   - TikTok Ads
   - Google Search Ads ("find roommate college")

3. **PR & Media**
   - Press releases for major milestones
   - College media coverage
   - Podcast appearances

---

## ⚙️ Scaling Requirements & Database Strategy

### **Current Architecture**
- **Database:** PostgreSQL (Supabase) with JSONB key-value store pattern
- **Storage:** Supabase Storage for profile photos
- **Backend:** Supabase Edge Functions (Deno/Hono)
- **Frontend:** React + Vite (PWA)
- **AI:** Google Gemini API for Bond Print and soft intros

### **Scaling Milestones & Schema Updates**

#### **1,000 Users (Current Target)**
**Status:** ✅ Current architecture handles this
- No schema changes needed
- Single Supabase project sufficient
- KV store pattern works well

#### **10,000 Users**
**When to Update:** ~Q2 2025
**Changes Needed:**
1. **Add Indexes:**
   ```sql
   -- Performance indexes for common queries
   CREATE INDEX idx_users_school ON kv_store_2516be19 USING GIN ((value->>'school'));
   CREATE INDEX idx_users_major ON kv_store_2516be19 USING GIN ((value->>'major'));
   CREATE INDEX idx_users_looking_for ON kv_store_2516be19 USING GIN ((value->'lookingFor'));
   CREATE INDEX idx_users_year ON kv_store_2516be19 ((value->>'year'));
   ```

2. **Add Caching Layer:**
   - Redis for frequently accessed profiles
   - Cache Bond Print scores
   - Cache compatibility calculations

3. **Optimize Queries:**
   - Batch profile fetching
   - Pagination for large result sets
   - Lazy loading for images

#### **50,000 Users**
**When to Update:** ~Q3 2025
**Changes Needed:**
1. **Database Sharding:**
   - Shard by school (each school gets its own partition)
   - Separate KV stores per school cluster
   - Cross-school queries via federation

2. **Schema Normalization (Partial):**
   ```sql
   -- Create normalized tables for high-traffic data
   CREATE TABLE users (
     id UUID PRIMARY KEY,
     email TEXT UNIQUE,
     school TEXT,
     major TEXT,
     year TEXT,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   
   CREATE TABLE user_profiles (
     user_id UUID REFERENCES users(id),
     bio TEXT,
     interests JSONB,
     looking_for JSONB,
     goals JSONB,
     bond_print JSONB,
     PRIMARY KEY (user_id)
   );
   
   CREATE TABLE connections (
     id UUID PRIMARY KEY,
     user1_id UUID REFERENCES users(id),
     user2_id UUID REFERENCES users(id),
     status TEXT, -- 'pending', 'accepted', 'blocked'
     created_at TIMESTAMP,
     UNIQUE(user1_id, user2_id)
   );
   ```

3. **CDN for Assets:**
   - Move profile photos to CDN (Cloudflare, AWS CloudFront)
   - Image optimization and resizing
   - Lazy loading with placeholders

4. **Message Queue:**
   - RabbitMQ or AWS SQS for async operations
   - Background jobs for AI processing
   - Email/SMS notifications queue

#### **100,000+ Users**
**When to Update:** ~Q4 2025
**Changes Needed:**
1. **Microservices Architecture:**
   - Separate service for matching/algorithm
   - Separate service for messaging
   - Separate service for AI/ML
   - API gateway for routing

2. **Read Replicas:**
   - Primary database for writes
   - Multiple read replicas for queries
   - Geographic distribution

3. **Full Schema Migration:**
   - Complete migration from KV store to normalized schema
   - Data migration scripts
   - Zero-downtime migration strategy

4. **Advanced Caching:**
   - Distributed caching (Redis Cluster)
   - Cache warming strategies
   - Cache invalidation policies

### **Monitoring & Alerts**
- **Database Performance:** Monitor query times, connection pools
- **API Response Times:** Track Edge Function execution times
- **Error Rates:** Alert on 5xx errors, failed AI calls
- **User Metrics:** DAU, MAU, retention, engagement
- **Cost Monitoring:** Supabase usage, Gemini API costs

---

## 💰 Monetization Strategy

### **Phase 1: Free Tier (Current - Q2 2025)**
- All core features free
- Focus on user acquisition
- Build network effects

### **Phase 2: Freemium Model (Q3 2025)**
**Free Tier:**
- 10 profile views per day
- 5 soft intros per week
- Basic Bond Print
- Standard matching

**Premium Tier ($9.99/month or $79.99/year):**
- Unlimited profile views
- Unlimited soft intros
- Advanced Bond Print insights
- Priority matching
- See who viewed your profile
- Read receipts (already free, but highlight as premium feature)
- Early access to new features

**Campus Pass ($4.99/month):**
- School-specific features
- Verified student badge
- Campus event access
- Study group creation

### **Phase 3: Additional Revenue Streams (Q4 2025+)**
1. **Partnerships:**
   - Student housing services (referral fees)
   - Textbook rental services
   - Campus dining partnerships
   - Event ticket sales

2. **Advertising:**
   - Sponsored profiles (optional)
   - Campus event promotions
   - Brand partnerships (student-friendly brands)

3. **Enterprise:**
   - University partnerships (white-label solutions)
   - Orientation program integrations
   - Campus-wide licenses

### **Revenue Projections**
- **Year 1 (2025):** $0 (focus on growth)
- **Year 2 (2026):** $500K - $1M ARR (5% conversion to premium)
- **Year 3 (2027):** $2M - $5M ARR (10% conversion, partnerships)

---

## 🎯 Future Plans & Vision

### **Short-Term (2025)**
1. **Campus Expansion:** 100+ universities
2. **Feature Rollout:** Classes, Feed, Love Mode
3. **AI Enhancement:** Better matching, personalized recommendations
4. **Mobile Apps:** Native iOS and Android apps

### **Medium-Term (2026)**
1. **International Expansion:** Canada, UK, Australia
2. **Advanced Matching:** Machine learning models trained on user behavior
3. **Social Features:** Groups, events, campus feed
4. **Verification:** Student ID verification for safety

### **Long-Term (2027+)**
1. **Platform Expansion:** Post-graduation networking
2. **Career Features:** Internship matching, job connections
3. **Alumni Network:** Connect with graduates
4. **Global Reach:** 500+ universities worldwide

### **Technology Roadmap**
- **2025 Q2:** Native mobile apps (React Native)
- **2025 Q3:** Real-time features (WebSockets, Supabase Realtime)
- **2025 Q4:** Advanced AI (custom models, fine-tuning)
- **2026:** Machine learning infrastructure
- **2026+:** Microservices, global CDN, multi-region

---

## 🚨 Critical Success Factors

### **Immediate (Next 60 Days)**
1. **User Acquisition:** Hit 1,000 users by end of January 2025
2. **Product-Market Fit:** Validate core value proposition
3. **Retention:** 40%+ Day 7 retention
4. **Network Effects:** Ensure users find value even with smaller user base

### **Key Metrics to Track**
- **Acquisition:** New signups per day, CAC (Customer Acquisition Cost)
- **Activation:** % completing onboarding, % creating Bond Print
- **Engagement:** DAU/MAU ratio, messages sent, connections made
- **Retention:** Day 1, Day 7, Day 30 retention rates
- **Revenue:** Conversion to premium, ARPU (Average Revenue Per User)

---

## 📝 Notes

- **Current Status:** Beta launch, feature flags in place for gradual rollout
- **Tech Stack:** Modern, scalable, cost-effective
- **Team:** Lean startup approach, focus on product and growth
- **Timeline:** Aggressive but achievable with focus on high school seniors in January

---

**Next Steps:**
1. Execute January GTM campaign targeting high school seniors
2. Enable Link AI Assistant at 500+ users
3. Monitor metrics and iterate quickly
4. Prepare for Classes/Feed features in Q2 2025

