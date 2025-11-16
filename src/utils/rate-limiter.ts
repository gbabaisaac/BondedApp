/**
 * Client-side rate limiting utility
 * Note: Real rate limiting should be implemented on the server side
 */

interface RateLimitState {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Check if an action is allowed based on rate limits
 * @param key - Unique identifier for the rate limit (e.g., 'api-call', 'search')
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  if (!state || now > state.resetTime) {
    // Create new rate limit window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (state.count >= maxRequests) {
    return false; // Rate limited
  }

  // Increment count
  state.count++;
  return true;
}

/**
 * Get remaining requests in current window
 */
export function getRemainingRequests(
  key: string,
  maxRequests: number = 10
): number {
  const state = rateLimitStore.get(key);
  if (!state) return maxRequests;
  
  const now = Date.now();
  if (now > state.resetTime) return maxRequests;
  
  return Math.max(0, maxRequests - state.count);
}

/**
 * Clear rate limit for a key (useful for testing)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}



