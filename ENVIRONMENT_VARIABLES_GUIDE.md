# Environment Variables Setup Guide

This guide explains all environment variables needed for the Bonded app.

---

## 📋 **Required Environment Variables**

### **1. Supabase Configuration** (REQUIRED)

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the "Project URL" (VITE_SUPABASE_URL)
4. Copy the "anon/public" key (VITE_SUPABASE_ANON_KEY)

**Security Note:** The anon key is safe to expose on the client side as it has restricted permissions via Row Level Security (RLS).

**Fallback:** If not set, the app will use development values from `src/utils/supabase/info.tsx` (for local development only).

---

### **2. Environment Flag** (OPTIONAL)

```bash
VITE_ENV=development
```

**Options:**
- `development` - Local development, shows debug logs, allows localhost CORS
- `staging` - Testing environment
- `production` - Live production, minimal logging, restricted CORS

**Default:** If not set, defaults to development mode

---

## 🔧 **Optional Environment Variables**

### **3. Sentry Error Tracking** (OPTIONAL - Recommended for Production)

```bash
VITE_SENTRY_DSN=https://your-sentry-dsn
```

**How to get this:**
1. Create account at https://sentry.io
2. Create a new project, select "React"
3. Copy the DSN from the setup instructions
4. The DSN looks like: `https://abc123@o123456.ingest.sentry.io/7654321`

**When to use:** Required for production to track errors and crashes

---

### **4. Gemini API Key** (OPTIONAL - For AI Features)

```bash
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**How to get this:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

**When to use:** Only if you're using Gemini AI features (Bond Print AI analysis, AI Assistant)

---

### **5. App URL** (OPTIONAL - For OAuth Callbacks)

```bash
APP_URL=https://your-domain.com
```

**When to use:** Required if using OAuth integrations (LinkedIn, Instagram, Spotify)

**Note:** This is used in Edge Functions, not the frontend. Set it in Supabase Edge Function secrets.

---

## 🚀 **Setup Instructions**

### **Local Development**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your actual values:
   ```bash
   VITE_SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_ENV=development
   VITE_SENTRY_DSN=https://...
   VITE_GEMINI_API_KEY=AIza...
   ```

3. **IMPORTANT:** Never commit `.env` to git. It's already in `.gitignore`.

4. Restart your dev server after creating/modifying `.env`:
   ```bash
   npm run dev
   ```

---

### **Vercel Deployment**

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://your-project-id.supabase.co`
   - **Environments:** Select "Production", "Preview", and "Development"
   - Click "Save"

4. Repeat for each variable:
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SENTRY_DSN` (optional)
   - `VITE_GEMINI_API_KEY` (optional)
   - `VITE_ENV` (set to "production" for production environment)

5. Redeploy your app after adding variables:
   ```bash
   git push origin main
   ```

**Note:** Vercel automatically rebuilds when you push, and environment variables will be available.

---

### **Supabase Edge Functions Environment Variables**

Your Edge Functions also need environment variables. These are configured separately:

#### **Setting Edge Function Environment Variables:**

1. **Using Supabase CLI:**
   ```bash
   supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   supabase secrets set GEMINI_API_KEY=your-gemini-key
   supabase secrets set ENVIRONMENT=production
   ```

2. **Or via Supabase Dashboard:**
   - Go to your Supabase project
   - Click "Edge Functions" → "Settings"
   - Add secrets:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GEMINI_API_KEY` (optional)
     - `ENVIRONMENT` (optional)

**Security Warning:** The service role key has admin access. NEVER expose it on the client side or in git.

---

## ✅ **Verification Checklist**

After setting up environment variables, verify:

- [ ] Frontend can connect to Supabase (test signup/login)
- [ ] Sentry receives test errors (throw a test error)
- [ ] Edge Functions can access Supabase (test creating a profile)
- [ ] Rate limiting works (make 100 rapid requests)
- [ ] CORS allows your domain (test from production URL)
- [ ] No hardcoded secrets in code (search for "ANON_KEY" in source)
- [ ] Environment variables load correctly (check browser console for warnings)

---

## 🔍 **Troubleshooting**

### **Issue: "Supabase configuration missing" warning**

**Solution:**
1. Check that `.env` file exists in the root directory
2. Verify variable names start with `VITE_` (case-sensitive)
3. Restart dev server after creating/modifying `.env`
4. Check browser console for specific error messages

### **Issue: Environment variables not loading in production**

**Solution:**
1. Verify variables are set in Vercel dashboard
2. Check that variable names match exactly (case-sensitive)
3. Ensure variables are enabled for the correct environment (Production/Preview/Development)
4. Redeploy after adding variables

### **Issue: Edge Functions can't access environment variables**

**Solution:**
1. Verify secrets are set in Supabase dashboard
2. Check secret names match what's used in code
3. Redeploy Edge Functions after setting secrets

---

## 📝 **Variable Reference**

| Variable | Required | Used In | Description |
|----------|----------|---------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Frontend | Supabase anonymous key |
| `VITE_ENV` | ⚠️ Optional | Frontend | Environment flag (dev/staging/prod) |
| `VITE_SENTRY_DSN` | ⚠️ Optional | Frontend | Sentry error tracking |
| `VITE_GEMINI_API_KEY` | ⚠️ Optional | Frontend | Gemini AI API key |
| `SUPABASE_URL` | ✅ Yes | Edge Functions | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Edge Functions | Supabase service role key |
| `GEMINI_API_KEY` | ⚠️ Optional | Edge Functions | Gemini AI API key |
| `ENVIRONMENT` | ⚠️ Optional | Edge Functions | Environment flag |

---

## 🔒 **Security Best Practices**

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different keys for dev/staging/prod** - Don't share keys across environments
3. **Rotate keys regularly** - Especially if exposed or compromised
4. **Use service role key only in Edge Functions** - Never expose on client
5. **Review RLS policies** - Ensure proper access control
6. **Monitor usage** - Check Supabase dashboard for unusual activity

---

**Last Updated:** Current Session

