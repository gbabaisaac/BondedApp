# Quick Start - Backend Setup

## 🚀 Quick Setup (5 minutes)

### 1. Run Database Migration

```sql
-- Copy and paste this in Supabase SQL Editor
-- File: supabase/migrations/20250101000000_forum_and_social.sql
```

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250101000000_forum_and_social.sql`
3. Paste and click "Run"

### 2. Deploy Edge Function

The endpoints are already in your Edge Function. Just deploy:

```bash
supabase functions deploy make-server-2516be19
```

Or in Supabase Dashboard:
- Edge Functions → `make-server-2516be19` → Deploy/Update

### 3. Set Environment Variables (Optional - for OAuth)

Only needed if you want social media connections:

```bash
# In Supabase Dashboard → Edge Functions → Settings → Secrets
LINKEDIN_CLIENT_ID=your_id
LINKEDIN_CLIENT_SECRET=your_secret
INSTAGRAM_CLIENT_ID=your_id
INSTAGRAM_CLIENT_SECRET=your_secret
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
APP_URL=https://your-domain.com
```

**Note:** Forum works without OAuth setup. Social connections are optional.

### 4. Test It!

The frontend is already connected. Just:
1. Run your app
2. Navigate to Forum tab
3. Create a post!

## ✅ That's It!

Forum is ready to use. Social media connections can be set up later when you have OAuth credentials.

