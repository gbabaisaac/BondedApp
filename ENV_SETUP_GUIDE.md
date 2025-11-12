# Environment Variables Setup Guide

This guide explains how to properly configure environment variables for Bonded in production.

## Required Environment Variables

### 1. Supabase Configuration

```bash
VITE_SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the "Project URL" (VITE_SUPABASE_URL)
4. Copy the "anon/public" key (VITE_SUPABASE_ANON_KEY)

**Security Note:** The anon key is safe to expose on the client side as it has restricted permissions.

---

### 2. Sentry Error Tracking

```bash
VITE_SENTRY_DSN=your-sentry-dsn-here
```

**How to get this:**
1. Create account at https://sentry.io
2. Create a new project, select "React"
3. Copy the DSN from the setup instructions
4. The DSN looks like: `https://abc123@o123456.ingest.sentry.io/7654321`

**When to use:** Required for production to track errors and crashes

---

### 3. Gemini API Key (Optional)

```bash
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**How to get this:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

**When to use:** Only if you're using Gemini AI features (Bond Print AI analysis)

---

### 4. Environment Flag

```bash
VITE_ENV=production
```

**Options:**
- `development` - Local development, shows debug logs
- `staging` - Testing environment
- `production` - Live production, minimal logging

---

## Local Development Setup (.env file)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your actual values:
   ```bash
   VITE_SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhb...your-actual-key
   VITE_GEMINI_API_KEY=AIza...your-actual-key
   VITE_SENTRY_DSN=https://...your-dsn
   VITE_ENV=development
   ```

3. **IMPORTANT:** Never commit `.env` to git. It's already in `.gitignore`.

---

## Vercel Deployment Setup

### Adding Environment Variables to Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://wmlklvlnxftedtylgxsc.supabase.co`
   - **Environments:** Select "Production", "Preview", and "Development"
   - Click "Save"

4. Repeat for each variable:
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SENTRY_DSN`
   - `VITE_GEMINI_API_KEY` (if using AI features)
   - `VITE_ENV` (set to "production" for production environment)

5. Redeploy your app after adding variables:
   ```bash
   git push origin main
   ```

**Note:** Vercel automatically rebuilds when you push, and environment variables will be available.

---

## Supabase Edge Functions Environment Variables

Your Edge Functions also need environment variables. These are configured separately:

### Setting Edge Function Environment Variables:

1. Using Supabase CLI:
   ```bash
   supabase secrets set SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Or via Supabase Dashboard:
   - Go to your Supabase project
   - Click "Edge Functions" → "Settings"
   - Add secrets:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`

**Security Warning:** The service role key has admin access. NEVER expose it on the client side or in git.

---

## Verification Checklist

After setting up environment variables, verify:

- [ ] Frontend can connect to Supabase (test signup/login)
- [ ] Sentry receives test errors (throw a test error)
- [ ] Edge Functions can access Supabase (test creating a profile)
- [ ] Rate limiting works (make 100 rapid requests)
- [ ] CORS allows your domain (test from production URL)
- [ ] No hardcoded secrets in code (search for "ANON_KEY")

---

## Common Issues

### Issue: "Supabase client error: Invalid API key"
**Solution:** Check that `VITE_SUPABASE_ANON_KEY` is correct and doesn't have trailing spaces.

### Issue: "Sentry not capturing errors"
**Solution:**
1. Check DSN is correct
2. Verify `VITE_ENV` is set to "production"
3. Check browser console for Sentry init errors

### Issue: "Environment variables not found in Vercel"
**Solution:**
1. Make sure variable names start with `VITE_` for Vite apps
2. Redeploy after adding variables
3. Check they're enabled for the correct environment (production/preview)

### Issue: "Edge Function can't access secrets"
**Solution:**
1. Set secrets using Supabase CLI: `supabase secrets set KEY=value`
2. Redeploy Edge Function: `supabase functions deploy`

---

## Security Best Practices

1. **Never commit secrets to git**
   - Always use `.env` files locally
   - Use Vercel/Supabase dashboards for production

2. **Use different keys for different environments**
   - Staging should have separate Supabase project
   - Production should have separate Sentry project

3. **Rotate keys regularly**
   - Rotate API keys every 90 days
   - If a key is exposed, rotate immediately

4. **Limit key permissions**
   - Use anon key for client (restricted)
   - Use service role key only on server (Edge Functions)

5. **Monitor key usage**
   - Set up Supabase usage alerts
   - Monitor Sentry quota
   - Check for unusual API patterns

---

## Quick Reference

```bash
# Local Development
cp .env.example .env
# Edit .env with your values
npm run dev

# Vercel Deployment
# Add env vars via Vercel dashboard
git push origin main

# Edge Functions
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase functions deploy
```

---

## Need Help?

- **Supabase Setup:** https://supabase.com/docs/guides/getting-started
- **Sentry Setup:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Vercel Env Vars:** https://vercel.com/docs/environment-variables

For project-specific issues, contact: support@bonded.app
