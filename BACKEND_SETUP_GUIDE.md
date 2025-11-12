# Backend Setup Guide

This guide will help you set up the backend for the new features: Forum, Social Media Connections, and Progressive Feature Unlocking.

## 📋 Prerequisites

- Supabase project with Edge Functions enabled
- Database access to run migrations
- OAuth app credentials for LinkedIn, Instagram, Spotify (optional)

## 🗄️ Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Migration**
   - Copy the contents of `supabase/migrations/20250101000000_forum_and_social.sql`
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to Database → Tables
   - Verify these tables exist:
     - `forum_posts`
     - `forum_post_likes`
     - `forum_comments`

## 🔐 Step 2: Set Up OAuth Apps

### LinkedIn OAuth Setup

1. **Create LinkedIn App**
   - Go to https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in app details
   - Add redirect URL: `https://your-domain.com/auth/linkedin/callback`

2. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to Supabase Edge Function secrets

### Instagram OAuth Setup

1. **Create Instagram App**
   - Go to https://developers.facebook.com/apps
   - Create new app → Select "Consumer" type
   - Add Instagram Basic Display product
   - Add redirect URL: `https://your-domain.com/auth/instagram/callback`

2. **Get Credentials**
   - Copy App ID and App Secret
   - Add to Supabase Edge Function secrets

### Spotify OAuth Setup

1. **Create Spotify App**
   - Go to https://developer.spotify.com/dashboard
   - Click "Create app"
   - Add redirect URL: `https://your-domain.com/auth/spotify/callback`

2. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to Supabase Edge Function secrets

### Apple Music Setup

- Requires Apple Developer account
- Uses MusicKit JS on frontend
- No OAuth flow needed (handled client-side)

## 🔧 Step 3: Configure Environment Variables

Add these to your Supabase Edge Function secrets:

```bash
# In Supabase Dashboard → Edge Functions → Settings → Secrets

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

APP_URL=https://your-domain.com
# Or for local: http://localhost:5173
```

## 🚀 Step 4: Deploy Edge Function

The endpoints are already added to `supabase/functions/make-server-2516be19/index.ts`. 

1. **Deploy the function:**
   ```bash
   supabase functions deploy make-server-2516be19
   ```

   Or use the Supabase Dashboard:
   - Go to Edge Functions
   - Click "Deploy" or "Update" for `make-server-2516be19`

## ✅ Step 5: Test the Endpoints

### Test Forum Endpoints

```bash
# Get posts
curl -X GET "https://your-project.supabase.co/functions/v1/make-server-2516be19/forum/posts" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create post
curl -X POST "https://your-project.supabase.co/functions/v1/make-server-2516be19/forum/posts" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test post", "isAnonymous": true}'

# Like a post
curl -X POST "https://your-project.supabase.co/functions/v1/make-server-2516be19/forum/posts/POST_ID/like" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Social Media Endpoints

```bash
# Initiate LinkedIn connection
curl -X POST "https://your-project.supabase.co/functions/v1/make-server-2516be19/social/linkedin/connect" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Disconnect LinkedIn
curl -X POST "https://your-project.supabase.co/functions/v1/make-server-2516be19/social/linkedin/disconnect" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Step 6: Frontend OAuth Callback Handlers

You'll need to create callback pages for OAuth redirects. Create these files:

### `src/pages/AuthCallback.tsx` (or add to your routing)

```typescript
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectId } from '../utils/supabase/info';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const provider = window.location.pathname.split('/')[2]; // linkedin, instagram, spotify

  useEffect(() => {
    if (code && state) {
      // Get access token from your app context
      const accessToken = localStorage.getItem('accessToken');
      
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/social/${provider}/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ code, state }),
        }
      )
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            navigate('/profile');
          }
        });
    }
  }, [code, state, provider, navigate]);

  return <div>Connecting...</div>;
}
```

## 🔒 Security Notes

1. **Encrypt OAuth Tokens**: In production, encrypt access tokens before storing in database
2. **Rate Limiting**: Already implemented via `rate-limiter.ts`
3. **Content Moderation**: Forum posts and comments are moderated via `content-moderator.ts`
4. **RLS Policies**: Database tables have Row Level Security enabled

## 🐛 Troubleshooting

### Forum posts not showing
- Check if migration ran successfully
- Verify RLS policies allow SELECT
- Check Edge Function logs for errors

### OAuth not working
- Verify redirect URLs match exactly in OAuth app settings
- Check environment variables are set correctly
- Review Edge Function logs for OAuth errors

### Social connections not saving
- Verify user profile exists in KV store
- Check Edge Function logs
- Ensure `socialConnections` object is initialized

## 📚 API Documentation

### Forum Endpoints

- `GET /forum/posts` - Get all posts
- `POST /forum/posts` - Create a post
- `POST /forum/posts/:id/like` - Like a post
- `POST /forum/posts/:id/dislike` - Dislike a post
- `GET /forum/posts/:id/comments` - Get comments
- `POST /forum/posts/:id/comments` - Add a comment

### Social Media Endpoints

- `POST /social/linkedin/connect` - Initiate LinkedIn OAuth
- `POST /social/linkedin/callback` - Handle LinkedIn callback
- `POST /social/linkedin/disconnect` - Disconnect LinkedIn
- `POST /social/instagram/connect` - Initiate Instagram OAuth
- `POST /social/instagram/callback` - Handle Instagram callback
- `POST /social/instagram/disconnect` - Disconnect Instagram
- `POST /social/spotify/connect` - Initiate Spotify OAuth
- `POST /social/spotify/callback` - Handle Spotify callback
- `POST /social/spotify/disconnect` - Disconnect Spotify
- `POST /social/appleMusic/connect` - Connect Apple Music
- `POST /social/appleMusic/disconnect` - Disconnect Apple Music

All endpoints require authentication via `Authorization: Bearer <token>` header.

