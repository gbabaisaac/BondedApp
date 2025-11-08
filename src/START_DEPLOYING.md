# 🚀 START HERE: Deploy Your App to GitHub + Vercel

## ✅ You're Ready!

All your files are set up. Let's deploy in 3 steps!

---

## 🎯 What You'll Do

1. **Push code to GitHub** (5 min)
2. **Connect Vercel to GitHub** (2 min)
3. **Deploy!** (2 min)

**Total time: 10 minutes**

---

## 📋 Before You Start

### ✅ Check You Have:

- [ ] **Node.js installed** (test with `node -v`)
  - If not: Download from https://nodejs.org
  
- [ ] **Git installed** (test with `git --version`)
  - If not: Download from https://git-scm.com
  
- [ ] **GitHub account** (create at https://github.com/signup)

- [ ] **All your code** in one folder

---

## 🚀 STEP 1: Push to GitHub

### A. Create GitHub Repository

1. **Go to:** https://github.com/new

2. **Fill in:**
   - Repository name: `bonded-app`
   - Description: `Social network for college students`
   - Visibility: **Private** ✅ (recommended for beta)
   
3. **Don't check any boxes** (no README, no .gitignore, no license)

4. **Click "Create repository"**

5. **Keep this page open!** You'll need it in Step B.

---

### B. Push Your Code

**Open Terminal (Mac) or Command Prompt (Windows)**

**Copy and paste these commands ONE BY ONE:**

```bash
# 1. Go to your project folder
cd /path/to/your/bonded/folder
```

**⚠️ REPLACE `/path/to/your/bonded/folder` with your actual folder path!**

**Mac example:**
```bash
cd ~/Downloads/bonded-app
```

**Windows example:**
```bash
cd C:\Users\YourName\Downloads\bonded-app
```

**💡 Tip:** Drag the folder into Terminal to auto-fill the path!

---

**Then run these commands:**

```bash
# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit - bonded app"
```

---

**Now go to your GitHub page (still open from Step A)**

You'll see a section: **"…or push an existing repository from the command line"**

It shows 3 commands like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bonded-app.git
git branch -M main
git push -u origin main
```

**⚠️ Copy those 3 commands from YOUR GitHub page** (they have your username)

**Paste them into Terminal and press Enter**

---

### C. Enter Credentials

**If it asks for username/password:**

**Username:** Your GitHub username

**Password:** Use a **Personal Access Token** (not your actual password!)

**How to get a token:**

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `bonded-app`
4. Expiration: `90 days` (or longer)
5. Check: **`repo`** (full control of private repositories)
6. Scroll down, click **"Generate token"**
7. **Copy the token** (starts with `ghp_...`)
8. **Paste as password in Terminal**

**💡 Save this token somewhere safe!** You can reuse it.

---

### D. Verify Success

1. **Refresh your GitHub repository page**
2. **You should see all your files!** 🎉

If you see your files, you're ready for Step 2!

---

## 🌐 STEP 2: Deploy to Vercel

### A. Sign Up for Vercel

1. **Go to:** https://vercel.com

2. **Click "Sign Up"**

3. **Choose "Continue with GitHub"** ✅ (easiest option!)

4. **Authorize Vercel** to access your GitHub

You'll be redirected to the Vercel dashboard.

---

### B. Import Your Repository

1. **Click "Add New..."** (top right)

2. **Select "Project"**

3. You'll see a list of your GitHub repositories

4. **Find `bonded-app`**

5. **Click "Import"** next to it

---

### C. Configure (Auto-Detected!)

Vercel automatically detects:

- ✅ Framework: **Vite**
- ✅ Root Directory: `./`
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

**You don't need to change anything!**

**Just click the big "Deploy" button!** 🚀

---

### D. Wait for Deployment

You'll see:
- Installing dependencies...
- Building...
- Deploying...

**This takes 2-3 minutes.** Watch the logs scroll by!

---

### E. Success! 🎉

You'll see: **"Congratulations!"** with confetti

**Your app is live!**

You'll get a URL like:
```
https://bonded-app-xyz123.vercel.app
```

**Click "Visit" to see your app!**

---

## 🧪 STEP 3: Test Your App

### A. Open Your App

Click the Vercel URL or copy it into your browser.

---

### B. Test Beta Access

1. **You should see:** Beta Access Gate screen
2. **Enter an email:** ending in `@uri.edu` or `@illinois.edu`
3. **Click "Check Access"**
4. **Should say:** "Access Granted!" ✅

If it works, continue!

---

### C. Create Test Account

1. **Click "Continue"**
2. **Fill in:**
   - Name: Your name
   - Email: test@uri.edu (or your real .edu email)
   - Password: At least 6 characters
3. **Click "Create Account"**

You should be redirected to profile setup!

---

### D. Test Features

- ✅ Upload a profile photo
- ✅ Fill in bio and interests
- ✅ Complete Bond Print quiz
- ✅ Browse discovery feed
- ✅ Try searching

**If everything works:** You're ready to share! 🎉

---

## 📱 Share Your App

### Your Live URL:

```
https://bonded-app.vercel.app
```

(or whatever Vercel assigned you)

---

### Send to Beta Testers:

```
Hey! Check out bonded - new social app for college students!

🔗 https://bonded-app.vercel.app

📱 Add to home screen for best experience:
   • iOS: Share → Add to Home Screen
   • Android: Menu → Add to Home Screen

🎓 Sign up with your @uri.edu or @illinois.edu email

Features:
• Create profile with photos
• AI personality quiz
• Find friends & roommates
• Optional dating mode
• Real-time chat

Let me know what you think!
```

---

## 🎨 Customize Your URL (Optional)

**Default URL:**
```
https://bonded-app-xyz123.vercel.app
```

**Want cleaner URL?**
```
https://bonded-app.vercel.app
```

### How to Change:

1. **In Vercel Dashboard** → Your project
2. **Go to Settings** tab
3. **Click "Domains"** in sidebar
4. **Click "Edit"** next to your production domain
5. **Change to:** `bonded-app`
6. **Click "Save"**

**Note:** Must be unique! If taken, try:
- `bonded-social`
- `getbonded`
- `bonded-beta`

---

## 🔄 How to Update Your App Later

**Made changes to your code?**

```bash
# 1. Add changes
git add .

# 2. Commit
git commit -m "Description of what you changed"

# 3. Push to GitHub
git push
```

**Vercel automatically detects the push and redeploys!** ✨

Check Vercel dashboard to watch the deployment.

---

## ✅ Deployment Checklist

### GitHub:
- [ ] Created GitHub repository
- [ ] Ran `git init` in project folder
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "..."`
- [ ] Added remote with `git remote add origin ...`
- [ ] Pushed with `git push -u origin main`
- [ ] Can see files on GitHub

### Vercel:
- [ ] Signed up for Vercel
- [ ] Connected GitHub account
- [ ] Imported `bonded-app` repository
- [ ] Clicked "Deploy"
- [ ] Deployment succeeded
- [ ] Got Vercel URL
- [ ] Opened URL in browser

### Testing:
- [ ] Beta access gate shows up
- [ ] Can enter @uri.edu email
- [ ] Access granted message appears
- [ ] Can create account
- [ ] Can upload photos
- [ ] Can browse profiles
- [ ] Everything works! 🎉

### Sharing:
- [ ] Copied Vercel URL
- [ ] Tested on mobile
- [ ] Ready to share with beta testers

---

## 🆘 Need Help?

### Can't push to GitHub?
**See:** `/GITHUB_DEPLOY_GUIDE.md` (detailed troubleshooting)

### Build failed on Vercel?
**Check:** Build logs in Vercel dashboard for error messages

### App works locally but not on Vercel?
**Check:** Browser console (F12) for JavaScript errors

### More help?
**See these guides:**
- `/DEPLOY_COMMANDS.md` - Quick command reference
- `/TROUBLESHOOTING.md` - Common issues
- `/README.md` - Full documentation

---

## 🎉 You're Done!

**You now have:**
- ✅ Code on GitHub (version control)
- ✅ Live app on Vercel (auto-deployment)
- ✅ Professional URL (no Figma visibility)
- ✅ Beta access working
- ✅ Ready to share with users!

**Next:**
1. Share with 5-10 beta testers
2. Collect feedback
3. Make improvements
4. Push updates (auto-deploys!)

---

## 🔗 Your Links

**GitHub Repository:**
```
https://github.com/YOUR_USERNAME/bonded-app
```

**Vercel Dashboard:**
```
https://vercel.com/YOUR_USERNAME/bonded-app
```

**Live App:**
```
https://bonded-app.vercel.app
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/wmlklvlnxftedtylgxsc
```

---

## 🚀 Ready? Let's Deploy!

**Start with Step 1:** Create GitHub repository → https://github.com/new

**Then follow the steps above!**

**You'll be live in 10 minutes!** ⚡

---

**Good luck! You got this! 🎉**
