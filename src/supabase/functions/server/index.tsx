import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getFirstQuestion, getNextQuestion, generateLovePrint, tryCallGemini } from "./love-print-helpers.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage bucket on startup
const bucketName = 'make-2516be19-profile-photos';
const initStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log('Created storage bucket:', bucketName);
    }
  } catch (error) {
    console.error('Storage bucket initialization error:', error);
  }
};
initStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify auth and get user ID
async function getUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

// Health check endpoint
app.get("/make-server-2516be19/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-2516be19/signup", async (c) => {
  try {
    const { email, password, name, school } = await c.req.json();

    if (!email || !password || !name || !school) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create user with Supabase Auth
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, school },
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message || String(error) }, 400);
    }

    if (!data?.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    return c.json({ success: true, userId: data.user.id });
  } catch (error: any) {
    console.error('Signup server error:', error);
    return c.json({ error: error?.message || String(error) || 'Signup failed' }, 500);
  }
});

// Get user info endpoint
app.get("/make-server-2516be19/user-info", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user info from auth
    const { data: { user }, error } = await supabase.auth.getUser(
      c.req.header('Authorization')!.split(' ')[1]
    );

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      school: user.user_metadata?.school || '',
    });
  } catch (error: any) {
    console.error('User info fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create/Update profile endpoint
app.post("/make-server-2516be19/profile", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();

    // Get user info from auth
    const { data: { user } } = await supabase.auth.getUser(
      c.req.header('Authorization')!.split(' ')[1]
    );

    // Use school from profileData if provided, otherwise from user metadata
    const school = profileData.school || user!.user_metadata.school;

    const profile = {
      id: userId,
      email: user!.email,
      name: profileData.name || user!.user_metadata.name,
      school: school,
      ...profileData,
      livingHabits: {
        sleepSchedule: profileData.sleepSchedule,
        cleanliness: profileData.cleanliness,
        guests: profileData.guests,
        noise: profileData.noise,
      },
      socials: {
        instagram: profileData.instagram,
        twitter: profileData.twitter,
        snapchat: profileData.snapchat,
      },
      goals: profileData.goals || {
        academic: [],
        leisure: [],
        career: undefined,
        personal: undefined,
      },
      additionalInfo: profileData.additionalInfo || undefined,
      // Note: classSchedule will be added in a future update for study partner matching
      updatedAt: new Date().toISOString(),
    };

    // If profile has goals or additionalInfo and Bond Print exists, regenerate it with new data
    if (profile.bondPrint && (profileData.goals || profileData.additionalInfo)) {
      try {
        // Regenerate Bond Print with updated profile data
        const updatedBondPrint = await regenerateBondPrint(profile);
        profile.bondPrint = updatedBondPrint;
      } catch (error) {
        console.error('Failed to regenerate Bond Print:', error);
        // Continue without regenerating - Bond Print will update on next quiz completion
      }
    }

    // Store profile
    await kv.set(`user:${userId}`, profile);

    // Add to school index
    const schoolKey = `school:${school}:users`;
    const schoolUsers = await kv.get(schoolKey) || [];
    if (!schoolUsers.includes(userId)) {
      schoolUsers.push(userId);
      await kv.set(schoolKey, schoolUsers);
    }

    return c.json(profile);
  } catch (error: any) {
    console.error('Profile creation error:', error);
    return c.json({ error: error.message || 'Profile creation failed' }, 500);
  }
});

// Get profile by ID
app.get("/make-server-2516be19/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const profile = await kv.get(`user:${userId}`);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Smart matches endpoint with advanced filtering
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
      .map((profile: any) => {
        const matchScore = calculateMatchScore(userProfile, profile, {
          lookingFor,
          major,
          year,
          academicGoal,
          leisureGoal,
        });
        
        // Add Bond Print compatibility score if both have completed it
        let bondPrintScore = null;
        if (userProfile.bondPrint && profile.bondPrint) {
          bondPrintScore = calculateBondPrintCompatibility(
            userProfile.bondPrint,
            profile.bondPrint
          );
        }
        
        // Combine scores (Bond Print is weighted more heavily)
        const combinedScore = bondPrintScore 
          ? (matchScore * 0.4) + (bondPrintScore * 0.6) // 60% Bond Print, 40% other factors
          : matchScore;
        
        return {
          profile,
          score: combinedScore,
          bondPrintScore,
          matchScore,
        };
      })
      .filter((m: any) => m.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map((m: any) => ({
        ...m.profile,
        bondPrintCompatibility: m.bondPrintScore,
      }));

    return c.json(matches);
  } catch (error: any) {
    console.error('Smart matches error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper function to calculate match score
function calculateMatchScore(
  user1: any,
  user2: any,
  filters: any
): number {
  let score = 0;

  // Filter by lookingFor
  if (filters.lookingFor && filters.lookingFor !== 'all' && filters.lookingFor !== 'All') {
    const filterValue = filters.lookingFor.toLowerCase().replace(/\s+/g, '-');
    if (!user2.lookingFor?.some((lf: string) => lf.toLowerCase().includes(filterValue))) {
      return 0; // No match
    }
    score += 30; // Base match
  }

  // Filter by major
  if (filters.major && filters.major !== 'all' && filters.major !== 'All') {
    if (user2.major?.toLowerCase() !== filters.major.toLowerCase()) {
      return 0;
    }
    score += 20;
  }

  // Filter by year
  if (filters.year && filters.year !== 'all' && filters.year !== 'All') {
    if (user2.year !== filters.year) {
      return 0;
    }
    score += 10;
  }

  // Filter by academic goal
  if (filters.academicGoal && filters.academicGoal !== 'all' && filters.academicGoal !== 'All') {
    const goalValue = filters.academicGoal.toLowerCase().replace(/\s+/g, '-');
    if (user2.goals?.academic?.some((g: string) => g.toLowerCase().includes(goalValue))) {
      score += 25;
    } else {
      return 0;
    }
  }

  // Filter by leisure goal
  if (filters.leisureGoal && filters.leisureGoal !== 'all' && filters.leisureGoal !== 'All') {
    const goalValue = filters.leisureGoal.toLowerCase().replace(/\s+/g, '-');
    if (user2.goals?.leisure?.some((g: string) => g.toLowerCase().includes(goalValue))) {
      score += 25;
    } else {
      return 0;
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

// Get compatibility analysis between current user and another profile
app.get("/make-server-2516be19/compatibility/:targetUserId", async (c) => {
  try {
    const currentUserId = await getUserId(c.req.header('Authorization'));
    if (!currentUserId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = c.req.param('targetUserId');
    
    // Load both profiles
    const currentProfile = await kv.get(`user:${currentUserId}`);
    const targetProfile = await kv.get(`user:${targetUserId}`);

    if (!currentProfile || !targetProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Calculate compatibility
    const commonInterests = currentProfile.interests?.filter(
      (interest: string) => targetProfile.interests?.includes(interest)
    ) || [];

    const commonLookingFor = currentProfile.lookingFor?.filter(
      (item: string) => targetProfile.lookingFor?.includes(item)
    ) || [];

    // Calculate a simple compatibility score
    let score = 50; // Base score
    score += commonInterests.length * 5; // +5 for each common interest
    score += commonLookingFor.length * 10; // +10 for each common goal
    score = Math.min(score, 95); // Cap at 95%

    // Generate analysis text
    let analysis = '';
    if (commonInterests.length > 0 && commonLookingFor.length > 0) {
      analysis = `You share ${commonInterests.length} interest${commonInterests.length > 1 ? 's' : ''} and are both looking for ${commonLookingFor.join(' and ')}.`;
    } else if (commonInterests.length > 0) {
      analysis = `You both enjoy ${commonInterests.slice(0, 3).join(', ')}${commonInterests.length > 3 ? ' and more' : ''}.`;
    } else if (commonLookingFor.length > 0) {
      analysis = `You're both looking for ${commonLookingFor.join(' and ')}.`;
    } else {
      analysis = 'You might find interesting connections through conversation!';
    }

    return c.json({
      score,
      commonInterests,
      commonLookingFor,
      analysis,
    });
  } catch (error: any) {
    console.error('Compatibility calculation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Upload profile photo
app.post("/make-server-2516be19/upload-photo", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { image, fileName } = body;

    if (!image) {
      return c.json({ error: 'No image provided' }, 400);
    }

    // Convert base64 to blob
    const base64Data = image.split(',')[1] || image;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const filePath = `${userId}/${timestamp}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, binaryData, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ error: error.message }, 500);
    }

    // Get signed URL (valid for 10 years)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000); // 10 years in seconds

    if (!signedUrlData?.signedUrl) {
      return c.json({ error: 'Failed to generate signed URL' }, 500);
    }

    return c.json({ 
      url: signedUrlData.signedUrl,
      path: filePath
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return c.json({ error: error.message || 'Upload failed' }, 500);
  }
});

// Get all profiles by school
app.get("/make-server-2516be19/profiles", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const school = c.req.query('school');
    if (!school) {
      return c.json({ error: 'School parameter required' }, 400);
    }

    const schoolKey = `school:${school}:users`;
    const userIds = await kv.get(schoolKey) || [];

    const profiles = [];
    for (const id of userIds) {
      const profile = await kv.get(`user:${id}`);
      if (profile) {
        profiles.push(profile);
      }
    }

    return c.json(profiles);
  } catch (error: any) {
    console.error('Profiles fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// AI Matching algorithm
app.get("/make-server-2516be19/matches", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get all users from the same school
    const schoolKey = `school:${userProfile.school}:users`;
    const userIds = await kv.get(schoolKey) || [];

    const matches = [];

    for (const otherId of userIds) {
      if (otherId === userId) continue;

      const otherProfile = await kv.get(`user:${otherId}`);
      if (!otherProfile) continue;

      // Calculate match score based on various factors
      let score = 0;
      let reasons = [];

      // Interests match (max 30 points)
      const commonInterests = (userProfile.interests || []).filter((i: string) =>
        (otherProfile.interests || []).includes(i)
      );
      if (commonInterests.length > 0) {
        score += Math.min(30, commonInterests.length * 6);
        reasons.push(`${commonInterests.length} shared interests`);
      }

      // Personality match (max 25 points)
      const commonPersonality = (userProfile.personality || []).filter((p: string) =>
        (otherProfile.personality || []).includes(p)
      );
      if (commonPersonality.length > 0) {
        score += Math.min(25, commonPersonality.length * 8);
        reasons.push(`similar personality traits`);
      }

      // Living habits compatibility (max 25 points)
      if (userProfile.livingHabits && otherProfile.livingHabits) {
        if (userProfile.livingHabits.sleepSchedule === otherProfile.livingHabits.sleepSchedule) {
          score += 8;
          reasons.push('compatible sleep schedule');
        }
        if (userProfile.livingHabits.cleanliness === otherProfile.livingHabits.cleanliness) {
          score += 8;
          reasons.push('similar cleanliness standards');
        }
        if (userProfile.livingHabits.noise === otherProfile.livingHabits.noise) {
          score += 9;
        }
      }

      // Looking for same things (max 20 points)
      const commonGoals = (userProfile.lookingFor || []).filter((g: string) =>
        (otherProfile.lookingFor || []).includes(g)
      );
      if (commonGoals.length > 0) {
        score += Math.min(20, commonGoals.length * 10);
        reasons.push(`both looking for ${commonGoals.join(', ').toLowerCase()}`);
      }

      // Only include matches above 40%
      if (score >= 40) {
        matches.push({
          profile: otherProfile,
          matchScore: Math.min(100, score),
          reason: `Great match! You both have ${reasons.slice(0, 2).join(' and ')}.`,
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return c.json({ matches: matches.slice(0, 10) }); // Return top 10 matches
  } catch (error: any) {
    console.error('Matching error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate AI analysis for soft intro
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

    // Calculate Bond Print compatibility if both have completed it
    let bondPrintScore = null;
    if (currentProfile.bondPrint && targetProfile.bondPrint) {
      bondPrintScore = calculateBondPrintCompatibility(
        currentProfile.bondPrint,
        targetProfile.bondPrint
      );
    }

    // Generate AI analysis (includes Bond Print compatibility)
    const analysis = await generateAISoftIntro(
      currentProfile,
      targetProfile,
      reason,
      bondPrintScore
    );

    return c.json(analysis);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper function to generate AI soft intro
async function generateAISoftIntro(
  user1: any,
  user2: any,
  reason: string,
  bondPrintScore: number | null = null
): Promise<{ analysis: string; score: number; highlights: string[] }> {
  
  // Build profile summaries
  const user1Summary = `
Name: ${user1.name}
Major: ${user1.major || 'Not specified'}
Year: ${user1.year || 'Not specified'}
Interests: ${user1.interests?.join(', ') || 'None specified'}
Looking for: ${user1.lookingFor?.join(', ') || 'Not specified'}
Academic goals: ${user1.goals?.academic?.join(', ') || 'Not specified'}
Leisure goals: ${user1.goals?.leisure?.join(', ') || 'Not specified'}
Career goal: ${user1.goals?.career || 'Not specified'}
Personal goal: ${user1.goals?.personal || 'Not specified'}
Personality: ${user1.personality?.join(', ') || 'Not specified'}
Additional info: ${user1.additionalInfo || 'None provided'}
`.trim();

  const user2Summary = `
Name: ${user2.name}
Major: ${user2.major || 'Not specified'}
Year: ${user2.year || 'Not specified'}
Interests: ${user2.interests?.join(', ') || 'None specified'}
Looking for: ${user2.lookingFor?.join(', ') || 'Not specified'}
Academic goals: ${user2.goals?.academic?.join(', ') || 'Not specified'}
Leisure goals: ${user2.goals?.leisure?.join(', ') || 'Not specified'}
Career goal: ${user2.goals?.career || 'Not specified'}
Personal goal: ${user2.goals?.personal || 'Not specified'}
Personality: ${user2.personality?.join(', ') || 'Not specified'}
Additional info: ${user2.additionalInfo || 'None provided'}
`.trim();

  const prompt = `You are an AI assistant helping college students make meaningful connections on campus.

Generate a personalized soft intro analysis explaining why ${user1.name} should connect with ${user2.name}.

User 1 (${user1.name}):
${user1Summary}

User 2 (${user2.name}):
${user2Summary}

Connection reason: ${reason} (roommate/friends/study-partner/going-out/collaborate/network/event-buddy/workout-partner/dining-companion)
${bondPrintScore !== null ? `\nBond Print Compatibility Score: ${bondPrintScore}/100 (based on personality profile analysis)` : '\nNote: One or both users have not completed Bond Print quiz'}

Generate:
1. A warm, personalized analysis (2-3 sentences) explaining why they'd be a great match
2. A compatibility score (0-100) based on shared goals, interests, and compatibility
3. 2-3 key highlights of what they have in common

Focus on:
- Shared academic/leisure goals
- Common interests
- Complementary personalities
- Why this connection makes sense for the reason given
- How they can help each other achieve their goals
- Any additional information provided that indicates compatibility

Return ONLY valid JSON in this exact format:
{
  "analysis": "Your warm, personalized analysis here...",
  "score": 85,
  "highlights": ["Both interested in tech", "Similar study habits", "Want to explore the city"]
}`;

  try {
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: parsed.analysis || "You seem like a great match!",
        score: parsed.score || 75,
        highlights: parsed.highlights || ["Shared interests", "Similar goals"]
      };
    }
    
    // Fallback if parsing fails
    return {
      analysis: "You seem like a great match based on your shared interests and goals!",
      score: 75,
      highlights: ["Shared interests", "Similar goals"]
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    // Fallback analysis
    const commonInterests = (user1.interests || []).filter((i: string) =>
      (user2.interests || []).includes(i)
    );
    const commonAcademicGoals = (user1.goals?.academic || []).filter((g: string) =>
      (user2.goals?.academic || []).includes(g)
    );
    const commonLeisureGoals = (user1.goals?.leisure || []).filter((g: string) =>
      (user2.goals?.leisure || []).includes(g)
    );

    let analysis = `You and ${user2.name} seem like a great match!`;
    if (commonInterests.length > 0) {
      analysis += ` You both enjoy ${commonInterests.slice(0, 2).join(' and ')}.`;
    }
    if (commonAcademicGoals.length > 0) {
      analysis += ` You share the academic goal of ${commonAcademicGoals[0]}.`;
    }
    if (commonLeisureGoals.length > 0) {
      analysis += ` You both want to ${commonLeisureGoals[0]}.`;
    }

    const highlights: string[] = [];
    if (commonInterests.length > 0) highlights.push(`Both interested in ${commonInterests[0]}`);
    if (commonAcademicGoals.length > 0) highlights.push(`Shared academic goal: ${commonAcademicGoals[0]}`);
    if (commonLeisureGoals.length > 0) highlights.push(`Shared leisure goal: ${commonLeisureGoals[0]}`);
    if (user1.major === user2.major) highlights.push(`Same major: ${user1.major}`);

    return {
      analysis,
      score: Math.min(90, 60 + (commonInterests.length * 5) + (commonAcademicGoals.length * 10) + (commonLeisureGoals.length * 10)),
      highlights: highlights.length > 0 ? highlights : ["Potential great connection"]
    };
  }
}

// Send soft intro
app.post("/make-server-2516be19/soft-intro", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { toUserId, reason, analysis } = await c.req.json();

    // Create soft intro ID
    const introId = `intro:${userId}:${toUserId}:${Date.now()}`;

    const softIntro = {
      id: introId,
      fromUserId: userId,
      toUserId,
      reason,
      analysis,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store the intro
    await kv.set(introId, softIntro);

    // Add to sender's outgoing list
    const outgoing = await kv.get(`user:${userId}:soft-intros:outgoing`) || [];
    if (!Array.isArray(outgoing)) {
      console.warn('outgoing is not an array, resetting:', outgoing);
      await kv.set(`user:${userId}:soft-intros:outgoing`, [introId]);
    } else {
      outgoing.push(introId);
      await kv.set(`user:${userId}:soft-intros:outgoing`, outgoing);
    }

    // Add to receiver's incoming list
    const incoming = await kv.get(`user:${toUserId}:soft-intros:incoming`) || [];
    if (!Array.isArray(incoming)) {
      console.warn('incoming is not an array, resetting:', incoming);
      await kv.set(`user:${toUserId}:soft-intros:incoming`, [introId]);
    } else {
      incoming.push(introId);
      await kv.set(`user:${toUserId}:soft-intros:incoming`, incoming);
    }

    return c.json(softIntro);
  } catch (error: any) {
    console.error('Soft intro send error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get incoming soft intros
app.get("/make-server-2516be19/soft-intros/incoming", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const introIds = await kv.get(`user:${userId}:soft-intros:incoming`) || [];
    
    // Ensure introIds is an array
    if (!Array.isArray(introIds)) {
      console.error('introIds is not an array:', introIds);
      return c.json([]);
    }

    const intros = [];

    for (const introId of introIds) {
      try {
        const intro = await kv.get(introId);
        if (intro && intro.status === 'pending') {
          // Get sender's profile
          const senderProfile = await kv.get(`user:${intro.fromUserId}`);
          if (senderProfile) {
            intros.push({
              ...intro,
              senderProfile,
            });
          }
        }
      } catch (err) {
        console.error(`Error loading intro ${introId}:`, err);
        // Continue with other intros
      }
    }

    // Sort by date (newest first)
    intros.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return c.json(intros);
  } catch (error: any) {
    console.error('Incoming intros fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get outgoing soft intros
app.get("/make-server-2516be19/soft-intros/outgoing", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const introIds = await kv.get(`user:${userId}:soft-intros:outgoing`) || [];
    
    // Ensure introIds is an array
    if (!Array.isArray(introIds)) {
      console.error('introIds is not an array:', introIds);
      return c.json([]);
    }

    const intros = [];

    for (const introId of introIds) {
      try {
        const intro = await kv.get(introId);
        if (intro) {
          // Get receiver's profile
          const receiverProfile = await kv.get(`user:${intro.toUserId}`);
          if (receiverProfile) {
            intros.push({
              ...intro,
              receiverProfile,
            });
          }
        }
      } catch (err) {
        console.error(`Error loading intro ${introId}:`, err);
        // Continue with other intros
      }
    }

    // Sort by date (newest first)
    intros.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return c.json(intros);
  } catch (error: any) {
    console.error('Outgoing intros fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Accept soft intro
app.post("/make-server-2516be19/soft-intro/:introId/accept", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const introId = c.req.param('introId');
    const intro = await kv.get(introId);

    if (!intro) {
      return c.json({ error: 'Intro not found' }, 404);
    }

    if (intro.toUserId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update intro status
    intro.status = 'accepted';
    intro.acceptedAt = new Date().toISOString();
    await kv.set(introId, intro);

    // Create connection for both users
    // Ensure we have valid arrays (handle edge cases where data might be corrupted)
    let userConnections = await kv.get(`user:${userId}:connections`);
    if (!Array.isArray(userConnections)) {
      userConnections = [];
    }
    if (!userConnections.includes(intro.fromUserId)) {
      userConnections.push(intro.fromUserId);
      await kv.set(`user:${userId}:connections`, userConnections);
    }

    let otherConnections = await kv.get(`user:${intro.fromUserId}:connections`);
    if (!Array.isArray(otherConnections)) {
      otherConnections = [];
    }
    if (!otherConnections.includes(userId)) {
      otherConnections.push(userId);
      await kv.set(`user:${intro.fromUserId}:connections`, otherConnections);
    }

    // Create chat automatically
    const chatId = [userId, intro.fromUserId].sort().join(':');
    const existingChat = await kv.get(`chat:${chatId}`);
    
    if (!existingChat) {
      const chat = {
        chatId,
        participants: [userId, intro.fromUserId],
        createdAt: new Date().toISOString(),
      };
      await kv.set(`chat:${chatId}`, chat);

      // Add to both users' chat lists
      const userChats = await kv.get(`user:${userId}:chats`) || [];
      if (!userChats.includes(chatId)) {
        userChats.push(chatId);
        await kv.set(`user:${userId}:chats`, userChats);
      }

      const otherChats = await kv.get(`user:${intro.fromUserId}:chats`) || [];
      if (!otherChats.includes(chatId)) {
        otherChats.push(chatId);
        await kv.set(`user:${intro.fromUserId}:chats`, otherChats);
      }
    }

    return c.json({ success: true, intro });
  } catch (error: any) {
    console.error('Accept intro error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Deny soft intro
app.post("/make-server-2516be19/soft-intro/:introId/deny", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const introId = c.req.param('introId');
    const intro = await kv.get(introId);

    if (!intro) {
      return c.json({ error: 'Intro not found' }, 404);
    }

    if (intro.toUserId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update intro status
    intro.status = 'denied';
    intro.deniedAt = new Date().toISOString();
    await kv.set(introId, intro);

    return c.json({ success: true, intro });
  } catch (error: any) {
    console.error('Deny intro error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get connections
app.get("/make-server-2516be19/connections", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const connectionIds = await kv.get(`user:${userId}:connections`);
    
    // Ensure connectionIds is an array
    if (!Array.isArray(connectionIds)) {
      console.warn(`Invalid connections data for user ${userId}, expected array but got:`, typeof connectionIds);
      return c.json([]);
    }

    // If no connections, return empty array
    if (connectionIds.length === 0) {
      return c.json([]);
    }

    // Batch fetch all profiles at once using mget (more efficient than N+1 queries)
    const profileKeys = connectionIds.map(id => `user:${id}`);
    const profiles = await kv.mget(profileKeys);

    // Filter out null/undefined profiles and ensure they have required fields
    const validConnections = profiles.filter((profile: any) => {
      return profile && profile.id && profile.name;
    });

    return c.json(validConnections);
  } catch (error: any) {
    console.error('Connections fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Start a chat
app.post("/make-server-2516be19/chat/start", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { otherUserId } = await c.req.json();

    // Create chat ID (sorted to ensure consistency)
    const chatId = [userId, otherUserId].sort().join(':');

    // Check if chat already exists
    const existingChat = await kv.get(`chat:${chatId}`);
    if (existingChat) {
      return c.json(existingChat);
    }

    // Create new chat
    const chat = {
      chatId,
      participants: [userId, otherUserId],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`chat:${chatId}`, chat);

    // Add to user's chat list
    const userChats = await kv.get(`user:${userId}:chats`) || [];
    if (!userChats.includes(chatId)) {
      userChats.push(chatId);
      await kv.set(`user:${userId}:chats`, userChats);
    }

    const otherUserChats = await kv.get(`user:${otherUserId}:chats`) || [];
    if (!otherUserChats.includes(chatId)) {
      otherUserChats.push(chatId);
      await kv.set(`user:${otherUserId}:chats`, otherUserChats);
    }

    return c.json(chat);
  } catch (error: any) {
    console.error('Chat start error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user's chats
app.get("/make-server-2516be19/chats", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatIds = await kv.get(`user:${userId}:chats`) || [];
    const chats = [];

    for (const chatId of chatIds) {
      const chat = await kv.get(`chat:${chatId}`);
      if (!chat) continue;

      // Get other user's profile
      const otherUserId = chat.participants.find((id: string) => id !== userId);
      const otherUser = await kv.get(`user:${otherUserId}`);

      // Get last message
      const messages = await kv.get(`chat:${chatId}:messages`) || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : null;

      chats.push({
        chatId,
        otherUser,
        lastMessage,
      });
    }

    return c.json(chats);
  } catch (error: any) {
    console.error('Chats fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get messages for a chat
app.get("/make-server-2516be19/chat/:chatId/messages", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatId = c.req.param('chatId');
    const chat = await kv.get(`chat:${chatId}`);

    if (!chat || !chat.participants.includes(userId)) {
      return c.json({ error: 'Unauthorized access to chat' }, 403);
    }

    const messages = await kv.get(`chat:${chatId}:messages`) || [];
    return c.json(messages);
  } catch (error: any) {
    console.error('Messages fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send a message
app.post("/make-server-2516be19/chat/:chatId/message", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatId = c.req.param('chatId');
    const { content } = await c.req.json();

    const chat = await kv.get(`chat:${chatId}`);
    if (!chat || !chat.participants.includes(userId)) {
      return c.json({ error: 'Unauthorized access to chat' }, 403);
    }

    const messages = await kv.get(`chat:${chatId}:messages`) || [];
    const newMessage = {
      id: `${chatId}:${Date.now()}`,
      senderId: userId,
      content,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    await kv.set(`chat:${chatId}:messages`, messages);

    return c.json(newMessage);
  } catch (error: any) {
    console.error('Message send error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// LOVE PRINT QUIZ SYSTEM WITH ADAPTIVE AI
// ============================================

// Start Bond Print Quiz
app.post("/make-server-2516be19/bond-print/start", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { userProfile } = await c.req.json();

    // Get first question (tries Gemini, falls back to preset)
    const result = await getFirstQuestion(userProfile);

    // Initialize quiz session
    const quizSession = {
      userId,
      startedAt: new Date().toISOString(),
      currentQuestion: 1,
      answers: [],
      userProfile,
      usedGemini: result.usedGemini,
    };

    await kv.set(`quiz:${userId}`, quizSession);

    return c.json({
      questionNumber: 1,
      totalQuestions: 8,
      question: result.question.question,
      options: result.question.options,
    });
  } catch (error: any) {
    console.error('Bond Print quiz start error:', error);
    return c.json({ error: error.message || 'Failed to start quiz' }, 500);
  }
});

// Submit answer and get next question
app.post("/make-server-2516be19/bond-print/answer", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { answer, questionText } = await c.req.json();

    // Get quiz session
    const quizSession = await kv.get(`quiz:${userId}`);
    if (!quizSession) {
      return c.json({ error: 'Quiz session not found' }, 404);
    }

    // Store answer
    quizSession.answers.push({
      question: questionText,
      answer,
      timestamp: new Date().toISOString(),
    });
    quizSession.currentQuestion += 1;

    await kv.set(`quiz:${userId}`, quizSession);

    // If we have enough answers (8+), generate Love Print
    if (quizSession.answers.length >= 8) {
      return c.json({ completed: true });
    }


    


    // Get next question (tries Gemini, falls back to preset)
    const questionData = await getNextQuestion(quizSession);

    return c.json({
      questionNumber: quizSession.currentQuestion,
      totalQuestions: 8,
      question: questionData.question,
      options: questionData.options,
    });
  } catch (error: any) {
    console.error('Bond Print answer error:', error);
    return c.json({ error: error.message || 'Failed to process answer' }, 500);
  }
});

// Regenerate Bond Print with updated profile data (goals, additionalInfo)
async function regenerateBondPrint(profile: any): Promise<any> {
  if (!profile.bondPrint) {
    return null;
  }

  const goalsText = profile.goals ? `
Academic Goals: ${profile.goals.academic?.join(', ') || 'None'}
Leisure Goals: ${profile.goals.leisure?.join(', ') || 'None'}
Career Goal: ${profile.goals.career || 'None'}
Personal Goal: ${profile.goals.personal || 'None'}
` : '';
  
  const additionalInfoText = profile.additionalInfo ? `\nAdditional Context: ${profile.additionalInfo}` : '';

  const prompt = `You are updating a Bond Print (personality profile) with new information about a college student.

Current Bond Print:
${JSON.stringify(profile.bondPrint, null, 2)}

New Profile Information:
Interests: ${profile.interests?.join(', ') || 'None'}
Looking For: ${profile.lookingFor?.join(', ') || 'None'}
${goalsText}${additionalInfoText}

Update the Bond Print to incorporate this new information while maintaining consistency. Adjust traits, values, and summary to reflect their goals and additional context.

Return ONLY a JSON object (no markdown) with the same structure as the current Bond Print:
{
  "traits": { ... },
  "personality": { ... },
  "communication": { ... },
  "social": { ... },
  "values": [ ... ],
  "livingPreferences": { ... },
  "summary": "..."
}`;

  const geminiResponse = await tryCallGemini(prompt);
  
  if (geminiResponse) {
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const updatedBondPrint = JSON.parse(jsonMatch[0]);
        updatedBondPrint.createdAt = profile.bondPrint.createdAt;
        updatedBondPrint.updatedAt = new Date().toISOString();
        updatedBondPrint.quizVersion = profile.bondPrint.quizVersion || '1.0';
        updatedBondPrint.regenerated = true;
        return updatedBondPrint;
      }
    } catch (e) {
      console.log('Failed to parse regenerated Bond Print');
    }
  }
  
  // If regeneration fails, return original
  return profile.bondPrint;
}

// Get Bond Print compatibility score between two users
function calculateBondPrintCompatibility(bondPrint1: any, bondPrint2: any): number {
  if (!bondPrint1 || !bondPrint2) {
    return 0;
  }

  let score = 0;
  let factors = 0;

  // Compare traits (0-1 scale)
  if (bondPrint1.traits && bondPrint2.traits) {
    const traitKeys = Object.keys(bondPrint1.traits);
    traitKeys.forEach(key => {
      if (bondPrint2.traits[key] !== undefined) {
        const diff = Math.abs(bondPrint1.traits[key] - bondPrint2.traits[key]);
        score += (1 - diff) * 10; // Closer = higher score
        factors++;
      }
    });
  }

  // Compare personality types
  if (bondPrint1.personality?.primaryType === bondPrint2.personality?.primaryType) {
    score += 20;
  } else if (bondPrint1.personality?.secondaryTraits && bondPrint2.personality?.secondaryTraits) {
    const commonTraits = bondPrint1.personality.secondaryTraits.filter((t: string) =>
      bondPrint2.personality.secondaryTraits.includes(t)
    );
    score += commonTraits.length * 5;
  }

  // Compare communication styles
  if (bondPrint1.communication?.style === bondPrint2.communication?.style) {
    score += 15;
  }

  // Compare social preferences
  if (bondPrint1.social?.idealSetting === bondPrint2.social?.idealSetting) {
    score += 10;
  }

  // Compare values
  if (bondPrint1.values && bondPrint2.values) {
    const commonValues = bondPrint1.values.filter((v: string) =>
      bondPrint2.values.includes(v)
    );
    score += commonValues.length * 8;
  }

  // Compare living preferences
  if (bondPrint1.livingPreferences && bondPrint2.livingPreferences) {
    const livingKeys = ['cleanliness', 'noiseLevel', 'socialSpace'];
    livingKeys.forEach(key => {
      if (bondPrint1.livingPreferences[key] !== undefined && bondPrint2.livingPreferences[key] !== undefined) {
        const diff = Math.abs(bondPrint1.livingPreferences[key] - bondPrint2.livingPreferences[key]);
        score += (1 - diff) * 5;
      }
    });
    if (bondPrint1.livingPreferences.schedule === bondPrint2.livingPreferences.schedule) {
      score += 10;
    }
  }

  // Normalize to 0-100
  const normalizedScore = Math.min(100, Math.round(score));
  return normalizedScore;
}

// Get Bond Print compatibility score
app.get("/make-server-2516be19/bond-print/compatibility/:targetUserId", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = c.req.param('targetUserId');
    
    const userProfile = await kv.get(`user:${userId}`);
    const targetProfile = await kv.get(`user:${targetUserId}`);
    
    if (!userProfile || !targetProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    if (!userProfile.bondPrint || !targetProfile.bondPrint) {
      return c.json({ 
        score: 0, 
        message: 'One or both users have not completed Bond Print' 
      });
    }

    const score = calculateBondPrintCompatibility(userProfile.bondPrint, targetProfile.bondPrint);
    
    return c.json({ 
      score,
      userBondPrint: userProfile.bondPrint,
      targetBondPrint: targetProfile.bondPrint
    });
  } catch (error: any) {
    console.error('Bond Print compatibility error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate final Bond Print from quiz answers
app.post("/make-server-2516be19/bond-print/generate", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get quiz session
    const quizSession = await kv.get(`quiz:${userId}`);
    if (!quizSession || quizSession.answers.length < 6) {
      return c.json({ error: 'Not enough quiz answers' }, 400);
    }

    // Get full profile to include goals and additionalInfo
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      // Merge profile data into quiz session for Bond Print generation
      quizSession.userProfile = {
        ...quizSession.userProfile,
        goals: userProfile.goals,
        additionalInfo: userProfile.additionalInfo,
        interests: userProfile.interests,
        lookingFor: userProfile.lookingFor,
      };
    }

    // Generate Bond Print (tries Gemini, falls back to algorithm)
    const bondPrint = await generateLovePrint(quizSession);

    // Store in user profile
    if (userProfile) {
      userProfile.bondPrint = bondPrint;
      userProfile.hasCompletedBondPrint = true;
      await kv.set(`user:${userId}`, userProfile);
    }

    // Clean up quiz session
    await kv.del(`quiz:${userId}`);

    return c.json({ bondPrint });
  } catch (error: any) {
    console.error('Bond Print generation error:', error);
    return c.json({ error: error.message || 'Failed to generate Bond Print' }, 500);
  }
});

// Calculate AI-powered compatibility between two users
app.post("/make-server-2516be19/bond-print/compatibility", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { otherUserId, reason } = await c.req.json();

    // Get both bond prints
    const userProfile = await kv.get(`user:${userId}`);
    const otherProfile = await kv.get(`user:${otherUserId}`);

    // Check for bondPrint first, fall back to lovePrint for backwards compatibility
    const userBondPrint = userProfile?.bondPrint || userProfile?.lovePrint;
    const otherBondPrint = otherProfile?.bondPrint || otherProfile?.lovePrint;

    if (!userBondPrint || !otherBondPrint) {
      return c.json({ error: 'Bond Print not found for one or both users' }, 404);
    }

    const prompt = `You are a relationship compatibility expert analyzing two college students' personality profiles.

Person 1 (${userProfile.name}):
${JSON.stringify(userBondPrint, null, 2)}

Person 2 (${otherProfile.name}):
${JSON.stringify(otherBondPrint, null, 2)}

Connection Reason: ${reason} (friends, roommate, study partner, etc.)

Analyze their compatibility for this specific type of relationship. Return ONLY a JSON object (no markdown):

{
  "score": 0-100 (integer compatibility score),
  "compatibility": "Excellent/Great/Good/Fair",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "similarities": ["what they have in common - be specific"],
  "complementaryTraits": ["how they balance each other"],
  "potentialChallenges": ["potential area of friction"],
  "recommendation": "2-3 sentence personalized recommendation explaining why they'd be good ${reason}s",
  "icebreaker": "A specific conversation starter they could use based on shared interests"
}`;

    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    const compatibility = JSON.parse(jsonMatch[0]);

    return c.json(compatibility);
  } catch (error: any) {
    console.error('Compatibility calculation error:', error);
    return c.json({ error: error.message || 'Failed to calculate compatibility' }, 500);
  }
});

// Get user's Bond Print (backwards compatible with lovePrint)
app.get("/make-server-2516be19/love-print/:userId", async (c) => {
  try {
    const requesterId = await getUserId(c.req.header('Authorization'));
    if (!requesterId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    const userProfile = await kv.get(`user:${userId}`);

    const bondPrint = userProfile?.bondPrint || userProfile?.lovePrint;
    if (!bondPrint) {
      return c.json({ error: 'Bond Print not found' }, 404);
    }

    return c.json({ lovePrint: bondPrint, bondPrint });
  } catch (error: any) {
    console.error('Bond Print fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Also add a dedicated bond-print endpoint
app.get("/make-server-2516be19/bond-print/:userId", async (c) => {
  try {
    const requesterId = await getUserId(c.req.header('Authorization'));
    if (!requesterId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    const userProfile = await kv.get(`user:${userId}`);

    const bondPrint = userProfile?.bondPrint || userProfile?.lovePrint;
    if (!bondPrint) {
      return c.json({ error: 'Bond Print not found' }, 404);
    }

    return c.json({ bondPrint });
  } catch (error: any) {
    console.error('Bond Print fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// LOVE MODE - ANONYMOUS DATING SYSTEM
// ============================================

// Check if user has activated Love Mode
app.get("/make-server-2516be19/love-mode/activation-status", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    const isActivated = userProfile?.loveModeActivated || false;

    return c.json({ isActivated });
  } catch (error: any) {
    console.error('Check activation status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Activate Love Mode for user
app.post("/make-server-2516be19/love-mode/activate", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    userProfile.loveModeActivated = true;
    userProfile.loveModeActivatedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, message: 'Love Mode activated!' });
  } catch (error: any) {
    console.error('Activate Love Mode error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Deactivate Love Mode
app.post("/make-server-2516be19/love-mode/deactivate", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    userProfile.loveModeActivated = false;
    userProfile.loveModeDeactivatedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, message: 'Love Mode deactivated' });
  } catch (error: any) {
    console.error('Deactivate Love Mode error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save Love Print quiz results
app.post("/make-server-2516be19/love-mode/love-print", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { lovePrint } = await c.req.json();

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    userProfile.lovePrint = lovePrint;
    userProfile.lovePrint.completedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, message: 'Love Print saved!' });
  } catch (error: any) {
    console.error('Save Love Print error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get daily love question
app.get("/make-server-2516be19/love-mode/daily-question", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user already answered today
    const today = new Date().toISOString().split('T')[0];
    const answeredKey = `user:${userId}:daily-question:${today}`;
    const alreadyAnswered = await kv.get(answeredKey);

    if (alreadyAnswered) {
      return c.json({ question: null, message: 'Already answered today' });
    }

    // Get today's question (rotate through question bank)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const questionBank = getDailyQuestionBank();
    const question = questionBank[dayOfYear % questionBank.length];

    return c.json({ question: { ...question, id: today } });
  } catch (error: any) {
    console.error('Get daily question error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Submit daily question answer
app.post("/make-server-2516be19/love-mode/daily-question/answer", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { questionId, answer } = await c.req.json();

    // Store answer
    const answeredKey = `user:${userId}:daily-question:${questionId}`;
    await kv.set(answeredKey, { answer, timestamp: new Date().toISOString() });

    // Update Love Print with daily answer
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      if (!userProfile.lovePrint) {
        userProfile.lovePrint = { answers: {}, dailyAnswers: [] };
      }
      if (!userProfile.lovePrint.dailyAnswers) {
        userProfile.lovePrint.dailyAnswers = [];
      }
      
      userProfile.lovePrint.dailyAnswers.push({
        date: questionId,
        answer,
        timestamp: new Date().toISOString(),
      });

      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'Answer recorded!' });
  } catch (error: any) {
    console.error('Submit daily answer error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Daily question bank
function getDailyQuestionBank() {
  return [
    {
      question: "Today, how do you feel about physical affection in relationships?",
      type: "scale",
      scaleLabels: ["Not important", "Very important"]
    },
    {
      question: "What matters most to you in a partner right now?",
      type: "single",
      options: ["Emotional support", "Shared fun/adventure", "Intellectual stimulation", "Physical chemistry"]
    },
    {
      question: "How do you prefer to resolve conflicts?",
      type: "single",
      options: ["Talk it out immediately", "Take space first", "Compromise quickly", "Avoid if possible"]
    },
    {
      question: "What kind of date sounds best to you today?",
      type: "single",
      options: ["Coffee & deep conversation", "Outdoor activity", "Dinner & movie", "Something creative"]
    },
    {
      question: "How much alone time do you need in a relationship?",
      type: "scale",
      scaleLabels: ["Together often", "Lots of independence"]
    },
    {
      question: "What are you looking for right now?",
      type: "single",
      options: ["Casual dating", "Serious relationship", "Not sure, seeing what happens", "New friends first"]
    },
    {
      question: "How important is shared humor style?",
      type: "scale",
      scaleLabels: ["Not very", "Extremely important"]
    },
    {
      question: "What's your love language today?",
      type: "single",
      options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service", "Gifts"]
    },
  ];
}

// Get Love Mode stats
app.get("/make-server-2516be19/love-mode/stats", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get ratings given
    const ratings = await kv.get(`user:${userId}:love-ratings`) || {};
    const totalRatings = Object.keys(ratings).length;

    // Calculate average rating given
    const ratingValues = Object.values(ratings).map((r: any) => r.rating);
    const averageRating = ratingValues.length > 0
      ? ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length
      : 0;

    // Get relationships
    const relationshipIds = await kv.get(`user:${userId}:love-relationships`) || [];
    const totalMatches = relationshipIds.length;

    // Count active conversations (with recent messages)
    let activeConversations = 0;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    for (const relId of relationshipIds) {
      const messages = await kv.get(`${relId}:messages`) || [];
      const hasRecentMessages = messages.some((msg: any) => msg.timestamp > oneDayAgo);
      if (hasRecentMessages) {
        activeConversations++;
      }
    }

    const stats = {
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalMatches,
      activeConversations,
      profileViews: 0, // Can implement view tracking later
    };

    return c.json({ stats });
  } catch (error: any) {
    console.error('Get Love Mode stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});


// Helper function to generate anonymous aliases
function generateAlias(): string {
  const adjectives = [
    'Calm', 'Bright', 'Golden', 'Silver', 'Gentle', 'Quiet', 'Warm', 'Cool',
    'Swift', 'Peaceful', 'Mystic', 'Cosmic', 'Azure', 'Crimson', 'Emerald',
    'Velvet', 'Crystal', 'Luna', 'Solar', 'Stellar', 'Noble', 'Radiant'
  ];
  const nouns = [
    'Fox', 'Wolf', 'Bear', 'Owl', 'Eagle', 'Dove', 'Swan', 'Raven',
    'Phoenix', 'Dragon', 'Tiger', 'Lynx', 'Falcon', 'Hawk', 'Sparrow',
    'Echo', 'River', 'Ocean', 'Mountain', 'Forest', 'Sky', 'Star'
  ];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

// Get profiles to rate (distance-based, not school-locked)
app.get("/make-server-2516be19/love-mode/discover", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get already rated users
    const ratedUsers = await kv.get(`user:${userId}:love-ratings`) || {};

    // Get all users (distance-based, not school-limited)
    const allUsers = await kv.getByPrefix('user:') || [];
    
    const profiles = [];
    for (const userData of allUsers) {
      if (!userData || !userData.id) continue;
      if (userData.id === userId) continue;
      if (ratedUsers[userData.id]) continue; // Already rated

      // Simple distance simulation (can be replaced with real geolocation)
      const distance = Math.floor(Math.random() * 20) + 1;

      profiles.push({
        ...userData,
        distance,
      });
    }

    // Sort by distance (closest first)
    profiles.sort((a, b) => (a.distance || 99) - (b.distance || 99));

    return c.json({ profiles: profiles.slice(0, 50) });
  } catch (error: any) {
    console.error('Love Mode discover error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Rate a user (1-10) - No longer shows immediate matches
app.post("/make-server-2516be19/love-mode/rate", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { ratedUserId, rating } = await c.req.json();

    if (!ratedUserId || rating < 1 || rating > 10) {
      return c.json({ error: 'Invalid rating' }, 400);
    }

    // Store the rating
    const userRatings = await kv.get(`user:${userId}:love-ratings`) || {};
    userRatings[ratedUserId] = {
      rating,
      timestamp: new Date().toISOString(),
    };
    await kv.set(`user:${userId}:love-ratings`, userRatings);

    // Don't tell user about matches immediately - AI will process in background
    // This prevents gaming the system and maintains mystery
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Love Mode rate error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// AI-powered matching algorithm (runs periodically in background)
app.post("/make-server-2516be19/love-mode/run-matching-algorithm", async (c) => {
  try {
    // This endpoint should be called periodically (e.g., every hour)
    // Or triggered after significant rating activity
    
    const allUsers = await kv.getByPrefix('user:') || [];
    const matches = [];

    for (const user of allUsers) {
      if (!user || !user.id || !user.loveModeActivated) continue;

      const userRatings = await kv.get(`user:${user.id}:love-ratings`) || {};
      const userLovePrint = user.lovePrint;
      
      // Find potential matches (people this user rated 5+)
      for (const [targetId, ratingData] of Object.entries(userRatings)) {
        const rating = (ratingData as any).rating;
        if (rating < 5) continue; // Only consider 5+ ratings

        // Get target user's rating of this user
        const targetRatings = await kv.get(`user:${targetId}:love-ratings`) || {};
        const targetRating = targetRatings[user.id];
        
        if (!targetRating || targetRating.rating < 5) continue; // Need mutual 5+

        // Check if already matched
        const existingRels = await kv.get(`user:${user.id}:love-relationships`) || [];
        const alreadyMatched = existingRels.some((relId: string) => relId.includes(targetId));
        if (alreadyMatched) continue;

        // Get target profile
        const targetUser = await kv.get(`user:${targetId}`);
        if (!targetUser) continue;

        // Calculate AI compatibility using Gemini
        const compatibility = await calculateAICompatibility(
          user,
          targetUser,
          rating,
          targetRating.rating
        );

        if (compatibility.shouldMatch) {
          matches.push({
            userId1: user.id,
            userId2: targetId,
            compatibilityScore: compatibility.score,
            reasoning: compatibility.reasoning,
          });
        }
      }
    }

    // Create matches
    for (const match of matches) {
      await createBlindMatchWithAI(
        match.userId1,
        match.userId2,
        match.compatibilityScore,
        match.reasoning
      );
    }

    return c.json({ 
      success: true, 
      matchesCreated: matches.length,
      message: 'Matching algorithm completed'
    });
  } catch (error: any) {
    console.error('Run matching algorithm error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Calculate AI compatibility using Gemini
async function calculateAICompatibility(
  user1: any,
  user2: any,
  rating1: number,
  rating2: number
): Promise<{ shouldMatch: boolean; score: number; reasoning: string }> {
  try {
    const lovePrint1 = user1.lovePrint;
    const lovePrint2 = user2.lovePrint;

    // Check cache first
    const cacheKey = `compatibility:${user1.id}:${user2.id}`;
    const cached = await kv.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If no Love Prints, use simple rating-based matching
    if (!lovePrint1 || !lovePrint2) {
      const avgRating = (rating1 + rating2) / 2;
      const result = {
        shouldMatch: avgRating >= 7,
        score: Math.round(avgRating * 10),
        reasoning: 'Based on mutual attraction ratings',
      };
      
      // Cache for 24 hours
      await kv.set(cacheKey, result);
      setTimeout(() => kv.del(cacheKey), 24 * 60 * 60 * 1000);
      
      return result;
    }

    // Use Gemini for deep compatibility analysis
    const prompt = `Analyze romantic compatibility between two people based on their Love Prints and ratings.

Person A's Love Print:
${JSON.stringify(lovePrint1.answers, null, 2)}

Person B's Love Print:
${JSON.stringify(lovePrint2.answers, null, 2)}

Person A rated Person B: ${rating1}/10 (looks/initial attraction)
Person B rated Person A: ${rating2}/10 (looks/initial attraction)

Analyze:
1. Communication compatibility
2. Emotional compatibility  
3. Values alignment
4. Relationship pace compatibility
5. Love language compatibility
6. Attachment style compatibility

Return JSON:
{
  "shouldMatch": boolean (true if compatibility score >= 70),
  "score": number (0-100),
  "reasoning": "Brief 2-sentence explanation of why they match or don't"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extract JSON from markdown if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);

    // Cache for 7 days (compatibility doesn't change often)
    await kv.set(cacheKey, result);
    setTimeout(() => kv.del(cacheKey), 7 * 24 * 60 * 60 * 1000);

    return result;
  } catch (error) {
    console.error('Calculate AI compatibility error:', error);
    
    // Fallback to simple matching
    const avgRating = (rating1 + rating2) / 2;
    return {
      shouldMatch: avgRating >= 7,
      score: Math.round(avgRating * 10),
      reasoning: 'Fallback: Based on mutual ratings',
    };
  }
}

// Create blind match with AI compatibility data
async function createBlindMatchWithAI(
  userId1: string,
  userId2: string,
  compatibilityScore: number,
  reasoning: string
) {
  try {
    // Check if match already exists
    const existingRelationships = await kv.get(`user:${userId1}:love-relationships`) || [];
    const alreadyMatched = existingRelationships.some((relId: string) => 
      relId.includes(userId2)
    );
    
    if (alreadyMatched) {
      return;
    }

    // Generate aliases
    const alias1 = generateAlias();
    const alias2 = generateAlias();

    const relationshipId = `love:${Date.now()}:${userId1}:${userId2}`;
    
    const relationship = {
      id: relationshipId,
      userId1,
      userId2,
      alias1,
      alias2,
      stage: 1,
      bondScore: 0,
      compatibilityScore,
      aiReasoning: reasoning,
      safetyIndex: 1.0,
      createdAt: new Date().toISOString(),
      revealRequestedBy: null,
    };

    await kv.set(relationshipId, relationship);

    // Add to both users' relationship lists
    const user1Relationships = await kv.get(`user:${userId1}:love-relationships`) || [];
    user1Relationships.push(relationshipId);
    await kv.set(`user:${userId1}:love-relationships`, user1Relationships);

    const user2Relationships = await kv.get(`user:${userId2}:love-relationships`) || [];
    user2Relationships.push(relationshipId);
    await kv.set(`user:${userId2}:love-relationships`, user2Relationships);

    // Send initial system message
    const initialMessage = {
      id: `${relationshipId}:msg:${Date.now()}`,
      relationshipId,
      senderId: 'system',
      type: 'system',
      content: `You've been matched! Link's AI analyzed your personalities and found strong compatibility. Get to know each other!`,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`${relationshipId}:messages`, [initialMessage]);

    console.log(`Created AI match: ${userId1} <-> ${userId2} (${compatibilityScore}%)`);
  } catch (error) {
    console.error('Create blind match with AI error:', error);
  }
}

// Get potential Love Mode matches (old endpoint - keeping for compatibility)
app.get("/make-server-2516be19/love-mode/potential-matches", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get all users (distance-based)
    const allUsers = await kv.getByPrefix('user:') || [];
    const userIds = allUsers.map((u: any) => u.id).filter((id: string) => id !== userId);

    // This endpoint is deprecated in favor of discover + rate flow
    return c.json({ matches: [] });
  } catch (error: any) {
    console.error('Love Mode potential matches error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// OLD ENDPOINT - keeping structure but deprecated
async function getOldMatches(userId: string, userProfile: any, userIds: string[]) {
    // Get existing relationships
    const existingRelationships = await kv.get(`user:${userId}:love-relationships`) || [];
    const existingPartnerIds: string[] = [];
    
    for (const relId of existingRelationships) {
      const rel = await kv.get(relId);
      if (rel) {
        const otherId = rel.userId1 === userId ? rel.userId2 : rel.userId1;
        existingPartnerIds.push(otherId);
      }
    }

    const matches = [];
    const userBondPrint = userProfile.bondPrint || userProfile.lovePrint;

    for (const otherId of userIds) {
      if (otherId === userId) continue;
      if (existingPartnerIds.includes(otherId)) continue;

      const otherProfile = await kv.get(`user:${otherId}`);
      if (!otherProfile) continue;

      const otherBondPrint = otherProfile.bondPrint || otherProfile.lovePrint;
      // This is just for reference, not used in new flow
    }

    return matches;
}

// Get user's Love Mode relationships
app.get("/make-server-2516be19/love-mode/relationships", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const relationshipIds = await kv.get(`user:${userId}:love-relationships`) || [];
    const relationships = [];

    for (const relId of relationshipIds) {
      const rel = await kv.get(relId);
      if (!rel) continue;

      const isUser1 = rel.userId1 === userId;
      const otherUserId = isUser1 ? rel.userId2 : rel.userId1;
      const yourAlias = isUser1 ? rel.alias1 : rel.alias2;
      const theirAlias = isUser1 ? rel.alias2 : rel.alias1;

      // Get messages for preview
      const messages = await kv.get(`${relId}:messages`) || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : null;

      // Get other user's profile if revealed (stage 3+)
      let otherUser = null;
      if (rel.stage >= 3) {
        otherUser = await kv.get(`user:${otherUserId}`);
      }

      relationships.push({
        ...rel,
        yourAlias,
        theirAlias,
        otherUser,
        lastMessage,
        compatibilityScore: rel.compatibilityScore,
        bondScore: rel.bondScore || 0,
      });
    }

    // Sort by most recent
    relationships.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ relationships });
  } catch (error: any) {
    console.error('Get Love Mode relationships error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get messages for a relationship
app.get("/make-server-2516be19/love-mode/messages/:relationshipId", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const relationshipId = c.req.param('relationshipId');
    const relationship = await kv.get(relationshipId);

    if (!relationship) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    // Verify user is part of this relationship
    if (relationship.userId1 !== userId && relationship.userId2 !== userId) {
      return c.json({ error: 'Unauthorized access to relationship' }, 403);
    }

    const messages = await kv.get(`${relationshipId}:messages`) || [];

    // Prepare relationship data for client
    const isUser1 = relationship.userId1 === userId;
    const otherUserId = isUser1 ? relationship.userId2 : relationship.userId1;
    const yourAlias = isUser1 ? relationship.alias1 : relationship.alias2;
    const theirAlias = isUser1 ? relationship.alias2 : relationship.alias1;

    let otherUser = null;
    if (relationship.stage >= 3) {
      otherUser = await kv.get(`user:${otherUserId}`);
    }

    return c.json({ 
      messages, 
      relationship: {
        ...relationship,
        yourAlias,
        theirAlias,
        otherUser,
      }
    });
  } catch (error: any) {
    console.error('Get Love Mode messages error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send a message in Love Mode (with AI screening)
app.post("/make-server-2516be19/love-mode/send-message", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { relationshipId, content, type = 'text' } = await c.req.json();

    const relationship = await kv.get(relationshipId);
    if (!relationship) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    // Verify user is part of this relationship
    if (relationship.userId1 !== userId && relationship.userId2 !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Screen message for identity leaks ONLY if not yet revealed (stage < 3)
    if (relationship.stage < 3 && type === 'text') {
      const screeningResult = await screenMessageForIdentity(content, userId, relationship);
      
      if (screeningResult.containsIdentity) {
        return c.json({ 
          error: 'Message blocked',
          reason: screeningResult.reason,
          blocked: true,
        }, 400);
      }
    }

    // Create message
    const message = {
      id: `${relationshipId}:msg:${Date.now()}`,
      relationshipId,
      senderId: userId,
      type,
      content,
      timestamp: new Date().toISOString(),
    };

    // Get existing messages
    const messages = await kv.get(`${relationshipId}:messages`) || [];
    messages.push(message);
    await kv.set(`${relationshipId}:messages`, messages);

    // Update bond score (simple increment for now)
    relationship.bondScore = Math.min(100, (relationship.bondScore || 0) + 2);

    // Check for stage progression
    const messageCount = messages.filter((m: any) => m.type !== 'system').length;
    let linkCoaching = null;

    // Progress to Voice Exchange after 15+ meaningful messages
    if (relationship.stage === 1 && messageCount >= 15 && relationship.bondScore >= 40) {
      relationship.stage = 2;
      
      const systemMsg = {
        id: `${relationshipId}:msg:${Date.now() + 1}`,
        relationshipId,
        senderId: 'system',
        type: 'system',
        content: 'Voice Exchange unlocked! You can now send voice memos to deepen your connection.',
        timestamp: new Date().toISOString(),
      };
      messages.push(systemMsg);
      linkCoaching = "Great progress! You've built enough rapport. Voice memos are now available to help you connect more deeply.";
    }

    // Occasional Link coaching
    if (messageCount % 10 === 0 && !linkCoaching) {
      linkCoaching = "You're building a meaningful connection. Keep being authentic and curious about each other.";
    }

    await kv.set(relationshipId, relationship);
    await kv.set(`${relationshipId}:messages`, messages);

    return c.json({ success: true, message, linkCoaching });
  } catch (error: any) {
    console.error('Send Love Mode message error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Screen message for identity leaks using AI (with caching)
async function screenMessageForIdentity(
  message: string,
  userId: string,
  relationship: any
): Promise<{ containsIdentity: boolean; reason?: string }> {
  try {
    // Get user profile to compare against
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return { containsIdentity: false };
    }

    // Quick pattern matching first (cheap check)
    const patterns = [
      new RegExp(userProfile.name.split(' ')[0], 'i'), // First name
      new RegExp(userProfile.name.split(' ').slice(-1)[0], 'i'), // Last name
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Full names (Capitalized)
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /@[\w.]+/, // Email/handles
      /insta(?:gram)?[:\s][@\w]+/i, // Instagram
      /snap(?:chat)?[:\s][@\w]+/i, // Snapchat
      /\bdorm\s+\w+\s+room\s+\d+/i, // Dorm room numbers
      /\bmy\s+name\s+is\b/i, // Explicit name sharing
    ];

    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return {
          containsIdentity: true,
          reason: 'Message contains identifying information',
        };
      }
    }

    // Check cache for this message hash (to avoid repeated AI calls)
    const messageHash = await simpleHash(message.toLowerCase().trim());
    const cacheKey = `screening:${messageHash}`;
    const cached = await kv.get(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // Use AI for deeper analysis (only if quick check passed and cache missed)
    const prompt = `Analyze if this message reveals personal identity that should stay private in anonymous chat:

Message: "${message}"

User's name: ${userProfile.name}
School: ${userProfile.school}

Check for: names, social media handles, phone numbers, specific locations, unique identifiers.

Return ONLY valid JSON:
{"containsIdentity": false, "reason": ""}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
        }),
      }
    );

    if (!response.ok) {
      return { containsIdentity: false };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"containsIdentity":false}';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { containsIdentity: false };

    // Cache for 30 days
    await kv.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Screen message error:', error);
    return { containsIdentity: false }; // Fail open
  }
}

// Simple hash for caching
async function simpleHash(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// Request reveal (stage 3)
app.post("/make-server-2516be19/love-mode/request-reveal", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { relationshipId } = await c.req.json();

    const relationship = await kv.get(relationshipId);
    if (!relationship) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    // Verify user is part of this relationship
    if (relationship.userId1 !== userId && relationship.userId2 !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Must be at stage 2 (Voice Exchange)
    if (relationship.stage < 2) {
      return c.json({ error: 'Not ready for reveal yet. Keep building connection!' }, 400);
    }

    // Check if already revealed
    if (relationship.stage >= 3) {
      return c.json({ message: 'Already revealed!' });
    }

    const messages = await kv.get(`${relationshipId}:messages`) || [];

    // Check if other user already requested
    if (relationship.revealRequestedBy && relationship.revealRequestedBy !== userId) {
      // Both want to reveal - unlock stage 3!
      relationship.stage = 3;
      relationship.revealedAt = new Date().toISOString();
      
      const systemMsg = {
        id: `${relationshipId}:msg:${Date.now()}`,
        relationshipId,
        senderId: 'system',
        type: 'system',
        content: 'Reveal Stage unlocked! You can now see each other\'s full profiles.',
        timestamp: new Date().toISOString(),
      };
      messages.push(systemMsg);
      
      await kv.set(relationshipId, relationship);
      await kv.set(`${relationshipId}:messages`, messages);

      return c.json({ message: 'Profiles revealed', revealed: true });
    } else {
      // First request - store it
      relationship.revealRequestedBy = userId;
      await kv.set(relationshipId, relationship);

      const isUser1 = relationship.userId1 === userId;
      const theirAlias = isUser1 ? relationship.alias2 : relationship.alias1;

      const systemMsg = {
        id: `${relationshipId}:msg:${Date.now()}`,
        relationshipId,
        senderId: 'system',
        type: 'system',
        content: `${theirAlias} wants to reveal profiles. You can accept or continue chatting anonymously.`,
        timestamp: new Date().toISOString(),
      };
      messages.push(systemMsg);
      await kv.set(`${relationshipId}:messages`, messages);

      return c.json({ message: 'Reveal request sent! Waiting for response.', revealed: false });
    }
  } catch (error: any) {
    console.error('Request reveal error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);