/**
 * Application configuration constants
 * Centralized location for all configurable values
 */

// Polling intervals (in milliseconds)
export const POLL_INTERVALS = {
  CHAT_COUNTS: 10000, // 10 seconds (reduced from 5)
  TYPING_STATUS: 2000, // 2 seconds
  MESSAGES: 5000, // 5 seconds (reduced from 3)
  PROFILES: 30000, // 30 seconds
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  API_CALLS: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  SEARCH: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  UPLOAD: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
} as const;

// Debounce delays (in milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  TYPING: 1000,
  SCROLL: 100,
} as const;

// Bond Print compatibility check limits
export const BOND_PRINT_LIMITS = {
  MAX_PARALLEL_CHECKS: 10, // Reduced from 20
  BATCH_SIZE: 10,
} as const;

// School domains (should be moved to database in production)
export const SCHOOL_DOMAINS = [
  '@uri.edu',
  '@illinois.edu',
  // Add more as needed
] as const;

// Pagination
export const PAGINATION = {
  PROFILES_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  CHATS_PER_PAGE: 20,
} as const;

// Virtual scrolling
export const VIRTUAL_SCROLL = {
  ITEM_HEIGHT: 100, // Estimated item height in pixels
  OVERSCAN: 5, // Number of items to render outside viewport
} as const;



