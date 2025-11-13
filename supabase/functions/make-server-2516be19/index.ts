import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getFirstQuestion, getNextQuestion, generateLovePrint, tryCallGemini } from "./love-print-helpers.tsx";
import { rateLimit, rateLimitConfigs } from "./rate-limiter.ts";
import { moderateProfile, moderateMessage, logModerationAction } from "./content-moderator.ts";

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
// PRODUCTION: Update allowed origins to your actual domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bonded.vercel.app',
  'https://*.vercel.app', // Your Vercel preview deployments
  // Add your production domain here
];

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return origin;

      // Check if origin is in allowed list
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
          return pattern.test(origin);
        }
        return allowed === origin;
      });

      return isAllowed ? origin : allowedOrigins[0];
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 600,
    credentials: true,
  }),
);

// Apply general API rate limiting to all routes
app.use("/*", rateLimit(rateLimitConfigs.api));

// Middleware to verify auth and get user ID
async function getUserId(authHeader: string | null): Promise<string | null> {
  try {
    if (!authHeader) {
      console.log('No authorization header provided');
      return null;
    }
    
    // Handle both "Bearer token" and just "token" formats
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;
    
    if (!token) {
      console.log('No token found in authorization header');
      return null;
    }
    
    // Try Supabase auth first
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        return user.id;
      }
      
      if (error) {
        console.error('Supabase auth error:', error.message);
      }
    } catch (supabaseError: any) {
      console.error('Supabase getUser error:', supabaseError.message);
    }
    
    // Fallback: Try to decode JWT directly (for Edge Function context)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // Decode base64url payload
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(base64);
        const payload = JSON.parse(payloadJson);
        
        // Extract user ID from JWT payload (subject field is standard)
        const userId = payload.sub || payload.user_id || payload.id;
        if (userId) {
          console.log('Extracted user ID from JWT payload:', userId);
          return userId;
        }
      }
    } catch (jwtError: any) {
      console.error('JWT decode error:', jwtError.message);
    }
    
    console.log('Failed to extract user ID from token');
    return null;
  } catch (error: any) {
    console.error('getUserId error:', error.message);
    return null;
  }
}

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/signup", async (c) => {
  try {
    console.log('[SIGNUP] Request received');
    console.log('[SIGNUP] Method:', c.req.method);
    console.log('[SIGNUP] Path:', c.req.path);
    console.log('[SIGNUP] URL:', c.req.url);
    
    const body = await c.req.json();
    console.log('[SIGNUP] Body received:', { email: body.email, name: body.name, school: body.school, hasPassword: !!body.password });
    
    const { email, password, name, school } = body;

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
app.get("/user-info", async (c) => {
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
app.post("/profile", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();

    // Content moderation check
    const moderationResult = moderateProfile({
      name: profileData.name,
      bio: profileData.bio,
      interests: profileData.interests,
      major: profileData.major,
    });

    if (!moderationResult.isClean && moderationResult.severity === 'blocked') {
      logModerationAction(userId, 'profile', moderationResult, JSON.stringify(profileData));
      return c.json({
        error: 'Content moderation failed',
        reason: moderationResult.reason,
        flaggedWords: moderationResult.flaggedWords,
      }, 400);
    }

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
      settings: {
        readReceipts: profileData.settings?.readReceipts !== undefined ? profileData.settings.readReceipts : true, // Default to enabled
        profileVisible: profileData.settings?.profileVisible !== undefined ? profileData.settings.profileVisible : true, // Default to visible
        allowMessages: profileData.settings?.allowMessages !== undefined ? profileData.settings.allowMessages : true, // Default to allow
        showOnlineStatus: profileData.settings?.showOnlineStatus !== undefined ? profileData.settings.showOnlineStatus : true, // Default to show
        ...profileData.settings,
      },
      blockedUsers: profileData.blockedUsers || [],
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
    
    // Maintain list of all schools
    const allSchools = await kv.get('schools:all') || [];
    if (!allSchools.includes(school)) {
      allSchools.push(school);
      await kv.set('schools:all', allSchools);
    }

    return c.json(profile);
  } catch (error: any) {
    console.error('Profile creation error:', error);
    return c.json({ error: error.message || 'Profile creation failed' }, 500);
  }
});

// Get profile by ID
app.get("/profile/:userId", async (c) => {
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

// GDPR Data Export - Export all user data
app.get("/export-data", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Collect all user data
    const profile = await kv.get(`user:${userId}`) || {};

    // Get user's chats
    const allChats = await kv.get('chats') || [];
    const userChats = allChats.filter((chat: any) =>
      chat.participants.includes(userId)
    );

    // Get messages from user's chats
    const userMessages = await Promise.all(
      userChats.map(async (chat: any) => {
        const messages = await kv.get(`chat:${chat.id}:messages`) || [];
        return {
          chatId: chat.id,
          messages: messages.filter((msg: any) => msg.senderId === userId),
        };
      })
    );

    // Get soft intros (connection requests)
    const incomingIntros = await kv.get(`user:${userId}:soft-intros:incoming`) || [];
    const outgoingIntros = await kv.get(`user:${userId}:soft-intros:outgoing`) || [];

    // Get connections
    const connections = await kv.get(`user:${userId}:connections`) || [];

    // Get Bond Print sessions
    const bondPrintSession = await kv.get(`bond-print-session:${userId}`);

    // Compile complete data export
    const dataExport = {
      exportDate: new Date().toISOString(),
      userId: userId,
      profile: {
        ...profile,
        // Remove sensitive system fields
        updatedAt: profile.updatedAt,
        createdAt: profile.createdAt || new Date().toISOString(),
      },
      chats: userChats.map((chat: any) => ({
        id: chat.id,
        participants: chat.participants,
        createdAt: chat.createdAt,
        lastMessage: chat.lastMessage,
      })),
      messages: userMessages.flatMap(chat => chat.messages),
      connectionRequests: {
        sent: outgoingIntros,
        received: incomingIntros,
      },
      connections: connections,
      bondPrint: {
        session: bondPrintSession,
        results: profile.bondPrint,
      },
      dataRetention: {
        note: 'This export includes all personal data we store about you.',
        deletion: 'To delete your account and all data, go to Settings > Account > Delete Account',
      },
    };

    // Set headers for file download
    c.header('Content-Type', 'application/json');
    c.header('Content-Disposition', `attachment; filename="bonded-data-export-${userId}-${Date.now()}.json"`);

    return c.json(dataExport);
  } catch (error: any) {
    console.error('Data export error:', error);
    return c.json({ error: 'Failed to export data', details: error.message }, 500);
  }
});

// Smart matches endpoint with advanced filtering
app.get("/discover/smart-matches", async (c) => {
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
        let bondPrintScore: number | null = null;
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
app.get("/compatibility/:targetUserId", async (c) => {
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
app.post("/upload-photo", async (c) => {
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
app.get("/profiles", async (c) => {
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
app.get("/matches", async (c) => {
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
app.post("/soft-intro/generate-ai-analysis", async (c) => {
  let userId: string | null = null;
  let toUserId: string | null = null;
  let reason: string | null = null;
  
  try {
    userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    toUserId = body.toUserId;
    reason = body.reason;
    
    if (!toUserId || !reason) {
      return c.json({ error: 'Missing toUserId or reason' }, 400);
    }
    
    // Get both profiles
    const currentProfile = await kv.get(`user:${userId}`);
    const targetProfile = await kv.get(`user:${toUserId}`);
    
    if (!currentProfile || !targetProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Calculate Bond Print compatibility if both have completed it
    let bondPrintScore: number | null = null;
    if (currentProfile.bondPrint && targetProfile.bondPrint) {
      bondPrintScore = calculateBondPrintCompatibility(
        currentProfile.bondPrint,
        targetProfile.bondPrint
      );
    }

    // Generate AI analysis (includes Bond Print compatibility)
    // This will always return a result, even if AI fails (uses fallback)
    const analysis = await generateAISoftIntro(
      currentProfile,
      targetProfile,
      reason,
      bondPrintScore
    );

    return c.json(analysis);
  } catch (error: any) {
    console.error('AI analysis endpoint error:', error);
    console.error('Error stack:', error.stack);
    
    // Even if there's an error, try to return a basic analysis
    if (userId && toUserId) {
      try {
        const currentProfile = await kv.get(`user:${userId}`);
        const targetProfile = await kv.get(`user:${toUserId}`);
        
        if (currentProfile && targetProfile) {
          const commonInterests = (currentProfile.interests || []).filter((i: string) =>
            (targetProfile.interests || []).includes(i)
          );
          
          return c.json({
            analysis: `You and ${targetProfile.name} seem like a great match!${commonInterests.length > 0 ? ` You both share an interest in ${commonInterests[0]}.` : ''}`,
            score: 70,
            highlights: commonInterests.length > 0 
              ? [`Shared interest in ${commonInterests[0]}`]
              : ['Potential for meaningful connection']
          });
        }
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
      }
    }
    
    // Final fallback - return basic analysis even if everything fails
    return c.json({ 
      analysis: "You seem like a great match!",
      score: 70,
      highlights: ["Potential for meaningful connection"]
    });
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

Connection reason: ${reason} (friends/roommate/study/collaborate/network/event-buddy/workout-partner/dining-companion)
${bondPrintScore !== null ? `\nBond Print Compatibility Score: ${bondPrintScore}/100 (based on personality profile analysis)` : '\nNote: One or both users have not completed Bond Print quiz'}

Generate a detailed, insightful analysis that:
1. Explains WHY they're a great match (2-3 sentences) - be specific about shared interests, goals, or complementary traits
2. Suggests HOW they can connect - whether as friends, study partners, business collaborators, or other meaningful relationships
3. Highlights WHAT they have in common - specific shared interests, goals, or values
4. Provides actionable insights - concrete ways they can help each other or activities they could do together

Focus on:
- Specific shared academic/leisure goals and how they align
- Common interests and how they could explore them together
- Complementary personalities and how they balance each other
- Why this connection makes sense for the reason given (${reason})
- Concrete ways they can help each other achieve their goals
- Potential activities, projects, or experiences they could share
- Any additional information that indicates compatibility

Be specific and actionable. Instead of "you both like tech", say "You both share an interest in tech - you could collaborate on projects, attend hackathons together, or form a study group for CS classes."

Return ONLY valid JSON in this exact format:
{
  "analysis": "Your detailed, specific analysis here (2-3 sentences explaining why they match and how they can connect)...",
  "score": 85,
  "highlights": ["Specific shared interest or goal", "How they can connect (friends/business/study)", "Actionable way they can help each other"]
}`;

  try {
    // Check if API key is configured
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('GEMINI_API_KEY not configured');
    }

    if (apiKey.length < 20) {
      console.error('GEMINI_API_KEY appears to be invalid (too short)');
      throw new Error('Invalid GEMINI_API_KEY format');
    }

    console.log('Calling Gemini API for soft intro analysis...');
    
    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error ${response.status}:`, errorText);
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('Gemini API key is invalid or expired');
      } else if (response.status === 429) {
        throw new Error('Gemini API rate limit exceeded');
      } else if (response.status === 400) {
        throw new Error(`Gemini API bad request: ${errorText.substring(0, 200)}`);
      } else {
        throw new Error(`Gemini API error ${response.status}: ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    
    // Check if we have valid response data
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini API response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }
    
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    
    if (!text) {
      console.error('Empty response from Gemini API');
      throw new Error('Empty response from Gemini API');
    }
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const score = parsed.score || 75;
        const analysis = parsed.analysis || "You seem like a great match!";
        const highlights = parsed.highlights || ["Shared interests", "Similar goals"];
        
        return {
          analysis: analysis,
          score: score,
          highlights: highlights
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', text.substring(0, 200));
        throw new Error('Failed to parse AI response');
      }
    }
    
    // Fallback if no JSON found in response
    console.warn('No JSON found in Gemini response, using fallback');
    throw new Error('No valid JSON in AI response');
  } catch (error: any) {
    console.error('Gemini API error:', error);
    console.error('Error details:', error.message, error.stack);
    
    // Fallback analysis based on profile data
    const commonInterests = (user1.interests || []).filter((i: string) =>
      (user2.interests || []).includes(i)
    );
    const commonAcademicGoals = (user1.goals?.academic || []).filter((g: string) =>
      (user2.goals?.academic || []).includes(g)
    );
    const commonLeisureGoals = (user1.goals?.leisure || []).filter((g: string) =>
      (user2.goals?.leisure || []).includes(g)
    );
    const commonLookingFor = (user1.lookingFor || []).filter((l: string) =>
      (user2.lookingFor || []).includes(l)
    );

    // Build fallback highlights
    const highlights: string[] = [];
    if (commonInterests.length > 0) {
      highlights.push(`Shared interest in ${commonInterests.slice(0, 2).join(' and ')}`);
    }
    if (commonAcademicGoals.length > 0) {
      highlights.push(`Similar academic goals: ${commonAcademicGoals[0]}`);
    }
    if (commonLeisureGoals.length > 0) {
      highlights.push(`Common leisure goal: ${commonLeisureGoals[0]}`);
    }
    if (commonLookingFor.length > 0) {
      highlights.push(`Both looking for: ${commonLookingFor[0]}`);
    }
    if (highlights.length === 0) {
      highlights.push('Potential for meaningful connection');
      if (user1.major && user2.major && user1.major === user2.major) {
        highlights.push(`Both studying ${user1.major}`);
      }
    }

    // Calculate a simple compatibility score
    let score = 50; // Base score
    score += commonInterests.length * 10;
    score += commonAcademicGoals.length * 15;
    score += commonLeisureGoals.length * 10;
    score += commonLookingFor.length * 15;
    if (user1.major && user2.major && user1.major === user2.major) {
      score += 10;
    }
    score = Math.min(score, 95);

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

    // Use the highlights array already built above
    if (highlights.length === 0) {
      highlights.push("Potential great connection");
      if (user1.major === user2.major) {
        highlights.push(`Same major: ${user1.major}`);
      }
    }

    return {
      analysis,
      score: Math.min(95, score),
      highlights: highlights.length > 0 ? highlights : ["Potential great connection"]
    };
  }
}

// Send soft intro
app.post("/soft-intro", async (c) => {
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
app.get("/soft-intros/incoming", async (c) => {
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
app.get("/soft-intros/outgoing", async (c) => {
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
app.post("/soft-intro/:introId/accept", async (c) => {
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
app.post("/soft-intro/:introId/deny", async (c) => {
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
app.get("/connections", async (c) => {
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
app.post("/chat/start", async (c) => {
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
app.get("/chats", async (c) => {
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

      // Get last message and unread count
      const messages = await kv.get(`chat:${chatId}:messages`) || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : null;
      
      // Count unread messages (messages from other user that haven't been read by current user)
      const unreadCount = messages.filter((msg: any) => 
        msg.senderId !== userId && (!msg.readBy || !msg.readBy.includes(userId))
      ).length;

      chats.push({
        chatId,
        otherUser,
        lastMessage,
        unreadCount,
        lastMessageTimestamp: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
      });
    }

    return c.json(chats);
  } catch (error: any) {
    console.error('Chats fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get messages for a chat
app.get("/chat/:chatId/messages", async (c) => {
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
    
    // Mark all messages from other users as read when loading
    let updated = false;
    const updatedMessages = messages.map((msg: any) => {
      if (msg.senderId !== userId && (!msg.readBy || !msg.readBy.includes(userId))) {
        updated = true;
        return {
          ...msg,
          readBy: [...(msg.readBy || []), userId],
          readAt: msg.readAt || new Date().toISOString(),
        };
      }
      return msg;
    });
    
    if (updated) {
      await kv.set(`chat:${chatId}:messages`, updatedMessages);
      return c.json(updatedMessages);
    }
    
    return c.json(messages);
  } catch (error: any) {
    console.error('Messages fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send a message
app.post("/chat/:chatId/message", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatId = c.req.param('chatId');
    const { content } = await c.req.json();

    // Content moderation check
    const moderationResult = moderateMessage(content);
    if (!moderationResult.isClean && moderationResult.severity === 'blocked') {
      logModerationAction(userId, 'message', moderationResult, content);
      return c.json({
        error: 'Message contains inappropriate content',
        reason: moderationResult.reason,
      }, 400);
    }

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
      readBy: [], // Track who has read this message
      readAt: null, // Timestamp when first read
    };

    messages.push(newMessage);
    await kv.set(`chat:${chatId}:messages`, messages);

    return c.json(newMessage);
  } catch (error: any) {
    console.error('Message send error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mark messages as read
app.post("/chat/:chatId/read", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatId = c.req.param('chatId');
    const { messageIds } = await c.req.json(); // Optional: specific message IDs, or mark all as read

    const chat = await kv.get(`chat:${chatId}`);
    if (!chat || !chat.participants.includes(userId)) {
      return c.json({ error: 'Unauthorized access to chat' }, 403);
    }

    const messages = await kv.get(`chat:${chatId}:messages`) || [];
    let updated = false;
    
    const updatedMessages = messages.map((msg: any) => {
      // If specific message IDs provided, only mark those; otherwise mark all from other user
      if (messageIds && !messageIds.includes(msg.id)) {
        return msg;
      }
      
      // Mark messages from other users as read
      if (msg.senderId !== userId && (!msg.readBy || !msg.readBy.includes(userId))) {
        updated = true;
        return {
          ...msg,
          readBy: [...(msg.readBy || []), userId],
          readAt: msg.readAt || new Date().toISOString(),
        };
      }
      return msg;
    });

    if (updated) {
      await kv.set(`chat:${chatId}:messages`, updatedMessages);
    }

    return c.json({ success: true, unreadCount: 0 });
  } catch (error: any) {
    console.error('Mark read error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Typing indicator - start typing
app.post("/chat/:chatId/typing/start", async (c) => {
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

    // Store typing status (expires after 3 seconds)
    await kv.set(`chat:${chatId}:typing:${userId}`, {
      userId,
      timestamp: new Date().toISOString(),
    }, 3); // 3 second TTL

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Typing start error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Typing indicator - stop typing
app.post("/chat/:chatId/typing/stop", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatId = c.req.param('chatId');
    await kv.delete(`chat:${chatId}:typing:${userId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Typing stop error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get typing status for a chat
app.get("/chat/:chatId/typing", async (c) => {
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

    // Get typing status for other participants
    const otherUserId = chat.participants.find((id: string) => id !== userId);
    if (!otherUserId) {
      return c.json({ typing: false });
    }

    const typingStatus = await kv.get(`chat:${chatId}:typing:${otherUserId}`);
    // If typingStatus exists and is not null/undefined, user is typing
    // The TTL will automatically expire after 3 seconds, so if it exists, they're actively typing
    const isTyping = typingStatus !== null && typingStatus !== undefined;
    return c.json({ typing: isTyping, userId: typingStatus?.userId });
  } catch (error: any) {
    console.error('Get typing error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// LOVE PRINT QUIZ SYSTEM WITH ADAPTIVE AI
// ============================================

// Start Bond Print Quiz
app.post("/bond-print/start", async (c) => {
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
app.post("/bond-print/answer", async (c) => {
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
// Enhance Bond Print with LinkedIn data
async function enhanceBondPrintWithLinkedIn(profile: any, linkedinData: any): Promise<any | null> {
  if (!profile.bondPrint) {
    return null;
  }

  const { tryCallGemini } = await import('./love-print-helpers.tsx');

  const linkedinInfo = `
LinkedIn Profile Data:
- Name: ${linkedinData.name || 'Not available'}
- Email: ${linkedinData.email || 'Not available'}
- Locale: ${linkedinData.locale || 'Not available'}
${linkedinData.profileDetails ? `- Profile Details: ${JSON.stringify(linkedinData.profileDetails).substring(0, 500)}` : ''}
`;

  const prompt = `You are enhancing a Bond Print (personality profile) with professional data from LinkedIn for a college student.

Current Bond Print:
${JSON.stringify(profile.bondPrint, null, 2)}

User Profile:
- Name: ${profile.name}
- Major: ${profile.major || 'Not specified'}
- Year: ${profile.year || 'Not specified'}
- Interests: ${profile.interests?.join(', ') || 'None'}
- Looking For: ${profile.lookingFor?.join(', ') || 'None'}

${linkedinInfo}

Enhance the Bond Print by:
1. Adding professional traits and skills inferred from LinkedIn profile
2. Updating collaboration style based on professional experience
3. Refining communication style with professional context
4. Adding career-oriented values if relevant
5. Updating summary to reflect professional aspirations

Maintain the existing structure and only enhance/add to it. Don't remove existing traits unless they conflict with professional data.

Return ONLY a JSON object (no markdown) with the same structure as the current Bond Print, enhanced with LinkedIn insights:
{
  "traits": { ... (enhanced) },
  "personality": { ... (enhanced) },
  "communication": { ... (enhanced) },
  "social": { ... (enhanced) },
  "values": [ ... (may add professional values) ],
  "livingPreferences": { ... },
  "summary": "... (enhanced with professional context)",
  "professionalInsights": {
    "skills": ["skill1", "skill2"],
    "careerOrientation": "description",
    "collaborationStyle": "enhanced description"
  }
}`;

  const geminiResponse = await tryCallGemini(prompt);
  
  if (geminiResponse) {
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const enhancedBondPrint = JSON.parse(jsonMatch[0]);
        // Preserve original metadata
        enhancedBondPrint.createdAt = profile.bondPrint.createdAt;
        enhancedBondPrint.updatedAt = new Date().toISOString();
        enhancedBondPrint.quizVersion = profile.bondPrint.quizVersion || '1.0';
        enhancedBondPrint.enhancedWithLinkedIn = true;
        enhancedBondPrint.enhancedAt = new Date().toISOString();
        return enhancedBondPrint;
      }
    } catch (e) {
      console.log('Failed to parse enhanced Bond Print from LinkedIn data');
    }
  }
  
  // If enhancement fails, return original
  return profile.bondPrint;
}

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
app.get("/bond-print/compatibility/:targetUserId", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = c.req.param('targetUserId');
    
    const userProfile = await kv.get(`user:${userId}`);
    const targetProfile = await kv.get(`user:${targetUserId}`);
    
    if (!userProfile || !targetProfile) {
      return c.json({ 
        score: 0, 
        error: 'Profile not found' 
      }, 200); // Return 200 with score 0 instead of 404
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
app.post("/bond-print/generate", async (c) => {
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
app.post("/bond-print/compatibility", async (c) => {
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

    const response = await tryCallGemini(prompt);
    if (!response) {
      throw new Error('Failed to generate AI analysis');
    }
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
app.get("/love-print/:userId", async (c) => {
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
app.get("/bond-print/:userId", async (c) => {
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
// AI ASSISTANT - SERIES AI FUNCTIONALITY
// ============================================

// AI Assistant Chat - Handle user messages to AI
app.post("/ai-assistant/chat", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { message } = await c.req.json();
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Create AI chat if it doesn't exist
    const aiChatId = `ai-assistant:${userId}`;
    let aiChat = await kv.get(aiChatId);
    if (!aiChat) {
      aiChat = {
        chatId: aiChatId,
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
    }

    // Add user message
    const userMessage = {
      id: `${aiChatId}:${Date.now()}`,
      senderId: userId,
      content: message,
      timestamp: new Date().toISOString(),
      type: 'user',
    };
    aiChat.messages.push(userMessage);
    await kv.set(aiChatId, aiChat);

    // Use Gemini to generate AI response
    const { tryCallGemini } = await import('./love-print-helpers.tsx');
    
    // Include LinkedIn data if available
    const linkedinInfo = userProfile.socialConnections?.linkedin?.scrapedData ? `
- LinkedIn: Connected
  ${userProfile.socialConnections.linkedin.scrapedData.name ? `  Name: ${userProfile.socialConnections.linkedin.scrapedData.name}` : ''}
  ${userProfile.socialConnections.linkedin.scrapedData.locale ? `  Location: ${userProfile.socialConnections.linkedin.scrapedData.locale}` : ''}
` : '';

    const bondPrintInfo = userProfile.bondPrint ? `
- Bond Print: Available
  ${userProfile.bondPrint.professionalInsights ? `  Professional Skills: ${userProfile.bondPrint.professionalInsights.skills?.join(', ') || 'None'}` : ''}
  ${userProfile.bondPrint.professionalInsights?.careerOrientation ? `  Career Orientation: ${userProfile.bondPrint.professionalInsights.careerOrientation}` : ''}
` : '';

    const prompt = `You are Link, an AI assistant for Bonded - a social app for college students to find friends, roommates, study partners, and collaborators.

User Profile:
- Name: ${userProfile.name}
- School: ${userProfile.school}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Interests: ${userProfile.interests?.join(', ') || 'None'}
- Looking For: ${userProfile.lookingFor?.join(', ') || 'None'}
- Goals: ${JSON.stringify(userProfile.goals || {})}
${linkedinInfo}${bondPrintInfo}

User Message: "${message}"

Your role:
1. Help users find people on campus (co-founders, study partners, friends, roommates, etc.)
2. Search through profiles to find matches
3. Suggest people they should connect with
4. Help facilitate soft intros

When a user asks to find someone (e.g., "I'm looking for a co-founder for X"), you should:
- Acknowledge their request
- Let them know you'll search through profiles
- Ask clarifying questions if needed (what skills, what type of project, etc.)
- Use LinkedIn data and professional insights when relevant (e.g., for co-founder searches, career-oriented connections)

Be warm, helpful, and conversational. Keep responses concise but friendly.

Respond as Link:`;

    const aiResponseText = await tryCallGemini(prompt);
    
    // Smart fallback if Gemini fails
    if (!aiResponseText) {
      console.error('Gemini API failed, using smart fallback');
      
      const lowerMessage = message.toLowerCase();
      let fallbackResponse = "I'd love to help you find someone!";
      let shouldSearch = false;
      
      // Detect what they're looking for
      if (lowerMessage.includes('co-founder') || lowerMessage.includes('cofounder') || lowerMessage.includes('founder')) {
        fallbackResponse = "That's exciting! I can help you find a co-founder on campus. Let me search through profiles to find someone who might be a great match for your project. What kind of skills or background are you looking for?";
        shouldSearch = true;
      } else if (lowerMessage.includes('study partner') || lowerMessage.includes('study buddy')) {
        fallbackResponse = "I can help you find a study partner! Let me search through profiles to find someone who might be a good match for studying together.";
        shouldSearch = true;
      } else if (lowerMessage.includes('roommate')) {
        fallbackResponse = "I can help you find a roommate! Let me search through profiles to find someone who might be compatible for living together.";
        shouldSearch = true;
      } else if (lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
        fallbackResponse = "I can help you find someone! What are you looking for? A co-founder, study partner, roommate, or friend?";
        shouldSearch = true;
      } else if (lowerMessage.includes('compsci') || lowerMessage.includes('computer science') || lowerMessage.includes('cs ') || 
                 lowerMessage.includes('major') || lowerMessage.includes('skill') || lowerMessage.includes('background') ||
                 lowerMessage.includes('search')) {
        // This is a follow-up with criteria - trigger search
        fallbackResponse = "Got it! Let me search for people matching that criteria.";
        shouldSearch = true;
      } else {
        fallbackResponse = "I'm here to help you find connections on campus! You can ask me to find co-founders, study partners, roommates, or friends. What are you looking for?";
      }
      
      // Add AI response to chat history even with fallback
      const fallbackMessage = {
        id: `${aiChatId}:${Date.now() + 1}`,
        senderId: 'ai-assistant',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };
      aiChat.messages.push(fallbackMessage);
      await kv.set(aiChatId, aiChat);
      
      return c.json({
        response: fallbackResponse,
        suggestions: shouldSearch ? ["Search profiles now", "Tell me more about what you're looking for"] : 
                     ["Find a co-founder", "Find a study partner", "Find a roommate"],
        shouldSearch: shouldSearch,
      });
    }

    // Add AI response
    const aiMessage = {
      id: `${aiChatId}:${Date.now() + 1}`,
      senderId: 'ai-assistant',
      content: aiResponseText.trim(),
      timestamp: new Date().toISOString(),
      type: 'ai',
    };
    aiChat.messages.push(aiMessage);
    await kv.set(aiChatId, aiChat);

    // Check if user is asking to find someone
    const lowerMessage = message.toLowerCase();
    const isSearchRequest = lowerMessage.includes('find') || 
                           lowerMessage.includes('looking for') ||
                           lowerMessage.includes('co-founder') ||
                           lowerMessage.includes('cofounder') ||
                           lowerMessage.includes('founder') ||
                           lowerMessage.includes('study partner') ||
                           lowerMessage.includes('study buddy') ||
                           lowerMessage.includes('roommate') ||
                           lowerMessage.includes('collaborator') ||
                           lowerMessage.includes('search') ||
                           // Check if this is a follow-up with criteria (major, skills, etc.)
                           lowerMessage.includes('compsci') ||
                           lowerMessage.includes('computer science') ||
                           lowerMessage.includes('cs ') ||
                           lowerMessage.includes('major') ||
                           lowerMessage.includes('skill') ||
                           lowerMessage.includes('background');

    return c.json({
      response: aiResponseText.trim(),
      suggestions: isSearchRequest ? ["Search profiles", "Tell me more about what you're looking for"] : 
                   ["Find a co-founder", "Find a study partner", "Find a roommate"],
      shouldSearch: isSearchRequest,
    });
  } catch (error: any) {
    console.error('AI assistant chat error:', error);
    return c.json({ error: error.message || 'Failed to process AI chat' }, 500);
  }
});

// AI Search Profiles - Search for people based on criteria
app.post("/ai-assistant/search", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { query, criteria } = await c.req.json();
    
    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Get all profiles from user's school first
    const schoolKey = `school:${userProfile.school}:users`;
    const schoolUserIds = await kv.get(schoolKey) || [];
    
    // Filter out current user
    let otherUserIds = schoolUserIds.filter((id: string) => id !== userId);
    
    // Get profiles from user's school
    let profiles = [];
    for (const otherUserId of otherUserIds.slice(0, 100)) { // Limit to 100 for performance
      const profile = await kv.get(`user:${otherUserId}`);
      if (profile && profile.id !== userId) {
        profiles.push(profile);
      }
    }
    
    // If no profiles found in user's school, branch out to other schools
    if (profiles.length === 0) {
      console.log(`No profiles found in ${userProfile.school}, searching other schools...`);
      
      // Get list of all schools
      const allSchools = await kv.get('schools:all') || [];
      
      // Search through other schools
      for (const otherSchool of allSchools) {
        if (otherSchool === userProfile.school) continue; // Skip user's school (already searched)
        
        const otherSchoolKey = `school:${otherSchool}:users`;
        const otherSchoolUserIds = await kv.get(otherSchoolKey) || [];
        
        // Get profiles from this school
        for (const otherUserId of otherSchoolUserIds.slice(0, 50)) { // Limit per school
          const profile = await kv.get(`user:${otherUserId}`);
          if (profile && profile.id !== userId) {
            profiles.push(profile);
          }
        }
        
        // If we found some profiles, stop searching (prioritize first school with matches)
        if (profiles.length > 0) {
          console.log(`Found ${profiles.length} profiles in ${otherSchool}`);
          break;
        }
      }
    }

    // Use Gemini to analyze and rank profiles based on query/criteria
    const { tryCallGemini } = await import('./love-print-helpers.tsx');
    
    const profilesSummary = profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      major: p.major,
      year: p.year,
      interests: p.interests || [],
      lookingFor: p.lookingFor || [],
      goals: p.goals || {},
      bio: p.bio || '',
      socialConnections: p.socialConnections || {},
      bondPrint: p.bondPrint || null,
    })).slice(0, 20); // Limit to 20 for AI analysis

    // Include LinkedIn and Bond Print data for better matching
    const linkedinInfo = userProfile.socialConnections?.linkedin ? `
- LinkedIn: Connected (has professional profile data)
` : '';

    const bondPrintInfo = userProfile.bondPrint?.professionalInsights ? `
- Professional Skills: ${userProfile.bondPrint.professionalInsights.skills?.join(', ') || 'None'}
- Career Orientation: ${userProfile.bondPrint.professionalInsights.careerOrientation || 'Not specified'}
` : '';

    const prompt = `You are Link, an intelligent AI assistant helping a college student find meaningful connections. You excel at creative matching and understanding deeper needs.

User Request: "${query || JSON.stringify(criteria)}"
User Profile:
- Name: ${userProfile.name}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Interests: ${userProfile.interests?.join(', ') || 'None'}
- Looking For: ${userProfile.lookingFor?.join(', ') || 'None'}
- Goals: ${JSON.stringify(userProfile.goals || {})}
- Bio: ${userProfile.bio || 'None'}
${linkedinInfo}${bondPrintInfo}

Available Profiles (${profilesSummary.length}):
${profilesSummary.map((p: any, i: number) => {
  const pLinkedIn = p.socialConnections?.linkedin ? ' [Has LinkedIn]' : '';
  const pSkills = p.bondPrint?.professionalInsights?.skills ? `\n     Skills: ${p.bondPrint.professionalInsights.skills.join(', ')}` : '';
  const pPersonality = p.personality?.length ? `\n     Personality: ${p.personality.join(', ')}` : '';
  return `${i + 1}. ${p.name} (${p.major}, ${p.year})${pLinkedIn}
     Interests: ${p.interests.join(', ') || 'None'}
     Looking For: ${p.lookingFor.join(', ') || 'None'}
     Goals: ${JSON.stringify(p.goals)}
     Bio: ${p.bio || 'No bio'}${pSkills}${pPersonality}`;
}).join('\n\n')}

CRITICAL: Analyze the user's request creatively and match intelligently:

1. **Understand Intent**: 
   - "likes concerts" → match music/events/entertainment interests, social people, event organizers
   - "co-founder" → match on skills, major, goals, LinkedIn, professional orientation
   - "study partner" → match major, year, academic goals, study habits
   - "roommate" → match living habits, personality, cleanliness, sleep schedule

2. **Creative Matching**:
   - Don't just match exact keywords - think about related interests and compatible traits
   - Consider complementary matches (e.g., different but compatible personalities)
   - Look for shared goals, values, and lifestyle preferences

3. **Context Matters**:
   - Consider the user's profile when matching (their major, year, interests)
   - Match people who complement or share their interests/goals
   - For professional connections, prioritize LinkedIn presence and skills

4. **Quality over Quantity**: 
   - Only return profiles that are genuinely good matches
   - Better to return 2-3 great matches than 5 mediocre ones
   - If no good matches, return empty array

Return ONLY a JSON array of profile IDs in order of best match (most relevant first):
["profile-id-1", "profile-id-2", "profile-id-3"]

If no genuinely good matches exist, return an empty array: []`;

    const geminiResponse = await tryCallGemini(prompt);
    
    let matchedProfileIds: string[] = [];
    if (geminiResponse) {
      try {
        const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          matchedProfileIds = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('[SEARCH] Failed to parse Gemini search response');
      }
    }

    // Get full profiles for matched IDs
    let matchedProfiles = matchedProfileIds
      .map((id: string) => profiles.find((p: any) => p.id === id))
      .filter(Boolean)
      .slice(0, 5);
    
    // If Gemini didn't return matches but we have profiles, do a simple keyword match
    if (matchedProfiles.length === 0 && profiles.length > 0) {
      console.log('[SEARCH] Gemini returned no matches, doing keyword search...');
      const lowerQuery = (query || '').toLowerCase();
      
      // Simple keyword matching
      matchedProfiles = profiles
        .filter((p: any) => {
          const major = (p.major || '').toLowerCase();
          const bio = (p.bio || '').toLowerCase();
          const interests = (p.interests || []).join(' ').toLowerCase();
          
          return major.includes(lowerQuery) || 
                 bio.includes(lowerQuery) || 
                 interests.includes(lowerQuery) ||
                 lowerQuery.includes(major) ||
                 (lowerQuery.includes('compsci') && (major.includes('computer') || major.includes('cs'))) ||
                 (lowerQuery.includes('cs') && (major.includes('computer') || major.includes('cs')));
        })
        .slice(0, 5);
    }
    
    // If still no matches, return first few profiles as fallback
    if (matchedProfiles.length === 0 && profiles.length > 0) {
      console.log('[SEARCH] No keyword matches, returning first few profiles...');
      matchedProfiles = profiles.slice(0, 3);
    }

    console.log(`[SEARCH] Returning ${matchedProfiles.length} matches`);
    
    // Store search results in AI chat history
    const aiChatId = `ai-assistant:${userId}`;
    let aiChat = await kv.get(aiChatId);
    if (!aiChat) {
      aiChat = {
        chatId: aiChatId,
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
    }
    
    // Add a message about the search results
    if (matchedProfiles.length > 0) {
      const suggestionMsg = {
        id: `${aiChatId}:search:${Date.now()}`,
        senderId: 'ai-assistant',
        content: `I found ${matchedProfiles.length} person${matchedProfiles.length > 1 ? 's' : ''} that might be a great match! Check them out below.`,
        timestamp: new Date().toISOString(),
        type: 'ai',
        metadata: { 
          type: 'profile-suggestions',
          profiles: matchedProfiles.map((p: any) => ({
            id: p.id,
            name: p.name,
            major: p.major,
            year: p.year,
            bio: p.bio,
            profilePicture: p.profilePicture,
            interests: p.interests,
            lookingFor: p.lookingFor,
            goals: p.goals,
          }))
        },
      };
      aiChat.messages.push(suggestionMsg);
      await kv.set(aiChatId, aiChat);
    }
    
    return c.json({
      matches: matchedProfiles,
      count: matchedProfiles.length,
    });
  } catch (error: any) {
    console.error('AI search error:', error);
    return c.json({ error: error.message || 'Failed to search profiles' }, 500);
  }
});

// AI Soft Intro Request - AI handles soft intro with confirmation
app.post("/ai-assistant/soft-intro", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { targetUserId, reason, context } = await c.req.json();
    
    if (!targetUserId || !reason) {
      return c.json({ error: 'targetUserId and reason are required' }, 400);
    }

    // Get both user profiles
    const userProfile = await kv.get(`user:${userId}`);
    const targetProfile = await kv.get(`user:${targetUserId}`);
    
    if (!userProfile || !targetProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Create AI message to target user explaining the situation
    const { tryCallGemini } = await import('./love-print-helpers.tsx');
    
    // Build comprehensive context about what the user is looking for
    const userLookingFor = userProfile.lookingFor?.join(', ') || 'connections';
    const userGoals = userProfile.goals ? JSON.stringify(userProfile.goals) : 'None';
    const userInterests = userProfile.interests?.join(', ') || 'None';
    const userBio = userProfile.bio || 'None';
    
    // Include LinkedIn and professional insights if available
    const userLinkedIn = userProfile.socialConnections?.linkedin ? ' [Has LinkedIn profile]' : '';
    const userSkills = userProfile.bondPrint?.professionalInsights?.skills ? `\n- Skills: ${userProfile.bondPrint.professionalInsights.skills.join(', ')}` : '';
    const targetLinkedIn = targetProfile.socialConnections?.linkedin ? ' [Has LinkedIn profile]' : '';
    const targetSkills = targetProfile.bondPrint?.professionalInsights?.skills ? `\n- Skills: ${targetProfile.bondPrint.professionalInsights.skills.join(', ')}` : '';
    
    const introPrompt = `You are Link, an AI assistant for Bonded. Create a friendly, personalized message to introduce two college students.

FROM USER:
- Name: ${userProfile.name}
- Major: ${userProfile.major}
- Year: ${userProfile.year}${userLinkedIn}${userSkills}
- Looking For: ${userLookingFor}
- Interests: ${userInterests}
- Goals: ${userGoals}
- Bio: ${userBio}

TO USER:
- Name: ${targetProfile.name}
- Major: ${targetProfile.major}
- Year: ${targetProfile.year}${targetLinkedIn}${targetSkills}
- Looking For: ${targetProfile.lookingFor?.join(', ') || 'connections'}
- Interests: ${targetProfile.interests?.join(', ') || 'None'}

REASON FOR CONNECTION:
${reason}

ADDITIONAL CONTEXT FROM USER'S MESSAGE:
${context || 'None'}

Create a warm, friendly message (3-4 sentences) that:
1. Introduces ${userProfile.name} naturally (mention their major/year if relevant)
2. Explains SPECIFICALLY what they're looking for based on the reason and context (e.g., "a co-founder for their startup idea", "a study partner for CS classes", "someone to collaborate on projects with")
3. Explains WHY ${targetProfile.name} would be a great match (mention shared interests, major, goals, professional skills, or what they're looking for)
4. Asks if they'd like to be introduced

Be specific and contextual - don't just say "they're looking for ${reason}". Instead, explain what that means in a natural way. For example:
- If reason mentions "co-founder", explain what kind of project/startup and mention relevant skills/experience
- If reason mentions "study partner", mention relevant classes or subjects
- If reason mentions "friend", mention shared interests or activities
- If both have LinkedIn, mention their professional presence as a plus for career-oriented connections

Return ONLY the message text, no quotes or markdown.`;

    const introMessage = await tryCallGemini(introPrompt) || 
      `Hi ${targetProfile.name}! ${userProfile.name} (${userProfile.major}) thinks you'd be a great connection. They're looking for ${reason}. Would you like me to introduce you?`;

    // Store the soft intro request (pending confirmation)
    const introRequest = {
      id: `soft-intro:${userId}:${targetUserId}:${Date.now()}`,
      fromUserId: userId,
      toUserId: targetUserId,
      reason,
      context,
      aiMessage: introMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`soft-intro:${introRequest.id}`, introRequest);
    
    // Add to target user's incoming intros
    const targetIntros = await kv.get(`user:${targetUserId}:soft-intros-incoming`) || [];
    targetIntros.push(introRequest.id);
    await kv.set(`user:${targetUserId}:soft-intros-incoming`, targetIntros);

    // Create a chat message from AI to target user
    const aiChatId = `ai-assistant:${targetUserId}`;
    let aiChat = await kv.get(aiChatId);
    if (!aiChat) {
      aiChat = {
        chatId: aiChatId,
        userId: targetUserId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
    }

    const aiNotificationMessage = {
      id: `${aiChatId}:${Date.now()}`,
      senderId: 'ai-assistant',
      content: introMessage,
      timestamp: new Date().toISOString(),
      type: 'ai',
        metadata: {
          type: 'soft-intro-request',
          introRequestId: introRequest.id,
          fromUserId: userId,
          fromUserName: userProfile.name,
          fromUserPhoto: userProfile.profilePicture || userProfile.photos?.[0],
          fromUserMajor: userProfile.major,
          fromUserYear: userProfile.year,
        },
    };
    aiChat.messages.push(aiNotificationMessage);
    await kv.set(aiChatId, aiChat);

    return c.json({
      success: true,
      introRequestId: introRequest.id,
      message: introMessage,
    });
  } catch (error: any) {
    console.error('AI soft intro error:', error);
    return c.json({ error: error.message || 'Failed to create soft intro' }, 500);
  }
});

// AI Soft Intro Response - Handle target user's response
app.post("/ai-assistant/soft-intro/respond", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { introRequestId, accepted } = await c.req.json();
    
    if (!introRequestId || typeof accepted !== 'boolean') {
      return c.json({ error: 'introRequestId and accepted are required' }, 400);
    }

    // Get intro request
    const introRequest = await kv.get(`soft-intro:${introRequestId}`);
    if (!introRequest || introRequest.toUserId !== userId) {
      return c.json({ error: 'Intro request not found or unauthorized' }, 404);
    }

    if (introRequest.status !== 'pending') {
      return c.json({ error: 'Intro request already processed' }, 400);
    }

    // Update status
    introRequest.status = accepted ? 'accepted' : 'declined';
    introRequest.respondedAt = new Date().toISOString();
    await kv.set(`soft-intro:${introRequestId}`, introRequest);

    if (accepted) {
      // Create connection between users
      const connection = {
        id: `connection:${introRequest.fromUserId}:${introRequest.toUserId}`,
        userId1: introRequest.fromUserId,
        userId2: introRequest.toUserId,
        status: 'connected',
        createdAt: new Date().toISOString(),
        source: 'ai-soft-intro',
      };
      await kv.set(`connection:${connection.id}`, connection);

      // Add to both users' connections
      const user1Connections = await kv.get(`user:${introRequest.fromUserId}:connections`) || [];
      if (!user1Connections.includes(introRequest.toUserId)) {
        user1Connections.push(introRequest.toUserId);
        await kv.set(`user:${introRequest.fromUserId}:connections`, user1Connections);
      }

      const user2Connections = await kv.get(`user:${userId}:connections`) || [];
      if (!user2Connections.includes(introRequest.fromUserId)) {
        user2Connections.push(introRequest.fromUserId);
        await kv.set(`user:${userId}:connections`, user2Connections);
      }

      // Create chat between them
      const chatId = [introRequest.fromUserId, userId].sort().join(':');
      const existingChat = await kv.get(`chat:${chatId}`);
      if (!existingChat) {
        const chat = {
          chatId,
          participants: [introRequest.fromUserId, userId],
          createdAt: new Date().toISOString(),
        };
        await kv.set(`chat:${chatId}`, chat);

        // Add to both users' chat lists
        const user1Chats = await kv.get(`user:${introRequest.fromUserId}:chats`) || [];
        if (!user1Chats.includes(chatId)) {
          user1Chats.push(chatId);
          await kv.set(`user:${introRequest.fromUserId}:chats`, user1Chats);
        }

        const user2Chats = await kv.get(`user:${userId}:chats`) || [];
        if (!user2Chats.includes(chatId)) {
          user2Chats.push(chatId);
          await kv.set(`user:${userId}:chats`, user2Chats);
        }

        // Send welcome message from AI
        const welcomeMessage = {
          id: `${chatId}:${Date.now()}`,
          senderId: 'ai-assistant',
          content: `Hi! I've connected you both. ${introRequest.reason}. Feel free to start chatting!`,
          timestamp: new Date().toISOString(),
          type: 'system',
        };
        const messages = [welcomeMessage];
        await kv.set(`chat:${chatId}:messages`, messages);
      }

      // Notify the requester
      const requesterProfile = await kv.get(`user:${introRequest.fromUserId}`);
      const aiChatId = `ai-assistant:${introRequest.fromUserId}`;
      let requesterAiChat = await kv.get(aiChatId);
      if (!requesterAiChat) {
        requesterAiChat = {
          chatId: aiChatId,
          userId: introRequest.fromUserId,
          messages: [],
          createdAt: new Date().toISOString(),
        };
      }

      // Get target profile for notification
      const targetProfile = await kv.get(`user:${userId}`);
      
      const notificationMessage = {
        id: `${aiChatId}:${Date.now()}`,
        senderId: 'ai-assistant',
        content: `Great news! ${targetProfile?.name || 'They'} accepted your soft intro request. You're now connected and can start chatting!`,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };
      requesterAiChat.messages.push(notificationMessage);
      await kv.set(aiChatId, requesterAiChat);
    }

    return c.json({
      success: true,
      accepted,
      chatId: accepted ? [introRequest.fromUserId, userId].sort().join(':') : null,
    });
  } catch (error: any) {
    console.error('AI soft intro response error:', error);
    return c.json({ error: error.message || 'Failed to process response' }, 500);
  }
});

// Get AI Assistant Chat
app.get("/ai-assistant/chat", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const aiChatId = `ai-assistant:${userId}`;
    const aiChat = await kv.get(aiChatId);

    if (!aiChat) {
      return c.json({ messages: [], chatId: aiChatId });
    }

    return c.json(aiChat);
  } catch (error: any) {
    console.error('Get AI chat error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// LOVE MODE - ANONYMOUS DATING SYSTEM
// ============================================

// Check if user has activated Love Mode
app.get("/love-mode/activation-status", async (c) => {
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
app.post("/love-mode/activate", async (c) => {
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
app.post("/love-mode/deactivate", async (c) => {
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
app.post("/love-mode/love-print", async (c) => {
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
app.get("/love-mode/daily-question", async (c) => {
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
app.post("/love-mode/daily-question/answer", async (c) => {
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
app.get("/love-mode/stats", async (c) => {
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
app.get("/love-mode/discover", async (c) => {
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
app.post("/love-mode/rate", async (c) => {
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
app.post("/love-mode/run-matching-algorithm", async (c) => {
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
app.get("/love-mode/potential-matches", async (c) => {
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
app.get("/love-mode/relationships", async (c) => {
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
app.get("/love-mode/messages/:relationshipId", async (c) => {
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
app.post("/love-mode/send-message", async (c) => {
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
    let linkCoaching: string | null = null;

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
app.post("/love-mode/request-reveal", async (c) => {
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

// Report user endpoint
app.post("/user/:userId/report", async (c) => {
  try {
    const reporterId = await getUserId(c.req.header('Authorization'));
    if (!reporterId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reportedUserId = c.req.param('userId');
    const body = await c.req.json();
    const { reason, details } = body;

    if (!reason) {
      return c.json({ error: 'Reason is required' }, 400);
    }

    // Store report
    const reportId = `report:${Date.now()}:${reporterId}`;
    const report = {
      id: reportId,
      reporterId,
      reportedUserId,
      reason,
      details: details || '',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Store in reports list
    const reports = await kv.get('reports:all') || [];
    reports.push(report);
    await kv.set('reports:all', reports);

    // Also store individual report
    await kv.set(reportId, report);

    return c.json({ success: true, message: 'Report submitted. We will review it shortly.' });
  } catch (error: any) {
    console.error('Report user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Block user endpoint
app.post("/user/:userId/block", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const blockedUserId = c.req.param('userId');

    if (userId === blockedUserId) {
      return c.json({ error: 'Cannot block yourself' }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Add to blocked users list
    const blockedUsers = userProfile.blockedUsers || [];
    if (!blockedUsers.includes(blockedUserId)) {
      blockedUsers.push(blockedUserId);
      userProfile.blockedUsers = blockedUsers;
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'User blocked successfully' });
  } catch (error: any) {
    console.error('Block user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Unblock user endpoint
app.post("/user/:userId/unblock", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const unblockedUserId = c.req.param('userId');

    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Remove from blocked users list
    const blockedUsers = (userProfile.blockedUsers || []).filter((id: string) => id !== unblockedUserId);
    userProfile.blockedUsers = blockedUsers;
    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, message: 'User unblocked successfully' });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// FORUM ENDPOINTS
// ============================================

// Get all forum posts
app.get("/forum/posts", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get forum posts error:', error);
      return c.json({ error: 'Failed to load posts' }, 500);
    }

    // Transform posts to include user like/dislike status
    const transformedPosts = await Promise.all((posts || []).map(async (post: any) => {
      // Get user's like/dislike status
      const { data: userLike } = await supabase
        .from('forum_post_likes')
        .select('is_like')
        .eq('post_id', post.id)
        .eq('user_id', userId)
        .single();

      // Get author info (only if not anonymous)
      let authorName = 'Anonymous Student';
      let authorAvatar = null;
      if (!post.is_anonymous) {
        const authorProfile = await kv.get(`user:${post.author_id}`);
        if (authorProfile) {
          authorName = authorProfile.name || 'Student';
          authorAvatar = authorProfile.profilePicture || authorProfile.photos?.[0];
        }
      }

      return {
        id: post.id,
        content: post.content,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        authorId: post.author_id,
        authorName,
        authorAvatar,
        likes: post.likes_count || 0,
        dislikes: post.dislikes_count || 0,
        comments: post.comments_count || 0,
        userLiked: userLike?.is_like === true,
        userDisliked: userLike?.is_like === false,
        createdAt: post.created_at,
        isAnonymous: post.is_anonymous,
        canDelete: post.author_id === userId, // Include permission check
      };
    }));

    return c.json({ posts: transformedPosts });
  } catch (error: any) {
    console.error('Get forum posts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Upload forum media (images/videos)
app.post("/forum/upload-media", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file size
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB images, 50MB videos
    if (file.size > maxSize) {
      return c.json({ error: `File too large. Max size: ${type === 'image' ? '10MB' : '50MB'}` }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
    const filePath = `forum/${userId}/${timestamp}.${fileExt}`;

    // Convert file to binary
    const arrayBuffer = await file.arrayBuffer();
    const binaryData = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage (use forum bucket)
    const forumBucketName = 'make-2516be19-forum-media';
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === forumBucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(forumBucketName, {
        public: true, // Forum media should be public
        fileSizeLimit: 52428800, // 50MB
      });
    }

    const { data, error } = await supabase.storage
      .from(forumBucketName)
      .upload(filePath, binaryData, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ error: error.message }, 500);
    }

    // Get public URL (since bucket is public)
    const { data: urlData } = await supabase.storage
      .from(forumBucketName)
      .getPublicUrl(filePath);

    return c.json({ 
      url: urlData.publicUrl,
      path: filePath
    });
  } catch (error: any) {
    console.error('Forum media upload error:', error);
    return c.json({ error: error.message || 'Upload failed' }, 500);
  }
});

// Create a forum post
app.post("/forum/posts", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { content, mediaUrl, mediaType, isAnonymous = true } = body;

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Post content is required' }, 400);
    }

    // Moderate content
    const moderationResult = await moderateMessage(content);
    if (moderationResult.isBlocked) {
      return c.json({ 
        error: 'Post blocked', 
        reason: moderationResult.reason 
      }, 400);
    }

    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        author_id: userId,
        content: content.trim(),
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        is_anonymous: isAnonymous,
      })
      .select()
      .single();

    if (error) {
      console.error('Create forum post error:', error);
      return c.json({ error: 'Failed to create post' }, 500);
    }

    return c.json({ 
      success: true, 
      post: {
        id: post.id,
        content: post.content,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        authorId: post.author_id,
        authorName: isAnonymous ? 'Anonymous Student' : null,
        likes: 0,
        dislikes: 0,
        comments: 0,
        userLiked: false,
        userDisliked: false,
        createdAt: post.created_at,
        isAnonymous: post.is_anonymous,
      }
    });
  } catch (error: any) {
    console.error('Create forum post error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Like a forum post
app.post("/forum/posts/:postId/like", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');

    // Check if user already liked/disliked
    const { data: existing } = await supabase
      .from('forum_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.is_like) {
        // Already liked, remove like
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        // Was disliked, change to like
        await supabase
          .from('forum_post_likes')
          .update({ is_like: true })
          .eq('post_id', postId)
          .eq('user_id', userId);
      }
    } else {
      // New like
      await supabase
        .from('forum_post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
          is_like: true,
        });
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Like forum post error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Dislike a forum post
app.post("/forum/posts/:postId/dislike", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');

    // Check if user already liked/disliked
    const { data: existing } = await supabase
      .from('forum_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (!existing.is_like) {
        // Already disliked, remove dislike
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        // Was liked, change to dislike
        await supabase
          .from('forum_post_likes')
          .update({ is_like: false })
          .eq('post_id', postId)
          .eq('user_id', userId);
      }
    } else {
      // New dislike
      await supabase
        .from('forum_post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
          is_like: false,
        });
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Dislike forum post error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get comments for a post
app.get("/forum/posts/:postId/comments", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');

    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get comments error:', error);
      return c.json({ error: 'Failed to load comments' }, 500);
    }

    // Transform comments
    const transformedComments = await Promise.all((comments || []).map(async (comment: any) => {
      let authorName = 'Anonymous Student';
      let authorAvatar = null;
      if (!comment.is_anonymous) {
        const authorProfile = await kv.get(`user:${comment.author_id}`);
        if (authorProfile) {
          authorName = authorProfile.name || 'Student';
          authorAvatar = authorProfile.profilePicture || authorProfile.photos?.[0];
        }
      }

      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.author_id,
        authorName,
        authorAvatar,
        createdAt: comment.created_at,
        isAnonymous: comment.is_anonymous,
        canDelete: comment.author_id === userId, // Include permission check
      };
    }));

    return c.json({ comments: transformedComments });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add a comment to a post
app.post("/forum/posts/:postId/comments", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const body = await c.req.json();
    const { content, isAnonymous = true } = body;

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Comment content is required' }, 400);
    }

    // Moderate content
    const moderationResult = await moderateMessage(content);
    if (moderationResult.isBlocked) {
      return c.json({ 
        error: 'Comment blocked', 
        reason: moderationResult.reason 
      }, 400);
    }

    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        author_id: userId,
        content: content.trim(),
        is_anonymous: isAnonymous,
      })
      .select()
      .single();

    if (error) {
      console.error('Create comment error:', error);
      return c.json({ error: 'Failed to create comment' }, 500);
    }

    return c.json({ success: true, comment });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete a forum post (only by author)
app.delete("/forum/posts/:postId", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');

    // Check if post exists and user is the author
    const { data: post, error: fetchError } = await supabase
      .from('forum_posts')
      .select('author_id, media_url')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.author_id !== userId) {
      return c.json({ error: 'Unauthorized: Only the author can delete this post' }, 403);
    }

    // Delete associated likes
    await supabase
      .from('forum_post_likes')
      .delete()
      .eq('post_id', postId);

    // Delete associated comments
    await supabase
      .from('forum_comments')
      .delete()
      .eq('post_id', postId);

    // Delete media from storage if exists
    if (post.media_url) {
      try {
        const forumBucketName = 'make-2516be19-forum-media';
        // Extract path from URL
        const urlParts = post.media_url.split('/');
        const pathIndex = urlParts.findIndex(part => part === forumBucketName);
        if (pathIndex !== -1) {
          const filePath = urlParts.slice(pathIndex + 1).join('/');
          await supabase.storage
            .from(forumBucketName)
            .remove([filePath]);
        }
      } catch (storageError) {
        console.error('Error deleting media:', storageError);
        // Continue with post deletion even if media deletion fails
      }
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Delete post error:', deleteError);
      return c.json({ error: 'Failed to delete post' }, 500);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete a comment (only by author)
app.delete("/forum/posts/:postId/comments/:commentId", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = c.req.param('commentId');

    // Check if comment exists and user is the author
    const { data: comment, error: fetchError } = await supabase
      .from('forum_comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    if (comment.author_id !== userId) {
      return c.json({ error: 'Unauthorized: Only the author can delete this comment' }, 403);
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from('forum_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Delete comment error:', deleteError);
      return c.json({ error: 'Failed to delete comment' }, 500);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Share a post to a friend via messages
app.post("/forum/posts/:postId/share", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const body = await c.req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return c.json({ error: 'targetUserId is required' }, 400);
    }

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Get author info if not anonymous
    let authorName = 'Anonymous Student';
    if (!post.is_anonymous) {
      const authorProfile = await kv.get(`user:${post.author_id}`);
      if (authorProfile) {
        authorName = authorProfile.name || 'Student';
      }
    }

    // Create or get chat between users
    const chatId = userId < targetUserId 
      ? `chat:${userId}:${targetUserId}`
      : `chat:${targetUserId}:${userId}`;

    let chat = await kv.get(chatId);
    if (!chat) {
      chat = {
        chatId,
        userId1: userId < targetUserId ? userId : targetUserId,
        userId2: userId < targetUserId ? targetUserId : userId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      await kv.set(chatId, chat);
    }

    // Create share message
    const shareMessage = {
      id: `${chatId}:${Date.now()}`,
      senderId: userId,
      content: `Check out this post from The Quad${post.mediaUrl ? ' (with media)' : ''}: "${post.content?.substring(0, 100)}${post.content && post.content.length > 100 ? '...' : ''}"`,
      timestamp: new Date().toISOString(),
      type: 'text',
      metadata: {
        type: 'forum-post-share',
        postId: post.id,
        postContent: post.content,
        postMediaUrl: post.media_url,
        postMediaType: post.media_type,
        authorName: authorName,
        isAnonymous: post.is_anonymous,
      },
    };

    chat.messages.push(shareMessage);
    await kv.set(chatId, chat);

    return c.json({ success: true, message: 'Post shared successfully' });
  } catch (error: any) {
    console.error('Share post error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// SOCIAL MEDIA CONNECTION ENDPOINTS
// ============================================

// LinkedIn OAuth - Initiate connection
app.post("/social/linkedin/connect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/auth/linkedin/callback`;
    const state = `${userId}:${Date.now()}`;
    
    // Store state for verification
    await kv.set(`oauth:linkedin:${userId}`, { state, timestamp: Date.now() });

    // Use OpenID Connect scopes + additional permissions for profile details
    // openid profile email for basic info, w_member_social for profile details
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid%20profile%20email%20w_member_social`;

    return c.json({ authUrl });
  } catch (error: any) {
    console.error('LinkedIn connect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// LinkedIn OAuth - Handle callback
app.post("/social/linkedin/callback", async (c) => {
  try {
    const body = await c.req.json();
    const { code, state } = body;

    if (!code || !state) {
      return c.json({ error: 'Missing code or state' }, 400);
    }

    const [userId] = state.split(':');
    const storedState = await kv.get(`oauth:linkedin:${userId}`);
    
    if (!storedState || storedState.state !== state) {
      return c.json({ error: 'Invalid state' }, 400);
    }

    // Exchange code for access token
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/auth/linkedin/callback`;

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
    });

    if (!tokenResponse.ok) {
      return c.json({ error: 'Failed to get access token' }, 400);
    }

    const { access_token } = await tokenResponse.json();

    // Get LinkedIn profile data
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (!profileResponse.ok) {
      return c.json({ error: 'Failed to get LinkedIn profile' }, 400);
    }

    const linkedinProfile = await profileResponse.json();

    // Fetch additional LinkedIn data (skills, experience, education)
    let linkedinData: any = {
      name: linkedinProfile.name,
      email: linkedinProfile.email,
      picture: linkedinProfile.picture,
      given_name: linkedinProfile.given_name,
      family_name: linkedinProfile.family_name,
      locale: linkedinProfile.locale,
    };

    // Try to fetch profile with more details (requires additional permissions)
    try {
      // Get user's profile with skills and experience
      const profileDetailsResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
        headers: { 'Authorization': `Bearer ${access_token}` },
      });
      
      if (profileDetailsResponse.ok) {
        const profileDetails = await profileDetailsResponse.json();
        linkedinData.profileDetails = profileDetails;
      }
    } catch (e) {
      console.log('Could not fetch additional LinkedIn profile details');
    }

    // Update user profile with LinkedIn connection
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.socialConnections = userProfile.socialConnections || {};
      userProfile.socialConnections.linkedin = {
        connected: true,
        username: linkedinProfile.sub || linkedinProfile.preferred_username,
        profileUrl: `https://www.linkedin.com/in/${linkedinProfile.sub}`,
        accessToken: access_token, // In production, encrypt this
        scrapedData: linkedinData,
      };

      // Enhance Bond Print with LinkedIn data if it exists
      if (userProfile.bondPrint) {
        const enhancedBondPrint = await enhanceBondPrintWithLinkedIn(userProfile, linkedinData);
        if (enhancedBondPrint) {
          userProfile.bondPrint = enhancedBondPrint;
        }
      }

      // Also update profile fields if missing (name, bio hints from LinkedIn)
      if (!userProfile.name && linkedinData.name) {
        userProfile.name = linkedinData.name;
      }
      if (!userProfile.bio && linkedinData.profileDetails) {
        // Could extract headline or summary from LinkedIn if available
      }

      await kv.set(`user:${userId}`, userProfile);
    }

    // Clean up state
    await kv.delete(`oauth:linkedin:${userId}`);

    return c.json({ success: true, message: 'LinkedIn connected successfully', bondPrintUpdated: !!userProfile?.bondPrint });
  } catch (error: any) {
    console.error('LinkedIn callback error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// LinkedIn - Disconnect
app.post("/social/linkedin/disconnect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile && userProfile.socialConnections) {
      delete userProfile.socialConnections.linkedin;
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'LinkedIn disconnected' });
  } catch (error: any) {
    console.error('LinkedIn disconnect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Instagram OAuth - DISABLED (requires business verification)
// Uncomment when Instagram business verification is complete
/*
// Instagram OAuth - Initiate connection
app.post("/social/instagram/connect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/auth/instagram/callback`;
    const state = `${userId}:${Date.now()}`;
    
    await kv.set(`oauth:instagram:${userId}`, { state, timestamp: Date.now() });

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;

    return c.json({ authUrl });
  } catch (error: any) {
    console.error('Instagram connect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Instagram OAuth - Handle callback
app.post("/social/instagram/callback", async (c) => {
  try {
    const body = await c.req.json();
    const { code, state } = body;

    if (!code || !state) {
      return c.json({ error: 'Missing code or state' }, 400);
    }

    const [userId] = state.split(':');
    const storedState = await kv.get(`oauth:instagram:${userId}`);
    
    if (!storedState || storedState.state !== state) {
      return c.json({ error: 'Invalid state' }, 400);
    }

    // Exchange code for access token
    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/auth/instagram/callback`;

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      return c.json({ error: 'Failed to get access token' }, 400);
    }

    const { access_token, user_id } = await tokenResponse.json();

    // Get Instagram profile data
    const profileResponse = await fetch(`https://graph.instagram.com/${user_id}?fields=id,username,account_type&access_token=${access_token}`);
    
    if (!profileResponse.ok) {
      return c.json({ error: 'Failed to get Instagram profile' }, 400);
    }

    const instagramProfile = await profileResponse.json();

    // Update user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.socialConnections = userProfile.socialConnections || {};
      userProfile.socialConnections.instagram = {
        connected: true,
        username: instagramProfile.username,
        profileUrl: `https://instagram.com/${instagramProfile.username}`,
        accessToken: access_token, // In production, encrypt this
        scrapedData: {
          userId: instagramProfile.id,
          accountType: instagramProfile.account_type,
        },
      };
      await kv.set(`user:${userId}`, userProfile);
    }

    await kv.delete(`oauth:instagram:${userId}`);

    return c.json({ success: true, message: 'Instagram connected successfully' });
  } catch (error: any) {
    console.error('Instagram callback error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Instagram - Disconnect
app.post("/social/instagram/disconnect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile && userProfile.socialConnections) {
      delete userProfile.socialConnections.instagram;
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'Instagram disconnected' });
  } catch (error: any) {
    console.error('Instagram disconnect error:', error);
    return c.json({ error: error.message }, 500);
  }
});
*/

// Spotify OAuth - Initiate connection
app.post("/social/spotify/connect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/auth/spotify/callback`;
    const state = `${userId}:${Date.now()}`;
    const scopes = 'user-read-private user-read-email user-top-read user-read-recently-played';
    
    await kv.set(`oauth:spotify:${userId}`, { state, timestamp: Date.now() });

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

    return c.json({ authUrl });
  } catch (error: any) {
    console.error('Spotify connect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Spotify OAuth - Handle callback
app.post("/social/spotify/callback", async (c) => {
  try {
    const body = await c.req.json();
    const { code, state } = body;

    if (!code || !state) {
      return c.json({ error: 'Missing code or state' }, 400);
    }

    const [userId] = state.split(':');
    const storedState = await kv.get(`oauth:spotify:${userId}`);
    
    if (!storedState || storedState.state !== state) {
      return c.json({ error: 'Invalid state' }, 400);
    }

    // Exchange code for access token
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/auth/spotify/callback`;

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return c.json({ error: 'Failed to get access token' }, 400);
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    // Get Spotify profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (!profileResponse.ok) {
      return c.json({ error: 'Failed to get Spotify profile' }, 400);
    }

    const spotifyProfile = await profileResponse.json();

    // Get top artists and tracks
    const [topArtistsRes, topTracksRes] = await Promise.all([
      fetch('https://api.spotify.com/v1/me/top/artists?limit=5', {
        headers: { 'Authorization': `Bearer ${access_token}` },
      }),
      fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', {
        headers: { 'Authorization': `Bearer ${access_token}` },
      }),
    ]);

    const topArtists = topArtistsRes.ok ? await topArtistsRes.json() : { items: [] };
    const topTracks = topTracksRes.ok ? await topTracksRes.json() : { items: [] };

    // Update user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.socialConnections = userProfile.socialConnections || {};
      userProfile.socialConnections.spotify = {
        connected: true,
        username: spotifyProfile.display_name || spotifyProfile.id,
        profileUrl: spotifyProfile.external_urls?.spotify,
        accessToken: access_token, // In production, encrypt this
        refreshToken: refresh_token, // In production, encrypt this
        topArtists: topArtists.items?.map((a: any) => ({
          name: a.name,
          image: a.images?.[0]?.url,
        })) || [],
        topTracks: topTracks.items?.map((t: any) => ({
          name: t.name,
          artist: t.artists?.[0]?.name,
          image: t.album?.images?.[0]?.url,
        })) || [],
      };
      await kv.set(`user:${userId}`, userProfile);
    }

    await kv.delete(`oauth:spotify:${userId}`);

    return c.json({ success: true, message: 'Spotify connected successfully' });
  } catch (error: any) {
    console.error('Spotify callback error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Spotify - Disconnect
app.post("/social/spotify/disconnect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile && userProfile.socialConnections) {
      delete userProfile.socialConnections.spotify;
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'Spotify disconnected' });
  } catch (error: any) {
    console.error('Spotify disconnect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Apple Music - DISABLED
// Uncomment when ready to implement Apple Music integration
/*
// Apple Music - Connect (requires MusicKit JS on frontend)
app.post("/social/appleMusic/connect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { userToken, musicUserToken } = body;

    if (!userToken) {
      return c.json({ error: 'User token is required' }, 400);
    }

    // Apple Music uses MusicKit JS on the frontend
    // The frontend should get the userToken and pass it here
    // We store it for future API calls

    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.socialConnections = userProfile.socialConnections || {};
      userProfile.socialConnections.appleMusic = {
        connected: true,
        userToken, // In production, encrypt this
        musicUserToken: musicUserToken || null,
      };
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'Apple Music connected successfully' });
  } catch (error: any) {
    console.error('Apple Music connect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Apple Music - Disconnect
app.post("/social/appleMusic/disconnect", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile && userProfile.socialConnections) {
      delete userProfile.socialConnections.appleMusic;
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ success: true, message: 'Apple Music disconnected' });
  } catch (error: any) {
    console.error('Apple Music disconnect error:', error);
    return c.json({ error: error.message }, 500);
  }
});
*/

// Get blocked users list
app.get("/user/blocked", async (c) => {
  try {
    const userId = await getUserId(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const blockedUserIds = userProfile.blockedUsers || [];
    
    // Get blocked user profiles
    const blockedProfiles = await Promise.all(
      blockedUserIds.map(async (id: string) => {
        const profile = await kv.get(`user:${id}`);
        return profile ? { id, name: profile.name, profilePicture: profile.profilePicture } : null;
      })
    );

    return c.json({ blockedUsers: blockedProfiles.filter(Boolean) });
  } catch (error: any) {
    console.error('Get blocked users error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Catch-all route for debugging unmatched routes (must be last)
app.all("*", (c) => {
  const path = c.req.path;
  const method = c.req.method;
  console.log(`[CATCH-ALL] ${method} ${path} - Route not found`);
  return c.json({ 
    error: 'Route not found', 
    path,
    method,
    message: `No handler found for ${method} ${path}`,
    availableRoutes: ['POST /signup', 'GET /health', 'GET /user-info', 'POST /profile', 'GET /profile/:userId']
  }, 404);
});

// Export handler for Supabase Edge Functions
Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    console.log(`[EDGE-FUNCTION] ${req.method} ${pathname}`);
    console.log(`[EDGE-FUNCTION] Full URL: ${req.url}`);
    
    // Supabase is NOT stripping the function name - it's passing the full path
    // So /make-server-2516be19/signup needs to become /signup
    console.log(`[EDGE-FUNCTION] Original pathname: ${pathname}`);
    
    // Strip the function name from the path
    let cleanPath = pathname;
    if (pathname.startsWith('/make-server-2516be19/')) {
      cleanPath = pathname.replace('/make-server-2516be19', '');
      console.log(`[EDGE-FUNCTION] Cleaned path: ${cleanPath}`);
    } else if (pathname.startsWith('/make-server-2516be19')) {
      // Handle case where path is exactly /make-server-2516be19
      cleanPath = '/';
      console.log(`[EDGE-FUNCTION] Cleaned path: ${cleanPath}`);
    } else if (pathname.startsWith('/functions/v1/make-server-2516be19/')) {
      cleanPath = pathname.replace('/functions/v1/make-server-2516be19', '');
      console.log(`[EDGE-FUNCTION] Cleaned path: ${cleanPath}`);
    } else if (pathname.startsWith('/functions/v1/make-server-2516be19')) {
      cleanPath = '/';
      console.log(`[EDGE-FUNCTION] Cleaned path: ${cleanPath}`);
    }
    
    // Always create a new request with the cleaned path
    // Preserve query parameters from the original URL
    const cleanUrl = new URL(cleanPath, url.origin);
    cleanUrl.search = url.search; // Preserve query parameters
    console.log(`[EDGE-FUNCTION] Cleaned URL with query: ${cleanUrl.pathname}${cleanUrl.search}`);
    
    const cleanReq = new Request(cleanUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    console.log(`[EDGE-FUNCTION] Forwarding to Hono with path: ${cleanPath}${cleanUrl.search}`);
    return await app.fetch(cleanReq);
  } catch (error: any) {
    console.error('[EDGE-FUNCTION] Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
