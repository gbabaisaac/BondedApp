# 🚀 Backend Setup - Step by Step

Follow these steps to connect your backend using the Supabase CLI.

---

## 📦 **STEP 1: Install Supabase CLI (Windows)**

### **Option A: Using Scoop (Recommended)**

```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### **Option B: Using Direct Download**

1. Go to: https://github.com/supabase/cli/releases
2. Download `supabase_windows_amd64.zip`
3. Extract and add to PATH, or run from extracted folder

### **Option C: Using npx (No Installation)**

You can use `npx supabase` instead of installing globally.

---

## 🔐 **STEP 2: Login to Supabase**

```bash
supabase login
```

This will open your browser to authenticate.

---

## 🔗 **STEP 3: Link to Your Project**

```bash
supabase link --project-ref your-project-ref
```

**To find your project ref:**
- Go to Supabase Dashboard
- Your project URL is: `https://[project-ref].supabase.co`
- The `[project-ref]` is your project reference

---

## 🗄️ **STEP 4: Run Database Migrations**

```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/` to your database.

---

## 🚀 **STEP 5: Deploy Edge Function**

```bash
supabase functions deploy make-server-2516be19
```

---

## 🔑 **STEP 6: Set Function Secrets**

```bash
# Get these from Supabase Dashboard → Settings → API
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set ENVIRONMENT=development
```

**To find Service Role Key:**
- Go to Supabase Dashboard → Settings → API
- Copy the **service_role** key (⚠️ Keep secret!)

---

## ✅ **STEP 7: Verify Setup**

```bash
# Test the function
curl https://your-project-id.supabase.co/functions/v1/make-server-2516be19/health
```

---

## 📝 **Quick Command Reference**

```bash
# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy migrations
supabase db push

# Deploy function
supabase functions deploy make-server-2516be19

# Set secrets
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set ENVIRONMENT=development

# View logs
supabase functions logs make-server-2516be19
```

---

## 🆘 **Troubleshooting**

**"Command not found"**
- Use `npx supabase` instead of `supabase`
- Or install via Scoop (see Step 1)

**"Project not found"**
- Check your project ref is correct
- Make sure you're logged in: `supabase login`

**"Function deploy failed"**
- Check function code in `supabase/functions/make-server-2516be19/index.ts`
- Check logs: `supabase functions logs make-server-2516be19`

---

**Ready to start? Let's begin with installation!**

