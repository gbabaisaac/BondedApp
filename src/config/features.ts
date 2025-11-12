/**
 * Feature Flags
 * 
 * Toggle features on/off for beta launch and gradual rollouts.
 * Set to false to disable a feature, true to enable it.
 */

export const FEATURES = {
  // Love Mode - ENABLED with new design
  LOVE_MODE_ENABLED: true,

  // AI Assistant (Link) - ENABLED for Love Mode
  AI_ASSISTANT_ENABLED: true,

  // Other features can be added here
  // EXAMPLE_FEATURE: true,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

