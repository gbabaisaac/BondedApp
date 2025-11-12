# Console.log Cleanup Guide

## Problem

The codebase has 166+ console.log statements, many of which are not wrapped in development checks. This means:
- Logs are exposed in production (potential information leakage)
- Browser console is cluttered
- Performance impact from unnecessary logging

## Solution

Use the centralized `logger` utility that automatically handles dev/prod environments.

## Quick Fix Steps

### 1. Import the logger utility

Replace:
```typescript
// No import needed for console.log
```

With:
```typescript
import { logger } from '../utils/logger'; // Adjust path as needed
```

### 2. Replace console statements

| Old | New |
|-----|-----|
| `console.log(...)` | `logger.log(...)` |
| `console.error(...)` | `logger.error(...)` |
| `console.warn(...)` | `logger.warn(...)` |
| `console.info(...)` | `logger.info(...)` |

### 3. For wrapped console.logs

If you have:
```typescript
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

Replace with:
```typescript
logger.log('Debug info:', data);
```

The logger already handles the dev check internally!

---

## File-by-File Cleanup

### Priority 1: Files with Authentication/User Data

These files may log sensitive information:

- [ ] `src/App.tsx` - Login and session handling
- [ ] `src/components/AuthFlow.tsx` - Authentication flow
- [ ] `src/components/ProfileSetup.tsx` - User profile data
- [ ] `src/components/ChatView.tsx` - Messages
- [ ] `src/components/MyProfile.tsx` - Personal information

### Priority 2: Core Features

- [ ] `src/components/InstagramGrid.tsx` - Profile browsing
- [ ] `src/components/MatchSuggestions.tsx` - Matching algorithm
- [ ] `src/components/BondPrintQuiz.tsx` - Quiz responses
- [ ] `src/components/SoftIntroFlow.tsx` - Connection requests

### Priority 3: UI Components

- [ ] `src/components/MobileLayout.tsx`
- [ ] `src/components/ProfileDetailView.tsx`
- [ ] `src/components/ProfileDetail.tsx`
- [ ] `src/components/EditProfile.tsx`

---

## Automated Cleanup Script

Use this script to find all problematic console.logs:

```bash
# Find all console.log statements
grep -r "console\\.log" src/ --exclude-dir=node_modules

# Count console statements
grep -r "console\\." src/ --exclude-dir=node_modules | wc -l

# Find console.logs not using logger
grep -r "console\\.log" src/ --exclude="logger.ts" --exclude="sentry.ts"
```

### VSCode Find & Replace

1. Open Find & Replace (Ctrl+Shift+H)
2. Enable regex mode
3. Find: `console\\.log\\(`
4. Replace: `logger.log(`
5. Review each match manually before replacing

---

## Important: Keep These Console Statements

### 1. Sentry Configuration (`src/config/sentry.ts`)
```typescript
console.warn('Sentry DSN not configured...');
```
**Why:** Need to warn about missing configuration even in production.

### 2. Error Boundaries (`src/components/ErrorBoundary.tsx`)
```typescript
console.error('Error boundary caught:', error);
```
**Why:** Critical errors should always be logged. But verify it also calls `logger.error()` for Sentry.

### 3. Service Worker/PWA (`public/sw.js`)
```typescript
console.log('[SW] Installing...');
```
**Why:** Service worker logs help debug installation issues.

---

## After Cleanup Verification

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Check production build:**
   ```bash
   npm run preview
   ```

3. **Open browser console** - should see minimal logging

4. **Test critical flows:**
   - Signup/Login (no credential logs)
   - Send message (no message content logs)
   - Profile update (no personal data logs)

---

## Before/After Example

### Before (Bad ❌)
```typescript
export function ChatView({ userId, accessToken }) {
  const handleSendMessage = async (content) => {
    console.log('Sending message:', content); // ❌ Logs message content
    console.log('User ID:', userId); // ❌ Logs user ID

    const response = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    console.log('Response:', response); // ❌ Logs response data
  };

  if (import.meta.env.DEV) {
    console.log('ChatView mounted'); // ❌ Duplicates dev check
  }
}
```

### After (Good ✅)
```typescript
import { logger } from '../utils/logger';

export function ChatView({ userId, accessToken }) {
  const handleSendMessage = async (content) => {
    logger.log('Sending message'); // ✅ No content logged

    const response = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      logger.error('Failed to send message', response.status); // ✅ Only errors logged
    }
  };

  logger.log('ChatView mounted'); // ✅ Logger handles dev check
}
```

---

## Common Mistakes to Avoid

### ❌ Logging Sensitive Data
```typescript
logger.log('User password:', password); // NEVER
logger.log('Access token:', token); // NEVER
logger.log('Email:', user.email); // Avoid
logger.log('Message content:', message); // Avoid
```

### ✅ Safe Logging
```typescript
logger.log('User authenticated'); // OK
logger.log('Message sent successfully'); // OK
logger.error('API error', error.status); // OK
logger.warn('Rate limit approaching'); // OK
```

---

## Testing After Cleanup

### Manual Test
1. Build for production: `npm run build`
2. Serve: `npm run preview`
3. Open DevTools Console
4. Should see NO logs except:
   - Sentry initialization (if configured)
   - Critical errors
   - PWA installation prompts

### Automated Test (Future)
Add to CI/CD:
```bash
# Fail if console.log found in src (excluding logger.ts)
if grep -r "console\\.log" src/ --exclude="logger.ts" --exclude="sentry.ts" -q; then
  echo "❌ Found console.log statements. Use logger utility instead."
  exit 1
fi
```

---

## Summary Checklist

- [ ] Imported logger utility in all files
- [ ] Replaced all console.log with logger.log
- [ ] Replaced all console.error with logger.error
- [ ] Replaced all console.warn with logger.warn
- [ ] Removed duplicate `if (import.meta.env.DEV)` checks
- [ ] Verified no sensitive data is logged
- [ ] Tested production build (minimal console output)
- [ ] Added lint rule to prevent future console.logs

---

## Next Steps

1. Complete cleanup using find & replace
2. Test each modified file
3. Create PR with changes
4. Add ESLint rule to prevent console.log:
   ```json
   {
     "rules": {
       "no-console": ["error", { "allow": ["warn", "error"] }]
     }
   }
   ```

---

**Estimated Time:** 1-2 hours for full cleanup
**Impact:** High - Prevents data leakage, improves performance
**Priority:** High - Should be done before production launch
