# 🚀 Friend Mode Optimization Plan
## Transform Bonded into a Real Social Network for College Students

---

## 🎯 Vision

Create an intelligent social network that helps college students find:
- **Roommates** (compatible living styles)
- **Friends** (shared interests & goals)
- **Study Buddies** (same classes/majors)
- **Going Out Partners** (similar leisure interests)

All powered by AI that understands academic goals, leisure goals, and creates personalized soft intros.

---

## 📋 Phase 1: Enhanced Profile & Signup (Week 1-2)

### 1.1 Add Future Goals Questions to Onboarding

**New Step in OnboardingWizard: "Future Goals"**

Add after "Looking For" step (Step 9):

```typescript
// Step 9: Future Goals
const [academicGoals, setAcademicGoals] = useState<string[]>([]);
const [leisureGoals, setLeisureGoals] = useState<string[]>([]);
const [careerGoals, setCareerGoals] = useState<string>('');
const [personalGoals, setPersonalGoals] = useState<string>('');
```

**Questions to Ask:**

**Academic Goals (Multi-select):**
- "What are your academic goals?" (Optional - can skip)
  - [ ] Maintain high GPA (3.5+)
  - [ ] Get into grad school
  - [ ] Land internships
  - [ ] Build portfolio/projects
  - [ ] Join research labs
  - [ ] Study abroad
  - [ ] Change major
  - [ ] Just graduate
  - [ ] Other (text input)

**Leisure Goals (Multi-select):**
- "What do you want to do for fun?" (Optional - can skip)
  - [ ] Join clubs/orgs
  - [ ] Play sports
  - [ ] Go to parties
  - [ ] Explore the city
  - [ ] Try new restaurants
  - [ ] Attend concerts/events
  - [ ] Outdoor activities
  - [ ] Gaming
  - [ ] Travel
  - [ ] Other (text input)

**Career Goals (Text - Optional):**
- "What's your dream career or field?" (Optional)
  - Free text input
  - Examples: "Software Engineer at Google", "Medical School", "Start my own business"

**Personal Goals (Text - Optional):**
- "Any personal goals you're working towards?" (Optional)
  - Free text input
  - Examples: "Get fit", "Learn Spanish", "Read more books"

**UI Design:**
- Make it clear these are optional
- Show message: "We'll use this to connect you with like-minded people on campus"
- Allow skipping with "Skip for now" button
- Progress indicator shows it's optional

### 1.2 Update Profile Schema

**Add to profile object:**
```typescript
interface UserProfile {
  // ... existing fields
  
  // New fields
  goals?: {
    academic?: string[];      // ['maintain-gpa', 'grad-school', 'internships']
    leisure?: string[];         // ['join-clubs', 'sports', 'parties']
    career?: string;            // "Software Engineer at Google"
    personal?: string;          // "Get fit and learn Spanish"
  };
  
  // Enhanced lookingFor with more options
  lookingFor?: string[];       // ['roommate', 'friends', 'study-buddy', 'going-out']
  
  // Class schedule (Phase 2)
  classSchedule?: {
    classes?: ClassInfo[];
    lastUpdated?: string;
  };
}

interface ClassInfo {
  name: string;           // "CS 101"
  code: string;           // "CS101"
  professor?: string;
  days: string[];         // ['Monday', 'Wednesday']
  time?: string;          // "10:00 AM - 11:30 AM"
  building?: string;
  semester?: string;      // "Fall 2024"
}
```

### 1.3 Update OnboardingWizard Component

**Changes needed:**
1. Add Step 9: Future Goals
2. Update totalSteps to 9
3. Add state for new goal fields
4. Include goals in profile submission
5. Make step skippable

---

## 📋 Phase 2: AI-Powered Soft Intro System (Week 2-3)

### 2.1 Enhanced AI Analysis Function

**Create new endpoint: `/make-server-2516be19/soft-intro/generate-ai-analysis`**

```typescript
app.post("/make-server-2516be19/soft-intro/generate-ai-analysis", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { toUserId, reason } = await c.req.json();
    
    // Get both profiles
    const currentProfile = await kv.get(`user:${userId}`);
    const targetProfile = await kv.get(`user:${toUserId}`);
    
    if (!currentProfile || !targetProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Generate AI analysis using Gemini
    const analysis = await generateAISoftIntro(
      currentProfile,
      targetProfile,
      reason
    );

    return c.json(analysis);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return c.json({ error: error.message }, 500);
  }
});

async function generateAISoftIntro(
  user1: any,
  user2: any,
  reason: string
): Promise<{ analysis: string; score: number; highlights: string[] }> {
  
  const prompt = `You are an AI assistant helping college students make meaningful connections. 

Generate a personalized soft intro analysis for why ${user1.name} should connect with ${user2.name}.

User 1 (${user1.name}):
- Major: ${user1.major}
- Year: ${user1.year}
- Interests: ${user1.interests?.join(', ') || 'None specified'}
- Looking for: ${user1.lookingFor?.join(', ') || 'Not specified'}
- Academic goals: ${user1.goals?.academic?.join(', ') || 'Not specified'}
- Leisure goals: ${user1.goals?.leisure?.join(', ') || 'Not specified'}
- Career goals: ${user1.goals?.career || 'Not specified'}
- Personality: ${user1.personality?.join(', ') || 'Not specified'}

User 2 (${user2.name}):
- Major: ${user2.major}
- Year: ${user2.year}
- Interests: ${user2.interests?.join(', ') || 'None specified'}
- Looking for: ${user2.lookingFor?.join(', ') || 'Not specified'}
- Academic goals: ${user2.goals?.academic?.join(', ') || 'Not specified'}
- Leisure goals: ${user2.goals?.leisure?.join(', ') || 'Not specified'}
- Career goals: ${user2.goals?.career || 'Not specified'}
- Personality: ${user2.personality?.join(', ') || 'Not specified'}

Connection reason: ${reason} (roommate/friends/study-buddy/going-out)

Generate:
1. A warm, personalized analysis (2-3 sentences) explaining why they'd be a great match
2. A compatibility score (0-100)
3. 2-3 key highlights of what they have in common

Focus on:
- Shared academic/leisure goals
- Complementary personalities
- Common interests
- Why this connection makes sense for the reason given

Return JSON:
{
  "analysis": "Your analysis here...",
  "score": 85,
  "highlights": ["Both interested in tech", "Similar study habits", "Want to explore the city"]
}`;

  // Call Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  // Fallback
  return {
    analysis: "You seem like a great match!",
    score: 75,
    highlights: ["Shared interests", "Similar goals"]
  };
}
```

### 2.2 Update SoftIntroFlow Component

**Enhancements:**
1. Call new AI endpoint instead of mock function
2. Show compatibility score
3. Display highlights
4. Better UI for AI analysis

---

## 📋 Phase 3: Advanced Filtering & Discovery (Week 3-4)

### 3.1 Enhanced Filter System

**Update InstagramGrid component:**

```typescript
// New filter options
const [filterLookingFor, setFilterLookingFor] = useState<string>('all');
const [filterMajor, setFilterMajor] = useState<string>('all');
const [filterYear, setFilterYear] = useState<string>('all');
const [filterAcademicGoal, setFilterAcademicGoal] = useState<string>('all');
const [filterLeisureGoal, setFilterLeisureGoal] = useState<string>('all');
const [filterClass, setFilterClass] = useState<string>(''); // For study buddy search
```

**Filter UI:**
- Primary filter: Looking For (All, Roommate, Friends, Study Buddy, Going Out)
- Secondary filters (expandable):
  - Major
  - Year
  - Academic Goals
  - Leisure Goals
  - Class (for study buddy - text input)

### 3.2 Smart Matching Algorithm

**Create endpoint: `/make-server-2516be19/discover/smart-matches`**

```typescript
app.get("/make-server-2516be19/discover/smart-matches", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const {
      lookingFor,
      major,
      year,
      academicGoal,
      leisureGoal,
      classCode,
      limit = 20
    } = c.req.query();

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get all users from same school
    const schoolKey = `school:${userProfile.school}:users`;
    const schoolUserIds = await kv.get(schoolKey) || [];
    
    // Filter out current user and existing connections
    const connections = await kv.get(`user:${userId}:connections`) || [];
    const pendingIntros = await kv.get(`user:${userId}:soft-intros:outgoing`) || [];
    
    const excludeIds = new Set([userId, ...connections, ...pendingIntros]);
    const candidateIds = schoolUserIds.filter((id: string) => !excludeIds.has(id));
    
    // Batch fetch profiles
    const profileKeys = candidateIds.map((id: string) => `user:${id}`);
    const profiles = await kv.mget(profileKeys);
    
    // Filter and score matches
    let matches = profiles
      .filter((p: any) => p && p.id)
      .map((profile: any) => ({
        profile,
        score: calculateMatchScore(userProfile, profile, {
          lookingFor,
          major,
          year,
          academicGoal,
          leisureGoal,
          classCode,
        }),
      }))
      .filter((m: any) => m.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map((m: any) => m.profile);

    return c.json(matches);
  } catch (error: any) {
    console.error('Smart matches error:', error);
    return c.json({ error: error.message }, 500);
  }
});

function calculateMatchScore(
  user1: any,
  user2: any,
  filters: any
): number {
  let score = 0;

  // Filter by lookingFor
  if (filters.lookingFor && filters.lookingFor !== 'all') {
    if (!user2.lookingFor?.includes(filters.lookingFor)) {
      return 0; // No match
    }
    score += 30; // Base match
  }

  // Filter by major
  if (filters.major && filters.major !== 'all') {
    if (user2.major?.toLowerCase() !== filters.major.toLowerCase()) {
      return 0;
    }
    score += 20;
  }

  // Filter by year
  if (filters.year && filters.year !== 'all') {
    if (user2.year !== filters.year) {
      return 0;
    }
    score += 10;
  }

  // Filter by academic goal
  if (filters.academicGoal && filters.academicGoal !== 'all') {
    if (user2.goals?.academic?.includes(filters.academicGoal)) {
      score += 25;
    } else {
      return 0;
    }
  }

  // Filter by leisure goal
  if (filters.leisureGoal && filters.leisureGoal !== 'all') {
    if (user2.goals?.leisure?.includes(filters.leisureGoal)) {
      score += 25;
    } else {
      return 0;
    }
  }

  // Filter by class (for study buddy)
  if (filters.classCode) {
    const user1Classes = user1.classSchedule?.classes || [];
    const user2Classes = user2.classSchedule?.classes || [];
    const hasCommonClass = user1Classes.some((c1: any) =>
      user2Classes.some((c2: any) =>
        c1.code?.toLowerCase() === filters.classCode.toLowerCase() ||
        c2.code?.toLowerCase() === filters.classCode.toLowerCase()
      )
    );
    if (hasCommonClass) {
      score += 40; // High score for same class
    } else {
      return 0; // Must have same class for study buddy
    }
  }

  // Bonus scoring (even without filters)
  // Common interests
  const commonInterests = (user1.interests || []).filter((i: string) =>
    (user2.interests || []).includes(i)
  );
  score += commonInterests.length * 5;

  // Common academic goals
  const commonAcademicGoals = (user1.goals?.academic || []).filter((g: string) =>
    (user2.goals?.academic || []).includes(g)
  );
  score += commonAcademicGoals.length * 10;

  // Common leisure goals
  const commonLeisureGoals = (user1.goals?.leisure || []).filter((g: string) =>
    (user2.goals?.leisure || []).includes(g)
  );
  score += commonLeisureGoals.length * 10;

  // Same major (bonus)
  if (user1.major === user2.major) {
    score += 15;
  }

  // Same year (bonus)
  if (user1.year === user2.year) {
    score += 10;
  }

  return score;
}
```

### 3.3 Update InstagramGrid to Use Smart Matches

**Replace current profile fetching with smart matches endpoint**

---

## 📋 Phase 4: Class Schedule Integration (Week 4-5)

### 4.1 Class Schedule Upload Options

**Option A: Manual Entry (MVP)**
- Simple form to add classes
- Fields: Class name, code, days, time, professor, building
- Can add multiple classes
- Easy to implement

**Option B: Schedule Scraper (Advanced)**
- Connect to university portal (if API available)
- Or web scraping (complex, may violate ToS)
- Or CSV/PDF upload and parsing

**Recommendation:** Start with Option A, add Option B later

### 4.2 Class Schedule Component

**Create `src/components/ClassScheduleEditor.tsx`:**

```typescript
interface ClassScheduleEditorProps {
  schedule: ClassInfo[];
  onChange: (schedule: ClassInfo[]) => void;
}

export function ClassScheduleEditor({ schedule, onChange }: ClassScheduleEditorProps) {
  // Add/edit/remove classes
  // Show schedule in calendar view
  // Allow bulk import from text
}
```

### 4.3 Study Buddy Matching

**When user selects "Study Buddy" filter:**
1. Show input: "Search by class code (e.g., CS101)"
2. Find users with same class
3. Show match with: "You're both in CS 101!"
4. AI analysis emphasizes: "Perfect study partner - same class!"

**API endpoint: `/make-server-2516be19/discover/study-buddies`**

```typescript
app.get("/make-server-2516be19/discover/study-buddies", async (c) => {
  const classCode = c.req.query('class');
  const userId = await getUserId(c.req.header('Authorization'));
  
  // Get user's classes
  const userProfile = await kv.get(`user:${userId}`);
  const userClasses = userProfile.classSchedule?.classes || [];
  
  // Find all users with matching classes
  // Return matches sorted by number of shared classes
});
```

---

## 📋 Phase 5: Enhanced Discovery UI (Week 5-6)

### 5.1 Filter Bar Redesign

**New filter UI:**
```
[Looking For ▼] [Major ▼] [Year ▼] [More Filters ▼]

Looking For:
○ All  ● Roommate  ○ Friends  ○ Study Buddy  ○ Going Out

More Filters:
- Academic Goal: [Dropdown]
- Leisure Goal: [Dropdown]
- Class Code: [Text input] (for study buddy)
```

### 5.2 Profile Cards Enhancement

**Show on profile cards:**
- Compatibility score (if AI analysis available)
- "Looking for: Roommate, Friends" badges
- Academic/Leisure goals (if match)
- "Same class: CS 101" badge (if applicable)

### 5.3 Quick Actions

**Add quick action buttons:**
- "Find Roommate" → Filters to roommates
- "Find Study Buddy" → Shows class input
- "Find Friends" → Filters to friends
- "Going Out" → Filters to leisure matches

---

## 📋 Phase 6: AI Series/Recommendations (Week 6-7)

### 6.1 Daily Recommendations

**Create endpoint: `/make-server-2516be19/discover/daily-recommendations`**

```typescript
app.get("/make-server-2516be19/discover/daily-recommendations", async (c) => {
  // Use AI to generate 3-5 personalized recommendations
  // Based on:
  // - Goals alignment
  // - Interests overlap
  // - Looking for match
  // - Recent activity
});
```

### 6.2 "People You Should Know" Section

**Show in Discover tab:**
- "Based on your goals: [Name] - Same career path!"
- "Study Buddy Alert: [Name] - Same class!"
- "Roommate Match: [Name] - Compatible living style"

### 6.3 Smart Notifications

**Push notifications:**
- "New study buddy match in CS 101!"
- "Someone with similar goals joined"
- "Roommate compatibility match found"

---

## 📋 Implementation Priority

### 🔴 Phase 1 (Critical - Week 1-2)
1. ✅ Add future goals to onboarding
2. ✅ Update profile schema
3. ✅ Save goals to database

### 🟡 Phase 2 (High Priority - Week 2-3)
4. ✅ Enhanced AI soft intro generation
5. ✅ Update SoftIntroFlow with real AI
6. ✅ Show compatibility scores

### 🟢 Phase 3 (Medium Priority - Week 3-4)
7. ✅ Advanced filtering system
8. ✅ Smart matching algorithm
9. ✅ Update discovery UI

### 🔵 Phase 4 (Nice to Have - Week 4-5)
10. ⬜ Class schedule manual entry
11. ⬜ Study buddy matching by class
12. ⬜ Schedule display

### ⚪ Phase 5 (Future - Week 5-6)
13. ⬜ Daily AI recommendations
14. ⬜ "People You Should Know"
15. ⬜ Smart notifications

---

## 🗄️ Database Schema Updates

### Profile Structure (Updated)

```typescript
{
  id: string,
  email: string,
  name: string,
  school: string,
  major: string,
  year: string,
  bio: string,
  interests: string[],
  personality: string[],
  lookingFor: string[], // ['roommate', 'friends', 'study-buddy', 'going-out']
  
  // NEW
  goals: {
    academic: string[],    // ['maintain-gpa', 'grad-school', 'internships']
    leisure: string[],     // ['join-clubs', 'sports', 'parties']
    career: string,        // "Software Engineer at Google"
    personal: string        // "Get fit and learn Spanish"
  },
  
  classSchedule: {
    classes: [
      {
        name: "Introduction to Computer Science",
        code: "CS101",
        professor: "Dr. Smith",
        days: ["Monday", "Wednesday"],
        time: "10:00 AM - 11:30 AM",
        building: "Engineering Hall",
        semester: "Fall 2024"
      }
    ],
    lastUpdated: "2024-01-15T10:00:00Z"
  },
  
  livingHabits: { ... },
  socials: { ... },
  photos: string[],
  profilePicture: string,
  updatedAt: string
}
```

---

## 🎨 UI/UX Improvements

### Onboarding Flow
1. Make goals step optional but encouraged
2. Show examples of how goals help matching
3. Progress: "Step 9 of 9 (Optional)"

### Discovery Page
1. Prominent filter bar at top
2. Quick action buttons
3. Profile cards show match reasons
4. "Why we think you'd connect" section

### Profile Detail
1. Show goals section
2. Show class schedule (if added)
3. Show compatibility breakdown

---

## 📊 Success Metrics

**Track:**
- Profile completion rate (with goals)
- Soft intro acceptance rate
- Connection quality (do they chat?)
- Study buddy matches made
- Roommate matches made
- User retention (Day 7, Day 30)

---

## 🚀 Quick Start Checklist

### This Week:
- [ ] Add goals step to OnboardingWizard
- [ ] Update profile schema
- [ ] Test goal saving

### Next Week:
- [ ] Implement AI soft intro generation
- [ ] Update SoftIntroFlow component
- [ ] Test AI analysis quality

### Week 3:
- [ ] Build advanced filter system
- [ ] Create smart matching algorithm
- [ ] Update discovery UI

### Week 4:
- [ ] Add class schedule editor
- [ ] Implement study buddy matching
- [ ] Test end-to-end flow

---

## 💡 Future Enhancements

1. **Class Schedule Scraper** - Auto-import from university portal
2. **Group Study Matching** - Match 3-4 people for study groups
3. **Event Matching** - "Who's going to [event]?"
4. **Interest Groups** - Create/join groups by interest
5. **Roommate Compatibility Quiz** - Detailed living style matching
6. **Study Session Scheduler** - Coordinate study times
7. **Goal Tracking** - Help users achieve their goals together

---

## 🎯 Expected Outcomes

After implementation:
- **Higher quality connections** - AI matches based on goals
- **Better discovery** - Find exactly what you're looking for
- **More engagement** - Study buddies, roommates, friends all in one place
- **Real social network** - Not just dating, but comprehensive college social platform

---

This plan transforms Bonded from a simple connection app into a **real social network** that understands what college students need and helps them find it intelligently! 🚀

