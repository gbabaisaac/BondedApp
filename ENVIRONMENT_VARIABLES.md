# Environment Variables Guide

Complete guide to all environment variables used in the Bonded app.

---

## 🔧 **Required Variables**

### `VITE_SUPABASE_URL`
- **Description:** Your Supabase project URL
- **Format:** `https://[project-id].supabase.co`
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **Where to find:** Supabase Dashboard → Settings → API → Project URL

### `VITE_SUPABASE_ANON_KEY`
- **Description:** Supabase anonymous/public key (safe to expose)
- **Format:** Long JWT token string
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

---

## 🌍 **Environment Configuration**

### `VITE_ENV`
- **Description:** Current environment (development/production)
- **Values:** `development` | `production`
- **Default:** `development` (if not set)
- **Usage:** Controls CORS, logging, error handling

---

## 🔔 **Optional: Error Tracking**

### `VITE_SENTRY_DSN`
- **Description:** Sentry DSN for error tracking
- **Format:** `https://[key]@[org].ingest.sentry.io/[project-id]`
- **Required:** No (only if using Sentry)
- **Where to get:** Sentry Dashboard → Settings → Projects → Client Keys (DSN)

---

## 🤖 **Optional: AI Features**

### `VITE_GEMINI_API_KEY`
- **Description:** Google Gemini API key for AI features
- **Format:** API key string
- **Required:** No (only if using AI features)
- **Where to get:** Google AI Studio → Get API Key

---

## 📝 **Setup Instructions**

### **Development (Local)**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_ENV=development
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

### **Production (Vercel)**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add each variable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENV=production`
   - `VITE_SENTRY_DSN` (optional)
   - `VITE_GEMINI_API_KEY` (optional)

3. Redeploy your project

### **Backend (Supabase Edge Functions)**

Set secrets in Supabase:
```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase secrets set ENVIRONMENT=production
```

---

## 🔒 **Security Notes**

- ✅ **Safe to expose:** `VITE_SUPABASE_ANON_KEY` (protected by RLS)
- ❌ **Never expose:** Service role keys, API keys
- ✅ **Use environment variables:** Never hardcode secrets
- ✅ **Use `.env.local`:** For local secrets (gitignored)

---

## 🧪 **Testing**

Verify your environment variables are loaded:
```javascript
// In browser console
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_ENV);
```

---

## ❓ **Troubleshooting**

**Issue:** Variables not loading
- **Solution:** Restart dev server after changing `.env`
- **Solution:** Ensure variables start with `VITE_`
- **Solution:** Check `.env` file is in project root

**Issue:** "Unauthorized" errors
- **Solution:** Verify `VITE_SUPABASE_ANON_KEY` is correct
- **Solution:** Check Supabase project is active

**Issue:** CORS errors
- **Solution:** Set `VITE_ENV=production` in production
- **Solution:** Verify domain is in Supabase allowed origins

---

**Last Updated:** Current Session

