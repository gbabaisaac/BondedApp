# ⚡ Deploy Commands Cheat Sheet

## Copy & Paste These Commands

---

## Step 1: Create GitHub Repo

**Go to:** https://github.com/new

- Repository name: `bonded-app`
- Visibility: Private (recommended)
- Don't check any boxes
- Click "Create repository"

---

## Step 2: Push Code to GitHub

**Open Terminal/Command Prompt and run these:**

```bash
# Navigate to your project folder
cd /path/to/your/bonded/folder

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - bonded app"

# Add GitHub remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/bonded-app.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

**If it asks for password:** Use a Personal Access Token
- Get one here: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Check "repo" box
- Copy the token and use it as password

---

## Step 3: Deploy to Vercel

**Go to:** https://vercel.com

1. Sign up/login with GitHub
2. Click "Add New..." → "Project"
3. Import `bonded-app` repository
4. Click "Deploy"
5. Wait 2-3 minutes
6. Done! 🎉

**Your app will be at:**
```
https://bonded-app.vercel.app
```

---

## Future Updates

**Every time you make changes:**

```bash
# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

**Vercel auto-deploys!** ✨

---

## Quick Reference

```bash
# Check status
git status

# See what changed
git diff

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo all uncommitted changes
git reset --hard
```

---

## 🎯 The Complete Flow

### First Time Setup:
1. Create GitHub repo → https://github.com/new
2. Run the git commands above ☝️
3. Deploy to Vercel → https://vercel.com

### Every Update After:
```bash
git add .
git commit -m "Your message"
git push
```

**That's it!** 🚀

---

## 📱 Test Your Deployed App

**Your URL:** `https://bonded-app.vercel.app`

1. Open the URL
2. Enter a @uri.edu or @illinois.edu email
3. Create account
4. Test features
5. Share with beta testers!

---

## ⚠️ Common Issues

### "git: command not found"
**Install Git:** https://git-scm.com/downloads

### "Permission denied"
**Use HTTPS instead of SSH:**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/bonded-app.git
```

### "Build failed on Vercel"
**Check Vercel build logs:**
1. Go to Vercel dashboard
2. Click your project
3. Click the failed deployment
4. Read the error message
5. Fix the issue in code
6. Push again

---

## ✅ Success Checklist

- [ ] Created GitHub repository
- [ ] Ran `git init`
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "..."`
- [ ] Added remote with `git remote add origin ...`
- [ ] Pushed with `git push -u origin main`
- [ ] Went to Vercel.com
- [ ] Imported repository
- [ ] Clicked Deploy
- [ ] Got Vercel URL
- [ ] Tested the app
- [ ] App works! 🎉

---

**Copy the commands above and you'll be deployed in 5 minutes!** ⚡
