/**
 * Server-side rate limiter for Supabase Edge Functions
 * Prevents API abuse by limiting requests per IP address
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (persists across function invocations within same instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware for Hono
 */
export function rateLimit(config: RateLimitConfig) {
  return async (c: any, next: any) => {
    // Get client identifier (IP address or user ID)
    const clientIP = c.req.header('x-forwarded-for') ||
                      c.req.header('x-real-ip') ||
                      'unknown';

    const now = Date.now();
    const key = `ratelimit:${clientIP}`;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);

      // Add rate limit headers
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
      c.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

      await next();
      return;
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
      c.header('Retry-After', retryAfter.toString());

      return c.json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter,
      }, 429);
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    // Add rate limit headers
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString());
    c.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    await next();
  };
}

/**
 * Different rate limit configs for different endpoint types
 */
export const rateLimitConfigs = {
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },

  // Standard limit for API endpoints
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },

  // Generous limit for read-only endpoints
  read: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 120, // 120 requests per minute
  },

  // Strict limit for write operations
  write: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },

  // Very strict limit for expensive operations (file uploads, AI calls)
  expensive: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 requests per 5 minutes
  },
};
