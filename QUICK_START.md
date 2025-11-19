# 🚀 Quick Start Guide

Get your Bonded app connected to the backend in 5 minutes!

---

## ⚡ **FASTEST WAY (5 Steps)**

### **1. Get Your Supabase Credentials**

1. Go to https://supabase.com/dashboard
2. Create/select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### **2. Create `.env` File**

In your project root, create `.env`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **3. Deploy Backend Function**

**Option A: Supabase Dashboard (Easiest)**
1. Go to **Edge Functions** in dashboard
2. Click **"Create a new function"**
3. Name: `make-server-2516be19`
4. Copy code from `supabase/functions/make-server-2516be19/index.ts`
5. Paste and **Deploy**

**Option B: CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy make-server-2516be19
```

### **4. Set Function Secrets**

In Supabase Dashboard → Edge Functions → `make-server-2516be19` → Settings → Secrets:

- `SUPABASE_URL` = Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Your service_role key (from Settings → API)
- `ENVIRONMENT` = `development` (or `production`)

### **5. Run Database Migration**

In Supabase Dashboard → SQL Editor:
1. Open `supabase/migrations/20250104000000_forums_classes_clubs.sql`
2. Copy all SQL
3. Paste into SQL Editor
4. Click **Run**

---

## ✅ **Test It Works**

1. Start your app: `npm run dev`
2. Try to log in
3. Check browser console for errors
4. If you see "Failed to fetch" → Backend not deployed
5. If you see "401 Unauthorized" → Check your `.env` file

---

## 🆘 **Common Issues**

| Error | Solution |
|-------|----------|
| "Failed to fetch" | Deploy Edge Function (Step 3) |
| "401 Unauthorized" | Check `.env` file has correct keys |
| "Function not found" | Verify function name is `make-server-2516be19` |
| "Database error" | Run migrations (Step 5) |

---

## 📚 **Need More Details?**

- **Full Setup:** See `BACKEND_SETUP_GUIDE.md`
- **Troubleshooting:** See `TROUBLESHOOTING_GUIDE.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`

---

**That's it! Your backend should now be connected! 🎉**
