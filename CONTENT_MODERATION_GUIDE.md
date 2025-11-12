# Content Moderation System Guide

## Overview
This guide outlines the content moderation system for the Bonded application.

## Current Implementation

### 1. User Reporting System
- ✅ Users can report other users via `ReportBlockModal`
- ✅ Reports stored in backend with reason and details
- ✅ Backend endpoint: `/user/:userId/report`

### 2. Blocking System
- ✅ Users can block other users
- ✅ Blocked users filtered from profiles and chats
- ✅ Backend endpoints: `/user/:userId/block`, `/user/:userId/unblock`

## Recommended Enhancements

### 1. Automated Content Filtering

```typescript
// src/utils/content-moderation.ts
export async function moderateContent(content: string): Promise<{
  isSafe: boolean;
  reason?: string;
  flaggedWords?: string[];
}> {
  // List of prohibited words/phrases
  const prohibitedWords = [
    // Add prohibited words here
  ];
  
  const lowerContent = content.toLowerCase();
  const flaggedWords = prohibitedWords.filter(word => 
    lowerContent.includes(word.toLowerCase())
  );
  
  if (flaggedWords.length > 0) {
    return {
      isSafe: false,
      reason: 'Content contains prohibited language',
      flaggedWords,
    };
  }
  
  return { isSafe: true };
}
```

### 2. AI-Powered Moderation (Future)

Integrate with services like:
- **Google Perspective API** - Toxicity detection
- **AWS Comprehend** - Content analysis
- **OpenAI Moderation API** - Content filtering

### 3. Image Moderation

For profile photos and messages:
- **AWS Rekognition** - Inappropriate content detection
- **Google Cloud Vision API** - Safe search detection

### 4. Rate Limiting for Reports

Prevent abuse:
- Max 5 reports per user per day
- Cooldown period after reporting
- Automatic review for frequent reporters

## Implementation Checklist

- [ ] Add content filtering to message sending
- [ ] Add content filtering to profile creation/updates
- [ ] Implement image moderation for uploads
- [ ] Add admin dashboard for reviewing reports
- [ ] Set up automated flagging for repeated violations
- [ ] Create moderation queue for manual review
- [ ] Add user reputation system
- [ ] Implement temporary/permanent bans

## Backend Integration

Update Edge Function endpoints:

```typescript
// In message sending endpoint
const moderationResult = await moderateContent(messageContent);
if (!moderationResult.isSafe) {
  return c.json({ 
    error: 'Message blocked', 
    reason: moderationResult.reason 
  }, 400);
}
```

## Monitoring

- Track moderation actions
- Monitor false positive rates
- Review flagged content regularly
- Update prohibited word lists based on patterns


