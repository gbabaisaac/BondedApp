# 🔧 Backend Setup Guide

Complete guide to connect your frontend to the Supabase backend.

---

## ✅ **CURRENT STATUS**

Your app is configured to connect to:
- **Backend URL:** `https://[your-project-id].supabase.co/functions/v1/make-server-2516be19`
- **Project ID:** Extracted from `VITE_SUPABASE_URL` environment variable

---

## 📋 **STEP 1: Set Up Environment Variables**

### **Create `.env` file** (in project root)

```bash
# Required
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_ENV=development
VITE_SENTRY_DSN=your-sentry-dsn  # Optional
VITE_GEMINI_API_KEY=your-gemini-key  # Optional for AI features
```

### **Where to Find These Values:**

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project** (or create a new one)
3. **Go to Settings → API:**
   - **Project URL** = `VITE_SUPABASE_URL`
   - **anon public** key = `VITE_SUPABASE_ANON_KEY`

---

## 🚀 **STEP 2: Deploy the Edge Function**

The backend code is in `supabase/functions/make-server-2516be19/index.ts`

### **Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy make-server-2516be19
```

### **Option B: Using Supabase Dashboard**

1. Go to **Supabase Dashboard → Edge Functions**
2. Click **"Create a new function"**
3. Name it: `make-server-2516be19`
4. Copy the contents of `supabase/functions/make-server-2516be19/index.ts`
5. Paste into the function editor
6. Click **Deploy**

---

## 🔐 **STEP 3: Set Edge Function Secrets**

The Edge Function needs these secrets to work:

```bash
# Using Supabase CLI
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set ENVIRONMENT=development  # or 'production'
supabase secrets set GEMINI_API_KEY=your-gemini-key  # Optional
```

### **Where to Find Service Role Key:**

1. Go to **Supabase Dashboard → Settings → API**
2. Copy the **service_role** key (⚠️ Keep this secret!)

---

## 🗄️ **STEP 4: Run Database Migrations**

The database tables need to be created:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard:
# Go to SQL Editor → Run the migration file:
# supabase/migrations/20250104000000_forums_classes_clubs.sql
```

### **Manual Migration:**

1. Go to **Supabase Dashboard → SQL Editor**
2. Open `supabase/migrations/20250104000000_forums_classes_clubs.sql`
3. Copy and paste the SQL
4. Click **Run**

---

## 🪣 **STEP 5: Set Up Storage Buckets**

The app needs storage buckets for media uploads:

1. Go to **Supabase Dashboard → Storage**
2. Create bucket: `make-2516be19-profile-photos`
   - Set to **Private**
   - Max file size: 5MB
3. Create bucket: `make-2516be19-forum-media` (if needed)
   - Set to **Private**
   - Max file size: 50MB

---

## ✅ **STEP 6: Verify Connection**

### **Test the Backend:**

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Check browser console** for any connection errors

3. **Test an API call:**
   - Try logging in
   - Try creating a profile
   - Check Network tab in DevTools for API calls

### **Common Issues:**

#### **"Failed to fetch" Error**
- ✅ Check `VITE_SUPABASE_URL` is correct
- ✅ Check Edge Function is deployed
- ✅ Check CORS settings (should be handled automatically)

#### **"401 Unauthorized" Error**
- ✅ Check `VITE_SUPABASE_ANON_KEY` is correct
- ✅ Check user is logged in
- ✅ Check token is being sent in requests

#### **"Function not found" Error**
- ✅ Verify Edge Function is deployed
- ✅ Check function name matches: `make-server-2516be19`
- ✅ Check function URL in Network tab

---

## 🔍 **VERIFICATION CHECKLIST**

- [ ] `.env` file created with correct values
- [ ] Edge Function deployed to Supabase
- [ ] Edge Function secrets set (SUPABASE_URL, SERVICE_ROLE_KEY)
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] App can connect to backend (no "Failed to fetch" errors)
- [ ] Can log in and create profile
- [ ] Can create posts
- [ ] Can upload media

---

## 📝 **QUICK START COMMANDS**

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env with your values

# 2. Install Supabase CLI
npm install -g supabase

# 3. Login and link
supabase login
supabase link --project-ref your-project-ref

# 4. Deploy function
supabase functions deploy make-server-2516be19

# 5. Set secrets
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 6. Run migrations
supabase db push

# 7. Start app
npm run dev
```

---

## 🆘 **TROUBLESHOOTING**

### **Backend Not Responding**

1. **Check Edge Function logs:**
   ```bash
   supabase functions logs make-server-2516be19
   ```

2. **Check function is deployed:**
   - Go to Supabase Dashboard → Edge Functions
   - Verify `make-server-2516be19` exists and is active

3. **Test function directly:**
   ```bash
   curl https://your-project-id.supabase.co/functions/v1/make-server-2516be19/health
   ```

### **CORS Errors**

The Edge Function should handle CORS automatically. If you see CORS errors:

1. Check `ENVIRONMENT` secret is set correctly
2. Verify your domain is in allowed origins (for production)
3. Check Edge Function CORS configuration

### **Database Errors**

1. **Check migrations ran:**
   - Go to Supabase Dashboard → Database → Migrations
   - Verify migration is applied

2. **Check RLS policies:**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies are enabled

---

## 📞 **NEED HELP?**

1. Check **TROUBLESHOOTING_GUIDE.md** for common issues
2. Check **Supabase Dashboard → Edge Functions → Logs** for errors
3. Check browser **Network tab** for failed requests
4. Verify all environment variables are set correctly

---

**Once these steps are complete, your backend should be fully connected! 🚀**
