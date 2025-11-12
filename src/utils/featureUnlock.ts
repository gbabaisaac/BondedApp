/**
 * Progressive Feature Unlocking System
 * Features are unlocked based on profile completion and user actions
 */

export interface FeatureUnlock {
  feature: string;
  unlocked: boolean;
  requirement?: string;
  progress?: number;
}

export interface ProfileCompletion {
  percentage: number;
  hasBasicInfo: boolean;
  hasPhotos: boolean;
  hasBio: boolean;
  hasInterests: boolean;
  hasPersonality: boolean;
  hasBondPrint: boolean;
  hasSocialConnections: boolean;
}

/**
 * Calculate profile completion
 */
export function calculateProfileCompletion(userProfile: any): ProfileCompletion {
  let score = 0;
  const maxScore = 100;

  const hasBasicInfo = !!(userProfile?.name && userProfile?.school && userProfile?.major && userProfile?.year);
  const hasPhotos = !!(userProfile?.photos && userProfile.photos.length > 0);
  const hasBio = !!(userProfile?.bio && userProfile.bio.length >= 20);
  const hasInterests = !!(userProfile?.interests && userProfile.interests.length >= 3);
  const hasPersonality = !!(userProfile?.personality && userProfile.personality.length >= 3);
  const hasBondPrint = !!userProfile?.bondPrint;
  const hasSocialConnections = !!(userProfile?.socialConnections && 
    (userProfile.socialConnections.instagram || 
     userProfile.socialConnections.linkedin || 
     userProfile.socialConnections.spotify || 
     userProfile.socialConnections.appleMusic));

  // Scoring
  if (hasBasicInfo) score += 30;
  if (hasPhotos) score += 20;
  if (hasBio) score += 15;
  if (hasInterests) score += 10;
  if (hasPersonality) score += 10;
  if (hasBondPrint) score += 10;
  if (hasSocialConnections) score += 5;

  return {
    percentage: Math.min(score, maxScore),
    hasBasicInfo,
    hasPhotos,
    hasBio,
    hasInterests,
    hasPersonality,
    hasBondPrint,
    hasSocialConnections,
  };
}

/**
 * Check if a feature is unlocked
 */
export function isFeatureUnlocked(feature: string, completion: ProfileCompletion): FeatureUnlock {
  const requirements: Record<string, { unlocked: boolean; requirement?: string; progress?: number }> = {
    'link-ai-assistant': {
      unlocked: completion.percentage >= 50 && completion.hasBasicInfo && completion.hasBio,
      requirement: completion.percentage >= 50 ? undefined : 'Complete 50% of your profile',
      progress: Math.min(100, (completion.percentage / 50) * 100),
    },
    'soft-intros': {
      unlocked: completion.hasBasicInfo && completion.hasPhotos && completion.hasBio,
      requirement: !completion.hasPhotos ? 'Add profile photos' : !completion.hasBio ? 'Add a bio' : undefined,
    },
    'forum-posting': {
      unlocked: completion.hasBasicInfo,
      requirement: undefined, // Always available
    },
    'social-connections': {
      unlocked: completion.hasBasicInfo,
      requirement: undefined, // Always available
    },
    'advanced-matching': {
      unlocked: completion.percentage >= 70 && completion.hasBondPrint,
      requirement: completion.percentage < 70 ? 'Complete 70% of your profile' : !completion.hasBondPrint ? 'Complete Bond Print quiz' : undefined,
      progress: Math.min(100, (completion.percentage / 70) * 100),
    },
  };

  const config = requirements[feature] || { unlocked: true };
  
  return {
    feature,
    ...config,
  };
}

/**
 * Get all feature unlock statuses
 */
export function getAllFeatureUnlocks(completion: ProfileCompletion): FeatureUnlock[] {
  return [
    isFeatureUnlocked('link-ai-assistant', completion),
    isFeatureUnlocked('soft-intros', completion),
    isFeatureUnlocked('forum-posting', completion),
    isFeatureUnlocked('social-connections', completion),
    isFeatureUnlocked('advanced-matching', completion),
  ];
}

