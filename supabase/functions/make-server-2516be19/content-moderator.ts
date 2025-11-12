/**
 * Content Moderation System
 * Filters inappropriate content from user messages, profiles, and bios
 */

// Comprehensive list of inappropriate keywords
// Note: This is a basic filter. For production, consider using a service like:
// - OpenAI Moderation API
// - Azure Content Moderator
// - Perspective API (Google)
const PROFANITY_LIST = [
  // Explicit profanity
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap', 'bastard', 'dick', 'cock',
  'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger', 'nigga',

  // Variations and creative spellings
  'f*ck', 'sh*t', 'b*tch', 'a$$', 'd*mn', 'fuk', 'fck', 'sht', 'btch',
  'azz', 'fuq', 'phuck', 'shyt',

  // Sexual content
  'porn', 'sex', 'nude', 'naked', 'hentai', 'xxx', 'nsfw', 'onlyfans',

  // Hate speech indicators
  'nazi', 'hitler', 'kkk', 'terrorist',

  // Drug references
  'cocaine', 'heroin', 'meth', 'weed', 'marijuana', 'drugs',

  // Harassment
  'kill yourself', 'kys', 'suicide', 'die',

  // Contact info harvesting attempts (to prevent spam)
  'venmo', 'cashapp', 'paypal',
];

// Words that might be suspicious in certain contexts
const SUSPICIOUS_PATTERNS = [
  // External contact attempts (to keep users on platform)
  /(?:add|follow|dm|message|text)\s+(?:me|my)?\s+(?:on|at|@)?\s+(?:insta|snap|twitter|discord|telegram|whatsapp)/i,
  /(^|\s)dm\s+me($|\s)/i,
  /(?:my|add)\s+(?:insta|snap|ig|sc)/i,

  // Phone numbers
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  /\b\d{10,11}\b/,

  // Email addresses (except .edu which is allowed)
  /\b[a-zA-Z0-9._%+-]+@(?!.*\.edu)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,

  // URLs (to prevent external redirects)
  /https?:\/\//i,
  /www\./i,

  // Scam indicators
  /(?:click|visit|check out|go to)\s+(?:this|my)\s+(?:link|website|page)/i,
  /(?:free|make)\s+(?:money|cash)/i,
];

interface ModerationResult {
  isClean: boolean;
  reason?: string;
  flaggedWords?: string[];
  severity: 'clean' | 'warning' | 'blocked';
}

/**
 * Check if text contains profanity or inappropriate content
 */
export function moderateText(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { isClean: true, severity: 'clean' };
  }

  const lowerText = text.toLowerCase();
  const flaggedWords: string[] = [];

  // Check for explicit profanity
  for (const word of PROFANITY_LIST) {
    // Use word boundaries to avoid false positives (e.g., "lass" containing "ass")
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
    if (regex.test(lowerText)) {
      flaggedWords.push(word);
    }
  }

  if (flaggedWords.length > 0) {
    return {
      isClean: false,
      reason: 'Inappropriate language detected',
      flaggedWords,
      severity: 'blocked',
    };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isClean: false,
        reason: 'Suspicious content detected',
        severity: 'warning',
      };
    }
  }

  return { isClean: true, severity: 'clean' };
}

/**
 * Sanitize text by replacing inappropriate words with asterisks
 * Useful for warnings rather than hard blocks
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, (match) => '*'.repeat(match.length));
  }

  return sanitized;
}

/**
 * Moderate profile content (bio, interests, etc.)
 * More lenient than message moderation
 */
export function moderateProfile(profile: {
  name?: string;
  bio?: string;
  interests?: string[];
  major?: string;
}): ModerationResult {
  const textsToCheck = [
    profile.name || '',
    profile.bio || '',
    profile.major || '',
    ...(profile.interests || []),
  ];

  for (const text of textsToCheck) {
    const result = moderateText(text);
    if (!result.isClean && result.severity === 'blocked') {
      return {
        ...result,
        reason: `Profile contains inappropriate content: ${result.reason}`,
      };
    }
  }

  return { isClean: true, severity: 'clean' };
}

/**
 * Moderate message content
 * Stricter than profile moderation
 */
export function moderateMessage(message: string): ModerationResult {
  return moderateText(message);
}

/**
 * Check if username is appropriate
 * Usernames have stricter rules
 */
export function moderateUsername(username: string): ModerationResult {
  if (!username || username.trim().length === 0) {
    return {
      isClean: false,
      reason: 'Username cannot be empty',
      severity: 'blocked',
    };
  }

  // Check length
  if (username.length < 2 || username.length > 30) {
    return {
      isClean: false,
      reason: 'Username must be between 2 and 30 characters',
      severity: 'blocked',
    };
  }

  // Check for profanity
  const profanityCheck = moderateText(username);
  if (!profanityCheck.isClean) {
    return {
      ...profanityCheck,
      reason: 'Username contains inappropriate content',
    };
  }

  // Check for special characters (allow letters, numbers, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isClean: false,
      reason: 'Username can only contain letters, numbers, underscores, and hyphens',
      severity: 'blocked',
    };
  }

  return { isClean: true, severity: 'clean' };
}

/**
 * Log moderation actions for review
 * In production, send to logging service
 */
export function logModerationAction(
  userId: string,
  action: 'message' | 'profile' | 'username',
  result: ModerationResult,
  content: string
) {
  if (!result.isClean) {
    console.warn('[MODERATION]', {
      userId,
      action,
      severity: result.severity,
      reason: result.reason,
      flaggedWords: result.flaggedWords,
      timestamp: new Date().toISOString(),
      // Don't log full content for privacy, just length
      contentLength: content.length,
    });
  }
}
