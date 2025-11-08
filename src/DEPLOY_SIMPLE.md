# ⚡ Super Simple Deployment (3 Minutes)

## 🎯 Fastest Way to Get Your App Live

No GitHub, no command line, no complexity. Just drag and drop!

---

## Option 1: Netlify Drop (Easiest - 3 min)

### Step 1: Build Your App

**If you have Node.js installed:**

```bash
# Open Terminal/Command Prompt
# Navigate to your project folder
cd path/to/bonded-app

# Install dependencies
npm install

# Build the app
npm run build
```

This creates a `dist` folder.

**If you DON'T have Node.js:**

Skip to Option 2 below (Figma Make Export)

### Step 2: Deploy to Netlify

1. **Go to:** https://app.netlify.com/drop
2. **Sign up** (free account with email)
3. **Drag your `dist` folder** onto the upload area
4. **Wait 30 seconds**
5. **Done!** You get a URL like: `random-name-123.netlify.app`

### Step 3: Customize Your URL (Optional)

1. In Netlify Dashboard → Site settings → Change site name
2. Change to: `bonded-app`
3. Your new URL: `bonded-app.netlify.app`

### Step 4: Share!

Send your beta testers: `https://bonded-app.netlify.app`

---

## Option 2: Export from Figma Make

### Step 1: Export Your Code

1. In Figma Make → Click **"Export"** or **"Download"**
2. Download as ZIP
3. Extract the ZIP file
4. You should see all your files (`App.tsx`, `components/`, etc.)

### Step 2: Add Build Files

Copy these files into your extracted folder:

I've already created:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `main.tsx`
- `vercel.json`
- `.gitignore`

They're in your Figma Make project - just copy them to your local folder.

### Step 3: Build Locally

```bash
# Open Terminal in your project folder
npm install
npm run build
```

### Step 4: Deploy to Netlify

1. Go to: https://app.netlify.com/drop
2. Drag the `dist` folder
3. Done!

---

## Option 3: Use Vercel Drop (Also Easy)

### Same as Netlify:

1. Build your app: `npm run build`
2. Go to: https://vercel.com/new
3. Click "Browse" under drag & drop
4. Select your `dist` folder
5. Click "Deploy"
6. Done!

---

## 🎯 Which Should I Use?

### Netlify Drop ⭐ (Recommended)
- ✅ Easiest drag & drop
- ✅ Free tier is generous
- ✅ Auto SSL
- ✅ Great for beta testing

### Vercel
- ✅ Slightly faster
- ✅ Better analytics
- ✅ Popular choice

### Both are FREE and work great!

---

## 📱 After Deployment

### Your App URL

You'll get a URL like:
- Netlify: `https://bonded-app.netlify.app`
- Vercel: `https://bonded-app.vercel.app`

### Test It

1. Open your new URL
2. See the beta access gate
3. Enter a @uri.edu email
4. Create an account
5. ✅ Everything works!

### Share It

Send to beta testers:

```
Check out bonded!

🔗 https://bonded-app.netlify.app

Use your @uri.edu or @illinois.edu email to sign up!

📱 Add to home screen for best experience
```

---

## 🔄 How to Update Your App

### If you made code changes:

1. **Rebuild:**
   ```bash
   npm run build
   ```

2. **Drag the new `dist` folder** to Netlify/Vercel drop again

3. **Done!** Your app updates instantly

**Tip:** For easier updates later, consider setting up GitHub deployment (see `/DEPLOY_TO_VERCEL.md`)

---

## 🐛 Common Issues

### "npm: command not found"

**You need Node.js:**
1. Download from: https://nodejs.org
2. Install it
3. Restart Terminal
4. Try `npm install` again

### "Build failed"

**Check for errors:**
```bash
npm install
npm run build
```

Look for red error messages and fix them.

### "App shows blank page"

**Check browser console:**
1. Right-click on page → Inspect
2. Look at Console tab
3. See what errors show up
4. Usually a missing import or file

---

## ✅ Success Checklist

You're ready to share when:

- [ ] App deploys successfully
- [ ] You can access it at your Netlify/Vercel URL
- [ ] Beta gate shows up
- [ ] You can sign up with @uri.edu email
- [ ] Profile creation works
- [ ] Photos upload successfully
- [ ] App works on mobile

---

## 🎉 That's It!

In 3 simple steps:

1. ✅ **Build:** `npm run build`
2. ✅ **Drop:** Drag `dist` to https://app.netlify.com/drop
3. ✅ **Share:** Send URL to beta testers

**No Figma visibility. No complex setup. Just works!** 🚀

---

## 📞 Need Help?

### Can't build the app?
- Make sure Node.js is installed
- Run `npm install` first
- Check for error messages

### Can't deploy?
- Try Netlify Drop instead of Vercel (or vice versa)
- Make sure you're dragging the `dist` folder, not the whole project

### App doesn't work after deploy?
- Check Supabase URL and keys are correct
- Test in Figma Make first to confirm it works
- Check browser console for errors

---

**Choose Netlify Drop and get your app live in 3 minutes! 🎯**
