# Love Mode V2 - Rating System Implementation ✨

## Overview

Love Mode has been completely rebuilt with a **1-10 rating system** and **AI-powered blind matching**. Unlike Friend Mode (school-based), Love Mode is **distance-based** like Tinder, showing people from any school within your area.

## Key Differences from Friend Mode

| Feature | Friend Mode | Love Mode |
|---------|-------------|-----------|
| **Matching Basis** | School-specific | Distance-based (any school) |
| **Discovery** | Browse profiles freely | Rate profiles 1-10 |
| **Connection Creation** | Send soft intros manually | AI creates blind matches automatically |
| **Privacy** | Full profiles visible | Starts anonymous, reveals through stages |
| **Purpose** | Friends & roommates | Dating & romantic connection |

## User Flow

### 1. Entry & Introduction
- User toggles to Love Mode
- Sees intro screen explaining:
  - Rating system (1-10)
  - AI blind matching
  - Distance-based discovery
  - 4-stage anonymous progression

### 2. Rating Phase
**Profile Discovery:**
- Users see one profile at a time (Tinder-style)
- Full profile visible: photos, bio, interests, personality, major
- Shows distance from user (e.g., "3 miles away")
- **Not school-locked** - can see people from any university

**Rating Interface:**
- 10 buttons (1-10) to rate interest level
- Visual feedback:
  - 1-3: Gray (🤔 Not really)
  - 4-6: Purple (👍 Maybe)
  - 7-9: Pink (💜 Interested)
  - 10: Pink gradient (💕 Very interested!)
- Can skip profiles
- Progress bar shows X/Y profiles rated

**What Happens After Rating:**
- Rating stored privately (only user can see)
- If rating is 7+, system checks if other person also rated user 7+
- If mutual high rating → **Instant blind match created by AI**
- User sees: "✨ It's a match! Link is analyzing compatibility..."

### 3. AI Blind Matching Algorithm

**Match Creation Criteria:**
- Both users must rate each other **7 or higher**
- System automatically creates anonymous relationship
- No manual "swipe right" - AI handles everything

**Compatibility Score Calculation:**
```
Base Score = (rating1 + rating2) / 20 * 100
// e.g., both rate 8 = (8+8)/20*100 = 80%

Bond Print Bonuses:
+10% - Same communication style
+10% - Both high empathy (>0.7)
+5%  - Same humor style

Final Score = min(100, Base + Bonuses)
```

**Example:**
- User A rates User B: 9
- User B rates User A: 8
- Base: (9+8)/20*100 = 85%
- Both have "reflective" communication: +10%
- Both empathy >0.7: +10%
- Final: **100% AI Match Quality**

### 4. Anonymous Stages (Same as before)

**Stage 1: Anonymous Chat (💬)**
- Both users get AI-generated aliases (e.g., "Calm Fox" & "Golden Eagle")
- Text-only communication
- No names, no photos visible
- Link monitors sentiment

**Stage 2: Voice Exchange (🎤)**
- Unlocks after 15+ messages and 40+ bond score
- Voice memos enabled
- Deeper emotional connection

**Stage 3: Reveal Stage (✨)**
- Either user can request reveal
- Both must accept
- Names and full profiles become visible
- Can now see who you've been talking to!

**Stage 4: Bonded Date (❤️)**
- Ready for real-world meetup
- Date planning tools
- Safety checklist

## Technical Implementation

### Frontend Components

**LoveModeRating.tsx** - Main rating interface
- Fetches distance-based profiles
- Shows full profile with photos
- 1-10 rating buttons
- Handles match notifications
- Tinder-style card progression

**LoveMode.tsx** - Main container
- Intro screen with rating system explanation
- Routes between rating/matches/chat views
- Manages state

**LoveModeMatches.tsx** - Shows blind matches
- Displays AI-created matches
- Shows compatibility scores
- Bond strength progress bars
- "Rate More People" CTA

**LoveModeChat.tsx** - Stage-aware chat (unchanged)
- Anonymous messaging
- Stage progression
- Reveal requests
- Bond score tracking

### Backend Endpoints

**GET `/love-mode/discover`**
- Returns profiles to rate (distance-based)
- Excludes already-rated users
- Not school-filtered (any school)
- Simulated distance for now (can add real geolocation)

**POST `/love-mode/rate`**
```json
{
  "ratedUserId": "user-123",
  "rating": 8
}
```
- Stores rating privately
- Checks for mutual 7+ ratings
- Auto-creates blind match if mutual
- Returns `{ success: true, isMatch: true/false }`

**GET `/love-mode/relationships`**
- Returns user's AI-created matches
- Includes compatibility scores
- Shows bond strength
- Reveals profiles if stage >= 3

**GET `/love-mode/messages/:id`** (unchanged)
**POST `/love-mode/send-message`** (unchanged)
**POST `/love-mode/request-reveal`** (unchanged)

### Data Structures

**Rating Storage:**
```typescript
user:${userId}:love-ratings = {
  "user-123": {
    rating: 8,
    timestamp: "2025-01-01T12:00:00Z"
  },
  "user-456": {
    rating: 3,
    timestamp: "2025-01-01T12:05:00Z"
  }
}
```

**Blind Match (Relationship):**
```typescript
{
  id: "love:timestamp:userId1:userId2",
  userId1: "user-123",
  userId2: "user-456",
  alias1: "Calm Fox",      // User 1's alias
  alias2: "Golden Eagle",  // User 2's alias
  stage: 1,                // 1-4
  bondScore: 0,            // 0-100, increases with messages
  compatibilityScore: 87,  // AI calculated
  rating1: 8,              // How user1 rated user2
  rating2: 9,              // How user2 rated user1
  safetyIndex: 1.0,
  createdAt: "2025-01-01T12:05:30Z",
  revealRequestedBy: null
}
```

## AI (Link) Responsibilities

### During Rating
- **Match Detection**: Checks for mutual 7+ ratings
- **Compatibility Analysis**: Calculates score from ratings + Bond Print
- **Blind Match Creation**: Generates aliases, creates anonymous relationship

### During Chat
- **Sentiment Monitoring**: Tracks emotional tone of messages
- **Stage Progression**: Auto-advances when criteria met (15+ msgs, 40+ bond)
- **Coaching**: Provides occasional guidance
- **Safety**: Monitors for red flags (framework ready for Gemini integration)

### Bond Score Progression
- Starts at 0
- +2 per message sent
- Analyzed for quality (can enhance with Gemini sentiment)
- Triggers stage advancement

## Distance vs School Logic

### Friend Mode (School-Based)
```
School Filter: user.school === otherUser.school
Purpose: Campus community, roommates, study partners
Range: Same university only
```

### Love Mode (Distance-Based)
```
Distance Filter: Calculate from location (or simulate)
Purpose: Dating, romantic connection
Range: Within X miles (default: 20 miles)
Can include: Any school/university
```

## User Privacy & Safety

### What's Hidden Initially
- Real names (show aliases)
- Photos (show lock icon)
- School names (optional)
- Contact info
- Full profiles

### What's Visible at Each Stage
**Stage 1:**
- Alias only
- Generic avatar/icon
- Message content

**Stage 2:**
- Same as Stage 1
- + Voice memos

**Stage 3+ (After Reveal):**
- Real name
- Photos
- Full profile
- School/major
- All biographical info

### Ratings Privacy
- Your ratings are **never shown** to the rated person
- Only stored for AI matching
- Other user doesn't see your rating score
- They only know "match" or "no match"

## Testing the New Flow

### Test Scenario 1: Successful Match
1. Create User A and User B
2. Log in as User A → Love Mode → Rate profiles
3. Find User B's profile → Rate 8
4. Log in as User B → Love Mode → Rate profiles
5. Find User A's profile → Rate 9
6. **Result**: Both see "It's a match!" notification
7. Check "My Matches" → See blind match with aliases
8. Open chat → Anonymous conversation begins

### Test Scenario 2: Low Rating (No Match)
1. User A rates User B: 4
2. User B rates User A: 9
3. **Result**: No match created (User A rated too low)
4. Neither user knows about the mismatch

### Test Scenario 3: Progressive Reveal
1. Create match (both rate 7+)
2. Send 15+ messages
3. See Stage 2 unlock (Voice Exchange)
4. Request reveal
5. Wait for other to accept
6. See Stage 3 unlock → Profiles visible!

## Migration Notes

### What Changed
- ✅ Removed old "potential matches" endpoint
- ✅ Added `discover` endpoint (distance-based)
- ✅ Added `rate` endpoint with mutual match detection
- ✅ Enhanced relationship objects with compatibility scores
- ✅ Updated UI to show Tinder-style rating interface

### What Stayed the Same
- ✅ 4-stage progression system
- ✅ Anonymous aliases
- ✅ Chat functionality
- ✅ Reveal protocol
- ✅ Bond score tracking

### Backward Compatibility
- Old relationships still work
- Existing chat messages preserved
- Bond Print integration maintained

## Future Enhancements

### Immediate
1. **Real Geolocation**: Replace simulated distance with actual GPS
2. **Distance Filters**: Let users set max distance (5/10/20/50 miles)
3. **Enhanced AI**: Gemini integration for rating insights

### Medium-Term
1. **Re-rating**: Allow users to update ratings over time
2. **Rating Analytics**: Show user their avg ratings given
3. **Match Quality Prediction**: Pre-match compatibility preview
4. **Undo Rating**: Option to revoke last rating

### Long-Term
1. **Video Profiles**: Short video introductions to rate
2. **Question Prompts**: Answer prompts visible while rating
3. **Dealbreaker Filters**: Auto-exclude based on preferences
4. **A/B Testing**: Optimize rating thresholds (currently 7+)

## Success Metrics

### Key Metrics to Track
- **Rating Distribution**: How users rate (avg, mode, std dev)
- **Match Rate**: % of 7+ ratings that become mutual matches
- **Progression Rate**: % of matches that reach each stage
- **Time to Reveal**: Avg time from match to stage 3
- **Message Quality**: Bond score progression patterns

### Current Thresholds
- Match threshold: 7+ (both ways)
- Stage 2 unlock: 15 messages + 40 bond score
- Bond score increment: +2 per message
- Compatibility calculation: Ratings + Bond Print

## Summary

Love Mode V2 transforms dating into a **thoughtful, AI-guided experience**:

1. **Rate honestly** → AI learns your preferences
2. **Mutual high ratings** → Blind match created automatically
3. **Anonymous start** → Build emotional connection first
4. **Progressive reveal** → Earn intimacy through stages
5. **Distance-based** → Find love beyond campus

The system prioritizes **quality over quantity**, using AI to create meaningful matches that both people are genuinely interested in.
