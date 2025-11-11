/**
 * Feature Flags
 * 
 * Toggle features on/off for beta launch and gradual rollouts.
 * Set to false to disable a feature, true to enable it.
 */

export const FEATURES = {
  // Love Mode - Disabled for initial beta, will roll out next quarter
  LOVE_MODE_ENABLED: false,
  
  // Other features can be added here
  // EXAMPLE_FEATURE: true,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

