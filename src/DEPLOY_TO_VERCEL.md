# 🚀 Deploy bonded to Vercel (10 Minutes)

## Why Vercel?

✅ **Free tier** (perfect for beta testing)  
✅ **Custom domain** (bonded-app.vercel.app)  
✅ **Auto SSL/HTTPS** (secure by default)  
✅ **No Figma visibility** (beta testers only see the app)  
✅ **Easy updates** (push code, auto-deploy)  
✅ **Fast global CDN** (instant loading worldwide)

---

## ✅ Files Created for Deployment

I've created all the files you need:

- ✅ `package.json` - Dependencies
- ✅ `vite.config.ts` - Build configuration
- ✅ `tsconfig.json` - TypeScript config
- ✅ `index.html` - HTML entry point
- ✅ `main.tsx` - React entry point
- ✅ `vercel.json` - Vercel deployment config
- ✅ `.gitignore` - Files to exclude
- ✅ `favicon.svg` - App icon

**Your app is now ready to deploy!**

---

## 🎯 Deployment Options

### Option 1: Deploy via Vercel Dashboard (Easiest - 10 min)

**Step 1: Export Your Code from Figma Make**

1. In Figma Make, look for **"Export"** or **"Download"** button
2. Download as ZIP file
3. Extract to a folder on your computer

**Step 2: Sign Up for Vercel**

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended) or email
4. Complete the signup process

**Step 3: Create GitHub Repository (if using GitHub)**

1. Go to **https://github.com/new**
2. Repository name: `bonded-app`
3. Make it **Private** (recommended for beta)
4. Click **"Create repository"**
5. Follow the instructions to upload your code:

```bash
# In your project folder (Terminal/Command Prompt):
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bonded-app.git
git push -u origin main
```

**Step 4: Deploy to Vercel**

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your **bonded-app** repository
4. Vercel will auto-detect it's a Vite app
5. Click **"Deploy"**
6. Wait 2-3 minutes for deployment
7. You'll get a URL like: **`bonded-app.vercel.app`**

**Step 5: Test Your App**

1. Visit your Vercel URL
2. You should see the beta access gate
3. Test with a @uri.edu or @illinois.edu email
4. Share the URL with beta testers! 🎉

---

### Option 2: Deploy via Vercel CLI (Advanced - 5 min)

**Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: Login to Vercel**

```bash
vercel login
```

**Step 3: Deploy**

```bash
# Navigate to your project folder
cd path/to/bonded-app

# Deploy!
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your username
# - Link to existing project? No
# - Project name? bonded-app
# - Directory? ./ (just press Enter)
# - Override settings? No
```

**Step 4: Get Your URL**

After deployment completes, you'll see:

```
✅ Deployment ready
🔗 https://bonded-app.vercel.app
```

**That's your live app URL!**

---

### Option 3: Deploy Without GitHub (Drag & Drop)

**Step 1: Install Dependencies & Build**

```bash
# Navigate to your project folder
cd path/to/bonded-app

# Install dependencies
npm install

# Build the app
npm run build
```

This creates a `dist` folder with your built app.

**Step 2: Deploy the `dist` folder**

1. Go to **https://vercel.com/new**
2. Click **"Browse"** under "Or drop your project files here"
3. Select your **`dist`** folder
4. Click **"Deploy"**
5. Wait for deployment
6. Get your URL!

---

## 🔧 Post-Deployment Setup

### 1. Custom Domain (Optional)

**Free Vercel Domain:**
- Default: `bonded-app.vercel.app`
- You can change it in Vercel Dashboard → Settings → Domains

**Custom Domain (e.g., bonded.app):**
1. Buy domain from Namecheap, GoDaddy, etc.
2. In Vercel: Settings → Domains → Add Domain
3. Follow DNS setup instructions
4. Wait 24-48 hours for DNS propagation

### 2. Environment Variables (If Needed)

Your Supabase keys are hardcoded in `/utils/supabase/info.tsx`, so you're good!

But if you want to use environment variables:

1. In Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your public anon key
3. Update `/utils/supabase/info.tsx`:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "wmlklvlnxftedtylgxsc";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-key-here";
```

4. Redeploy

### 3. Analytics (Optional)

Vercel has built-in analytics:

1. Go to your project in Vercel Dashboard
2. Click **"Analytics"** tab
3. Enable **Web Analytics**
4. See page views, unique visitors, etc.

---

## 📱 Share Your App

### Your New App URL

After deployment, share this URL:

```
https://bonded-app.vercel.app
```

(or whatever Vercel assigned you)

### Beta Tester Instructions

Send this message:

```
Hey! Check out bonded - new social app for college students!

🔗 Link: https://bonded-app.vercel.app

📱 Add to home screen:
   iOS: Share → Add to Home Screen
   Android: Menu → Add to Home screen

🎓 Sign up with your @uri.edu or @illinois.edu email

Features:
- Create profile with photos
- AI personality quiz
- Find friends & roommates
- Optional dating mode
- Real-time messaging

Let me know what you think!
```

---

## 🔄 Update Your App

### If Using GitHub:

```bash
# Make changes to your code
# Then commit and push:

git add .
git commit -m "Updated feature X"
git push

# Vercel auto-deploys! ✨
# Check deployment status in Vercel Dashboard
```

### If Using Vercel CLI:

```bash
# Make changes to your code
# Then redeploy:

vercel --prod
```

### If Using Drag & Drop:

```bash
# Rebuild
npm run build

# Drag the new `dist` folder to Vercel
# Or use the Vercel CLI method above
```

---

## 🎯 Deployment Checklist

Before sharing with beta testers:

- [ ] App deploys successfully
- [ ] Beta gate works (test with @uri.edu email)
- [ ] Sign up flow works
- [ ] Photo upload works
- [ ] Bond Print quiz works
- [ ] Profile browsing works
- [ ] Messaging works
- [ ] Love Mode works (optional)
- [ ] Mobile responsive (test on phone)
- [ ] Add to home screen works (iOS & Android)

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Cannot find module 'X'`

**Fix:** Install missing dependency:
```bash
npm install X
```

### App Won't Load

**Error:** Blank white screen

**Fix:** Check browser console for errors
- Right-click → Inspect → Console
- Look for red error messages
- Usually a missing import or configuration issue

### Photos Won't Upload

**Check:**
1. Supabase Storage bucket exists
2. Supabase URL and keys are correct
3. CORS is enabled in Supabase

### Beta Gate Not Working

**Check:**
1. `/components/BetaAccessGate.tsx` has correct emails
2. App rebuilt after changes (`npm run build`)
3. New build deployed to Vercel

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Beta)

**Vercel Free:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Custom domain
- **Cost: $0/month**

**Supabase Free:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- **Cost: $0/month**

**Total: $0/month** for up to ~500 users

### When to Upgrade

**Vercel Pro ($20/month):**
- 1 TB bandwidth
- Better performance
- Priority support
- **Upgrade when:** 500+ active users

**Supabase Pro ($25/month):**
- 8 GB database
- 100 GB storage
- 50 GB bandwidth
- **Upgrade when:** 1000+ users or heavy usage

---

## 🚀 Next Steps

1. **Deploy to Vercel** (follow Option 1, 2, or 3 above)
2. **Test your app** at your new Vercel URL
3. **Share with 5-10 beta testers** from URI or UIUC
4. **Collect feedback** for 2-3 days
5. **Iterate and improve**
6. **Expand to more users**

---

## 📧 Your New App Info

**After deployment, you'll have:**

✅ **Live URL:** `https://bonded-app.vercel.app`  
✅ **No Figma visibility** - Just the app  
✅ **Professional domain** - Looks legit  
✅ **Auto HTTPS** - Secure  
✅ **Fast loading** - Global CDN  
✅ **Easy updates** - Push code, auto-deploy  

**Beta schools enabled:**
- University of Rhode Island (@uri.edu)
- University of Illinois (@illinois.edu)
- Stanford (@stanford.edu)
- UC Berkeley (@berkeley.edu)

---

## 🎉 You're Ready!

Choose your deployment method above and follow the steps.

In 10 minutes, you'll have a **production-ready app** with a clean URL to share!

**Recommended:** Use **Option 1** (GitHub + Vercel Dashboard) for easiest ongoing updates.

Good luck! 🚀
