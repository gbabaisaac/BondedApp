# 🚀 Deploy bonded to GitHub + Vercel

## Step-by-Step Guide (10 Minutes)

---

## Part 1: Create GitHub Repository (2 min)

### Step 1: Go to GitHub

1. Open: **https://github.com/new**
2. Log in if needed (or create free account)

### Step 2: Create Repository

Fill in the form:
- **Repository name:** `bonded-app`
- **Description:** `Social network for college students`
- **Visibility:** Choose one:
  - ✅ **Private** (recommended for beta) - only you can see it
  - ⚪ **Public** - anyone can see the code
- **Initialize repository:** ❌ LEAVE ALL UNCHECKED
  - Don't add README
  - Don't add .gitignore
  - Don't add license

### Step 3: Click "Create repository"

You'll see a page with instructions. **Keep this page open!**

---

## Part 2: Push Your Code to GitHub (5 min)

### Step 1: Open Terminal/Command Prompt

**Mac:**
- Press `Cmd + Space`
- Type `terminal`
- Press Enter

**Windows:**
- Press `Win + R`
- Type `cmd`
- Press Enter

### Step 2: Navigate to Your Project

```bash
# Replace this path with your actual project location
cd /path/to/your/bonded/folder

# Example on Mac:
# cd ~/Downloads/bonded-app

# Example on Windows:
# cd C:\Users\YourName\Downloads\bonded-app
```

**Tip:** You can drag the folder into Terminal to auto-fill the path!

### Step 3: Initialize Git

```bash
git init
```

You should see: `Initialized empty Git repository`

### Step 4: Add All Files

```bash
git add .
```

This adds all your files to be committed.

### Step 5: Commit Your Files

```bash
git commit -m "Initial commit - bonded app"
```

### Step 6: Connect to GitHub

Go back to the GitHub page that's still open. Copy the commands under **"…or push an existing repository from the command line"**

It will look like this (but with YOUR username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/bonded-app.git
git branch -M main
git push -u origin main
```

**Copy those 3 lines from YOUR GitHub page** and paste them into Terminal, then press Enter.

### Step 7: Enter GitHub Credentials

You'll be asked to log in:

**Option 1: Personal Access Token (Recommended)**

If GitHub asks for password:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: `bonded-app`
4. Check: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Paste it as your password in Terminal

**Option 2: GitHub CLI**

Or use GitHub CLI (easier):
```bash
# Install GitHub CLI first: https://cli.github.com
gh auth login
# Follow the prompts
```

### Step 8: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files! 🎉

---

## Part 3: Deploy to Vercel (3 min)

### Step 1: Go to Vercel

1. Open: **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (easiest!)
4. Authorize Vercel to access GitHub

### Step 2: Import Your Repository

1. You'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. Find **`bonded-app`** and click **"Import"**

### Step 3: Configure Project

Vercel will auto-detect everything:

**Framework Preset:** Vite ✅ (auto-detected)  
**Root Directory:** `./` ✅  
**Build Command:** `npm run build` ✅  
**Output Directory:** `dist` ✅  

**You don't need to change anything!**

### Step 4: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes (watch the build logs)
3. You'll see: **"Congratulations! 🎉"**

### Step 5: Get Your URL

You'll get a URL like:
```
https://bonded-app.vercel.app
```

Or:
```
https://bonded-app-xyz123.vercel.app
```

**Click "Visit"** to test your app!

---

## Part 4: Test Your Deployed App (2 min)

### Step 1: Open Your Vercel URL

Click the link Vercel gave you.

### Step 2: Test Beta Access

1. You should see the beta access gate
2. Enter an email ending in `@uri.edu` or `@illinois.edu`
3. Click "Check Access"
4. Should say "Access Granted!" ✅

### Step 3: Create Account

1. Click "Continue"
2. Fill in name, email, password
3. Click "Create Account"
4. Should redirect to profile setup! ✅

### Step 4: Test Key Features

- ✅ Upload profile photo
- ✅ Complete Bond Print quiz
- ✅ Browse discovery feed
- ✅ Test search and filters

**If everything works:** You're ready to share! 🎉

---

## Part 5: Customize Your Vercel URL (Optional)

### Make it prettier!

**Default URL:**
```
https://bonded-app-xyz123.vercel.app
```

**Custom URL:**
```
https://bonded-app.vercel.app
```

### How to Change:

1. In Vercel Dashboard → Your project
2. Go to **Settings** tab
3. Click **Domains** in sidebar
4. Under "Production Domains"
5. Click **Edit** next to your domain
6. Change to: `bonded-app`
7. Click **Save**

**Note:** Must be unique across all Vercel!

If `bonded-app` is taken, try:
- `bonded-social`
- `bonded-network`
- `getbonded`
- `bonded-beta`
- `bonded-xyz` (your initials)

---

## 🔄 How to Update Your App

### When You Make Changes:

```bash
# 1. Make your changes in the code
# 2. Commit the changes
git add .
git commit -m "Description of what you changed"

# 3. Push to GitHub
git push

# 4. Vercel auto-deploys! ✨
# Check Vercel dashboard to watch the deployment
```

**That's it!** Every time you push to GitHub, Vercel automatically rebuilds and redeploys your app.

---

## 📱 Share Your App

### Send This to Beta Testers:

```
Hey! Check out bonded - new social app for college students!

🔗 https://bonded-app.vercel.app

📱 Works best on mobile - add to home screen:
   • iOS: Share → Add to Home Screen
   • Android: Menu → Add to Home Screen

🎓 Sign up with your @uri.edu or @illinois.edu email

Features:
• Create profile with photos
• AI personality quiz (Bond Print)
• Find friends & roommates
• Optional dating mode (Love Mode)
• Real-time messaging

Let me know what you think!
```

---

## 🎯 Deployment Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Connected Vercel to GitHub
- [ ] Deployed to Vercel
- [ ] Got your Vercel URL
- [ ] Tested beta access gate
- [ ] Created a test account
- [ ] Verified all features work
- [ ] Customized Vercel URL (optional)
- [ ] Shared with beta testers

---

## 🐛 Troubleshooting

### Git Issues

**"git: command not found"**
```bash
# Install Git
# Mac: Download from https://git-scm.com/download/mac
# Windows: Download from https://git-scm.com/download/win
```

**"Permission denied (publickey)"**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/bonded-app.git
```

**"Repository not found"**
```bash
# Check the repository URL is correct
git remote -v
# Should show your GitHub username and repository name
```

### Vercel Build Errors

**"Build failed"**

1. Check the build logs in Vercel dashboard
2. Look for red error messages
3. Common issues:
   - Missing dependencies → Add to `package.json`
   - TypeScript errors → Fix in code
   - Environment variables → Add in Vercel settings

**"Cannot find module"**

1. Make sure `package.json` includes the package
2. Try redeploying (click "Redeploy" in Vercel)

**"Build succeeded but app shows blank page"**

1. Open browser console (F12)
2. Look for JavaScript errors
3. Usually a missing import or wrong path
4. Check that all imports use correct paths

### App Issues After Deploy

**"Beta access not working"**

Check `/components/BetaAccessGate.tsx` line 15 has:
```typescript
const allowedDomains = ['uri.edu', 'illinois.edu', 'stanford.edu', 'berkeley.edu'];
```

**"Photos won't upload"**

1. Check Supabase dashboard
2. Verify Storage bucket exists: `make-2516be19-profiles`
3. Check CORS settings in Supabase

**"Messages not sending"**

1. Check Supabase Edge Function is running
2. Test the API: `https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health`
3. Check browser console for errors

---

## 🔒 Environment Variables (If Needed)

Your Supabase keys are hardcoded in `/utils/supabase/info.tsx`, so you're all set!

But if you want to use environment variables later:

### In Vercel Dashboard:

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = `https://wmlklvlnxftedtylgxsc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `[your anon key]`
4. Click **Save**
5. Redeploy

### In Your Code:

Update `/utils/supabase/info.tsx`:
```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "wmlklvlnxftedtylgxsc";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-fallback-key";
```

---

## 📊 Monitor Your App

### Vercel Analytics

1. In Vercel Dashboard → Your project
2. Click **Analytics** tab
3. See:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Supabase Monitoring

1. Go to Supabase Dashboard
2. Click **Database** → See user signups
3. Click **Storage** → See uploaded photos
4. Click **Logs** → See API requests

---

## 💰 Cost

**Free Tier:**
- Vercel: 100 GB bandwidth/month
- Supabase: 500 MB database, 1 GB storage
- **Total: $0/month** for ~500 users

**When to Upgrade:**
- Vercel Pro ($20/mo): 1000+ active users
- Supabase Pro ($25/mo): Heavy database usage

---

## 🎉 Success!

You now have:
- ✅ Code on GitHub (version control)
- ✅ Auto-deployment from Vercel
- ✅ Live app with clean URL
- ✅ No Figma visibility for users
- ✅ Professional deployment setup

**Next Steps:**
1. Share with 5-10 beta testers
2. Collect feedback
3. Make improvements
4. Push updates to GitHub
5. Vercel auto-deploys!

---

## 🔗 Important Links

**Your GitHub Repo:**
```
https://github.com/YOUR_USERNAME/bonded-app
```

**Your Vercel Project:**
```
https://vercel.com/YOUR_USERNAME/bonded-app
```

**Your Live App:**
```
https://bonded-app.vercel.app
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/wmlklvlnxftedtylgxsc
```

---

## 📞 Quick Commands Reference

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub (auto-deploys to Vercel)
git push

# Pull latest changes
git pull

# View git history
git log --oneline
```

---

## ✨ Pro Tips

### 1. Use Branches for New Features

```bash
# Create a new branch
git checkout -b feature-name

# Make changes, commit
git add .
git commit -m "Added feature X"

# Push branch
git push -u origin feature-name

# In Vercel, this creates a preview deployment!
# Test it before merging to main
```

### 2. Enable Vercel Preview Deployments

- Every branch gets its own preview URL
- Test features before going live
- Share preview links with team

### 3. Add Custom Domain

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel → Settings → Domains
3. Add your domain: `bonded.app`
4. Follow DNS setup instructions
5. Wait 24-48 hours for propagation

---

**You're ready to deploy! Follow the steps above and you'll be live in 10 minutes!** 🚀
