# Bonded Implementation Gap Analysis

## Executive Summary

This document analyzes the gap between the current codebase and the complete development specification. The app currently uses a **KV store pattern** with Edge Functions, while the spec requires a **proper PostgreSQL schema** with campus isolation and structured relationships.

---

## 🔴 Critical Gaps (Must Fix for Spec Compliance)

### 1. Database Architecture

**Spec Requires:**
- PostgreSQL tables: `universities`, `profiles`, `friendships`, `scrapbook_ratings`, `matches`, `messages`, `notifications`
- Row Level Security (RLS) for campus isolation
- Proper foreign key relationships

**Current State:**
- ✅ `forum_posts`, `forum_comments`, `forum_post_likes` tables exist
- ❌ Using KV store (`kv_store_2516be19`) for user profiles
- ❌ No `universities` table
- ❌ No `friendships` table (using "soft-intros" system)
- ❌ No `scrapbook_ratings` table
- ❌ No `matches` table
- ❌ No `notifications` table
- ❌ No proper `messages` table (using KV-based chats)

**Action Required:**
Create comprehensive migration to move from KV store to PostgreSQL tables.

---

### 2. Campus/University Isolation

**Spec Requires:**
- `universities` table with domain validation
- Email domain verification during signup
- RLS policies to enforce campus isolation
- Users can only see profiles from their university

**Current State:**
- ✅ School-based filtering exists (`school:${school}:users` in KV)
- ❌ No `universities` table
- ❌ No email domain validation
- ❌ No proper RLS for campus isolation
- ⚠️ School is stored as string, not linked to university entity

**Action Required:**
1. Create `universities` migration
2. Add email domain validation in signup flow
3. Update all queries to use `university_id` instead of `school` string
4. Implement RLS policies

---

### 3. Navigation Structure

**Spec Requires:**
```
Bottom Nav: 📖 Yearbook | 👥 Friends | 💬 Quad | 💕 Scrapbook
Top Nav: [Profile] bonded [Messages]
```

**Current State:**
- ✅ Top nav exists (Profile icon, bonded logo, Messages icon placeholder)
- ✅ Bottom nav exists but:
  - Uses "Connections" instead of "Friends"
  - Scrapbook is accessed via mode toggle, not bottom nav
  - Tab IDs: `discover`, `matches`, `messages`, `forum`

**Action Required:**
1. Rename "Connections" → "Friends" in UI
2. Add Scrapbook as 4th bottom nav tab
3. Remove mode toggle (Scrapbook becomes its own page)
4. Update routing to match spec

---

### 4. Friends System

**Spec Requires:**
- `friendships` table with status: `pending`, `accepted`, `declined`, `blocked`
- Friends page with tabs: My Friends, Requests, Suggestions
- Proper friend request flow

**Current State:**
- ✅ `MatchSuggestions` component exists with tabs: pending, sent, connections
- ❌ Using "soft-intros" system instead of proper friendships
- ❌ No `friendships` table
- ⚠️ Current system is more like "connection requests" than friendships

**Action Required:**
1. Create `friendships` table migration
2. Refactor `MatchSuggestions` → `Friends` component
3. Update backend to use friendships table
4. Implement proper friend request/accept/decline flow

---

### 5. Scrapbook (Dating Mode)

**Spec Requires:**
- `scrapbook_ratings` table (anonymous 1-10 ratings)
- `matches` table with Bonded Stages progression
- Stages: `text` → `voice` → `photo` → `revealed`
- AI-generated aliases for anonymous chats
- Match algorithm based on mutual high ratings

**Current State:**
- ✅ `LoveModeNew` component exists
- ✅ Rating system exists (`LoveModeRatingNew`)
- ✅ Chat system exists (`BlindChatWithLink`)
- ❌ No `scrapbook_ratings` table
- ❌ No `matches` table
- ❌ Stages not properly tracked in database
- ❌ Match algorithm different from spec
- ⚠️ Current system uses "relationships" in KV, not structured matches

**Action Required:**
1. Create `scrapbook_ratings` and `matches` table migrations
2. Refactor LoveMode → Scrapbook to match spec
3. Implement Bonded Stages progression system
4. Update match algorithm to use mutual ratings
5. Add AI alias generation

---

### 6. Messages System

**Spec Requires:**
- `messages` table with proper structure
- Support for text, voice, image, system messages
- Match context for Scrapbook chats
- Anonymous messaging for early stages

**Current State:**
- ✅ `ChatView` component exists
- ✅ Real-time messaging works
- ❌ Using KV store for chats (`chat:${userId1}:${userId2}`)
- ❌ No proper `messages` table
- ⚠️ Structure is different from spec

**Action Required:**
1. Create `messages` table migration
2. Migrate existing KV chats to messages table
3. Add support for match context
4. Implement anonymous messaging for stages

---

### 7. Notifications System

**Spec Requires:**
- `notifications` table
- Real-time notification subscriptions
- Browser push notifications
- Types: friend_request, match, message, quad_reply, etc.

**Current State:**
- ❌ No notifications table
- ❌ No notification system
- ⚠️ Only badge counts in navigation

**Action Required:**
1. Create `notifications` table migration
2. Implement notification creation triggers
3. Add real-time subscriptions
4. Add browser push notification support

---

## 🟡 Medium Priority Gaps

### 8. Profile Structure

**Spec Requires:**
```typescript
{
  university_id: UUID,
  first_name, last_name, display_name,
  pronouns, bio, graduation_year, major, minor, class_year,
  avatar_url, photos: JSONB,
  yearbook_visible, show_socials,
  instagram_handle, snapchat_handle, linkedin_url,
  personality_tags, interests, vibes: JSONB,
  friend_mode_enabled, roommate_mode_enabled, scrapbook_enabled,
  scrapbook_preferences: JSONB,
  is_verified, last_active
}
```

**Current State:**
- ✅ Most fields exist in KV store
- ❌ No `university_id` (using `school` string)
- ❌ No `pronouns`, `graduation_year`, `minor`, `class_year`
- ❌ No `yearbook_visible`, `show_socials` flags
- ❌ No `personality_tags`, `vibes` (only `personality`, `interests`)
- ❌ No `scrapbook_enabled`, `scrapbook_preferences`
- ⚠️ Structure is similar but not identical

**Action Required:**
1. Map current fields to spec structure
2. Add missing fields
3. Create proper profiles table migration

---

### 9. Quad (Forum) Enhancements

**Spec Requires:**
- `quad_posts` table (we have `forum_posts` - need rename)
- Title field for posts
- Tags/hashtags support
- Media arrays (multiple images)
- University isolation

**Current State:**
- ✅ `forum_posts` table exists
- ✅ Media support exists
- ✅ Comments, likes/dislikes work
- ❌ No `title` field
- ❌ No `tags` field (hashtag extraction needed)
- ❌ No `university_id` (should filter by campus)
- ⚠️ Table name mismatch (`forum_posts` vs `quad_posts`)

**Action Required:**
1. Add `title` and `tags` columns
2. Add `university_id` column
3. Update RLS to filter by university
4. Consider renaming table (or keep `forum_posts`)

---

### 10. Link AI Integration

**Spec Requires:**
- Anthropic Claude API (currently using Gemini)
- Intent parsing for user requests
- Profile recommendations
- Connection facilitation

**Current State:**
- ✅ Link AI exists in ChatView
- ✅ Profile search and recommendations work
- ✅ Soft intro system exists
- ❌ Using Gemini API instead of Anthropic
- ⚠️ Functionality is similar but API different

**Action Required:**
1. Decide: Keep Gemini or migrate to Anthropic?
2. If migrating, update all AI calls
3. Enhance intent parsing per spec

---

## 🟢 Low Priority / Nice to Have

### 11. PWA Configuration

**Spec Requires:**
- Vite PWA plugin
- Service worker
- App manifest
- Install prompts

**Current State:**
- ⚠️ Need to check if PWA is configured

**Action Required:**
1. Verify PWA setup
2. Add manifest.json
3. Configure service worker

---

### 12. Voice Message Support

**Spec Requires:**
- Whisper API for transcription
- Voice message safety screening
- Voice stage in Bonded Stages

**Current State:**
- ❌ No voice message support
- ❌ No Whisper integration

**Action Required:**
1. Add voice recording UI
2. Integrate Whisper API
3. Add safety screening
4. Implement voice stage progression

---

### 13. Image Optimization

**Spec Requires:**
- Image compression before upload
- CDN for media delivery
- Lazy loading

**Current State:**
- ✅ Image optimization utilities exist
- ⚠️ May need enhancement

**Action Required:**
1. Verify compression pipeline
2. Set up CDN if needed
3. Ensure lazy loading works

---

## 📋 Migration Roadmap

### Phase 1: Database Foundation (Week 1-2)

1. **Create Core Tables Migration**
   ```sql
   - universities
   - profiles (migrate from KV)
   - friendships
   - notifications
   ```

2. **Migrate Data from KV Store**
   - Write migration script to move user profiles
   - Preserve all existing data
   - Update all Edge Functions to use tables

3. **Implement RLS Policies**
   - Campus isolation
   - Privacy controls
   - Friend visibility

### Phase 2: Friends & Navigation (Week 2-3)

1. **Refactor Friends System**
   - Create friendships table
   - Update MatchSuggestions → Friends component
   - Implement proper friend requests

2. **Update Navigation**
   - Add Scrapbook to bottom nav
   - Remove mode toggle
   - Update routing

### Phase 3: Scrapbook & Matches (Week 3-4)

1. **Create Scrapbook Tables**
   ```sql
   - scrapbook_ratings
   - matches
   ```

2. **Refactor LoveMode → Scrapbook**
   - Update component structure
   - Implement Bonded Stages
   - Add AI alias generation

3. **Update Match Algorithm**
   - Use mutual ratings
   - Implement compatibility scoring

### Phase 4: Messages & Notifications (Week 4-5)

1. **Create Messages Table**
   - Migrate from KV chats
   - Add match context support
   - Implement anonymous messaging

2. **Notifications System**
   - Create table
   - Add real-time subscriptions
   - Browser push notifications

### Phase 5: Polish & Testing (Week 5-6)

1. **Quad Enhancements**
   - Add title, tags
   - University filtering

2. **Profile Structure**
   - Add missing fields
   - Update all components

3. **Testing & Bug Fixes**
   - End-to-end testing
   - Performance optimization
   - Security audit

---

## 🎯 Quick Wins (Can Do Now)

1. ✅ **Rename "Connections" → "Friends"** in UI
2. ✅ **Add Messages icon to top nav** (currently placeholder)
3. ✅ **Update Quad table name** (forum_posts → quad_posts) or keep as-is
4. ✅ **Add title field to forum posts** (if desired)
5. ✅ **Add tags/hashtag extraction** to Quad posts

---

## 📊 Current vs Spec Comparison

| Feature | Spec | Current | Status |
|---------|------|---------|--------|
| Database | PostgreSQL tables | KV store | ❌ Need migration |
| Universities | Table + domain validation | School string | ❌ Need table |
| Friends | Friendships table | Soft-intros | ❌ Need table |
| Scrapbook | Rating + matches tables | LoveMode (KV) | ❌ Need tables |
| Messages | Messages table | KV chats | ❌ Need table |
| Notifications | Notifications table | None | ❌ Need table |
| Navigation | 4 tabs + Scrapbook | 4 tabs, mode toggle | 🟡 Close |
| Quad | Title, tags, university | Basic posts | 🟡 Close |
| Link AI | Anthropic | Gemini | 🟡 Different API |
| Voice | Whisper integration | None | ❌ Missing |

---

## 🚀 Recommended Next Steps

1. **Start with Database Migration** - This is the foundation
2. **Create Universities Table** - Enables campus isolation
3. **Migrate Profiles to Table** - Move from KV to PostgreSQL
4. **Create Friendships Table** - Proper friend system
5. **Update Navigation** - Add Scrapbook, rename Connections
6. **Create Scrapbook Tables** - Ratings and matches
7. **Migrate Messages** - Move from KV to table
8. **Add Notifications** - Complete the system

---

## 💡 Key Decisions Needed

1. **Keep Gemini or migrate to Anthropic?** (Spec says Anthropic)
2. **Rename forum_posts to quad_posts?** (Spec says quad_posts)
3. **Migration strategy:** Big bang or gradual? (Recommend gradual)
4. **Keep KV for some data?** (Recommend full migration for consistency)

---

## 📝 Notes

- Current codebase is functional but uses different architecture
- KV store pattern works but doesn't scale as well as PostgreSQL
- Most UI components exist, need database layer changes
- Edge Functions will need significant refactoring
- Consider backward compatibility during migration

