/**
 * Maps interests, personality traits, and activities to emojis
 * Used for the Yearbook card design
 */

const emojiMap: Record<string, string> = {
  // Music
  'music': '🎸',
  'guitar': '🎸',
  'piano': '🎹',
  'singing': '🎤',
  'dj': '🎧',
  'concerts': '🎵',
  'spotify': '🎵',
  
  // Sports
  'tennis': '🎾',
  'basketball': '🏀',
  'soccer': '⚽',
  'football': '🏈',
  'baseball': '⚾',
  'volleyball': '🏐',
  'swimming': '🏊',
  'running': '🏃',
  'cycling': '🚴',
  'yoga': '🧘',
  'fitness': '💪',
  'gym': '💪',
  
  // Vehicles
  'motorcycles': '🏍️',
  'motorcycle': '🏍️',
  'cars': '🚗',
  'driving': '🚗',
  
  // Creative
  'art': '🎨',
  'drawing': '✏️',
  'photography': '📷',
  'design': '🎨',
  'creative': '✨',
  
  // Tech
  'coding': '💻',
  'programming': '💻',
  'computer science': '💻',
  'tech': '💻',
  'gaming': '🎮',
  'video games': '🎮',
  
  // Food
  'cooking': '👨‍🍳',
  'food': '🍕',
  'coffee': '☕',
  'baking': '🍰',
  
  // Travel
  'travel': '✈️',
  'adventure': '🏔️',
  'hiking': '🥾',
  'camping': '⛺',
  
  // Social
  'parties': '🎉',
  'social': '👥',
  'networking': '🤝',
  
  // Study
  'study': '📚',
  'reading': '📖',
  'academic': '🎓',
  
  // Other
  'movies': '🎬',
  'tv': '📺',
  'books': '📚',
  'writing': '✍️',
  'dancing': '💃',
  'fashion': '👗',
  'shopping': '🛍️',
};

const personalityEmojiMap: Record<string, string> = {
  'energetic': '⚡',
  'calm': '🧘',
  'adventurous': '🏔️',
  'reliable': '🤝',
  'analytical': '🔬',
  'creative': '✨',
  'friendly': '😊',
  'introverted': '🤔',
  'extroverted': '🎉',
  'thoughtful': '💭',
};

/**
 * Get emoji for a profile based on interests and personality
 */
export function getProfileEmoji(profile: {
  interests?: string[];
  personality?: string[];
  major?: string;
  lookingFor?: string[];
}): string {
  // Priority: interests > personality > major > lookingFor
  
  // Check interests first
  if (profile.interests && profile.interests.length > 0) {
    for (const interest of profile.interests) {
      const lowerInterest = interest.toLowerCase();
      // Check exact match
      if (emojiMap[lowerInterest]) {
        return emojiMap[lowerInterest];
      }
      // Check partial match
      for (const [key, emoji] of Object.entries(emojiMap)) {
        if (lowerInterest.includes(key) || key.includes(lowerInterest)) {
          return emoji;
        }
      }
    }
  }
  
  // Check personality
  if (profile.personality && profile.personality.length > 0) {
    for (const trait of profile.personality) {
      const lowerTrait = trait.toLowerCase();
      if (personalityEmojiMap[lowerTrait]) {
        return personalityEmojiMap[lowerTrait];
      }
    }
  }
  
  // Check major
  if (profile.major) {
    const lowerMajor = profile.major.toLowerCase();
    if (lowerMajor.includes('music')) return '🎸';
    if (lowerMajor.includes('art')) return '🎨';
    if (lowerMajor.includes('computer') || lowerMajor.includes('cs')) return '💻';
    if (lowerMajor.includes('business')) return '💼';
    if (lowerMajor.includes('engineering')) return '⚙️';
  }
  
  // Default emoji
  return '✨';
}

/**
 * Get tag color based on tag type
 */
export function getTagColor(tag: string, index: number): string {
  const lowerTag = tag.toLowerCase();
  
  // Personality traits - blue
  if (lowerTag.includes('analytical') || lowerTag.includes('reliable') || 
      lowerTag.includes('creative') || lowerTag.includes('calm') ||
      lowerTag.includes('energetic') || lowerTag.includes('thoughtful')) {
    return 'bg-blue-500';
  }
  
  // Interests/Activities - green
  if (lowerTag.includes('music') || lowerTag.includes('tennis') || 
      lowerTag.includes('motorcycle') || lowerTag.includes('sport') ||
      lowerTag.includes('gaming') || lowerTag.includes('art')) {
    return 'bg-green-500';
  }
  
  // Personality/Values - purple
  if (lowerTag.includes('adventurous') || lowerTag.includes('social') ||
      lowerTag.includes('friendly') || lowerTag.includes('extroverted')) {
    return 'bg-purple-500';
  }
  
  // Default rotation based on index
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
  return colors[index % colors.length];
}

