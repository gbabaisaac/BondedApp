/**
 * Input sanitization utilities
 */

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:(?!image\/|text\/plain)/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize user input for display (HTML escape)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  // Basic email validation and sanitization
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  
  const sanitized = url.trim();
  
  // Only allow http, https, and relative URLs
  if (!sanitized.match(/^(https?:\/\/|\/)/)) {
    return '';
  }
  
  // Remove javascript: and data: protocols
  if (sanitized.match(/^(javascript|data):/i)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize user profile data
 */
export function sanitizeProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') {
    return {};
  }
  
  const sanitized: any = {};
  
  // Sanitize string fields
  if (profile.name) sanitized.name = sanitizeString(profile.name);
  if (profile.bio) sanitized.bio = sanitizeString(profile.bio);
  if (profile.school) sanitized.school = sanitizeString(profile.school);
  if (profile.major) sanitized.major = sanitizeString(profile.major);
  if (profile.year) sanitized.year = sanitizeString(profile.year);
  
  // Sanitize arrays
  if (Array.isArray(profile.interests)) {
    sanitized.interests = profile.interests
      .filter((item: any) => typeof item === 'string')
      .map((item: string) => sanitizeString(item));
  }
  
  if (Array.isArray(profile.lookingFor)) {
    sanitized.lookingFor = profile.lookingFor
      .filter((item: any) => typeof item === 'string')
      .map((item: string) => sanitizeString(item));
  }
  
  // Keep other fields as-is (numbers, booleans, etc.)
  Object.keys(profile).forEach((key) => {
    if (!['name', 'bio', 'school', 'major', 'year', 'interests', 'lookingFor'].includes(key)) {
      sanitized[key] = profile[key];
    }
  });
  
  return sanitized;
}




