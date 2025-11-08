# 🚀 How to Access Your bonded App

## ⚡ Quick Answer

**You're in Figma Make!** Your app is already running here. Here's how to access it:

---

## 📱 Step-by-Step Access Instructions

### Step 1: Find the Preview Button
In your Figma Make interface, look for one of these buttons:
- **"Preview"** button (usually top-right corner)
- **"Run"** button
- **"Open in browser"** button
- A **play icon** ▶️

### Step 2: Click It!
When you click the preview button:
- A new browser tab/window will open
- You'll see your **bonded** app with the beta gate
- This is your live app! 🎉

### Step 3: Get Your App URL
- Look at the URL bar in that new window
- Copy the entire URL
- It will look something like:
  ```
  https://make-[something].figma.com/...
  ```
  or
  ```
  https://[project-name].figma-make.com/...
  ```

### Step 4: Share That URL
- Send that URL to your beta testers
- They can bookmark it
- They can add it to their home screen on mobile

---

## 🧪 Test Your App RIGHT NOW

### In Figma Make:
1. Click **Preview** button
2. You should see the **beta access gate**
3. Enter an email ending in **@uri.edu** or **@illinois.edu**
4. Click "Check Access"
5. You're in! Create an account! 🎉

---

## 📱 For Beta Testers

Once you have your app URL from the Preview button, send this to testers:

```
Hey! Check out bonded - new social app for college students!

🔗 Link: [PASTE YOUR FIGMA MAKE PREVIEW URL HERE]

📱 Add to home screen for the best experience!

🎓 Sign up with your @uri.edu or @illinois.edu email

Features:
- Create profile with photos
- AI personality quiz (Bond Print)
- Find friends & roommates
- Love Mode for dating (optional)
- Real-time messaging

Let me know what you think!
```

---

## ❓ Common Questions

### Q: Why can't I use the Supabase URL?
**A:** That URL (`https://wmlklvlnxftedtylgxsc.supabase.co/...`) is **only your backend API**, not the frontend app. Your React app is hosted in Figma Make and talks to that backend.

Think of it like:
- **Figma Make URL** = Your website (frontend) ✅
- **Supabase URL** = Your database/API (backend) 🔧

### Q: Where is the Preview button?
**A:** In Figma Make, it's usually:
- Top-right corner of the interface
- Near the "Share" or "Deploy" buttons
- May have a play icon ▶️
- May say "Preview", "Run", or "Test"

### Q: Can I deploy this elsewhere?
**A:** Yes! Eventually you can:
- Export the code
- Deploy to Vercel, Netlify, or Cloudflare Pages
- But for now, Figma Make hosting works great for beta testing!

### Q: How do I share the app?
**A:** 
1. Click Preview in Figma Make
2. Copy the URL from the browser
3. Send that URL to anyone
4. They can access it if they have a beta email

---

## 🎯 Architecture Overview

Your app works like this:

```
User's Browser
    ↓
[Your Figma Make Preview URL]
    ↓ (React App)
    ↓
Makes API calls to
    ↓
[Supabase Backend]
wmlklvlnxftedtylgxsc.supabase.co
    ↓
Stores data in Postgres & Storage
```

**So:**
- Users visit your **Figma Make URL** (the frontend)
- The app makes requests to **Supabase** (the backend)
- Data is stored and retrieved from Supabase

---

## 🔧 Technical Details

### Frontend (What users see)
- **Location:** Figma Make hosting
- **Technology:** React + TypeScript + Tailwind
- **URL:** Your Figma Make preview URL
- **Access:** Anyone with the link (gated by beta emails)

### Backend (Behind the scenes)
- **Location:** Supabase Edge Functions
- **Technology:** Deno + Hono web server
- **URL:** `wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19`
- **Access:** Only accessible via API calls (has authorization)

### Database & Storage
- **Location:** Supabase Postgres + Storage
- **Project ID:** wmlklvlnxftedtylgxsc
- **Dashboard:** https://supabase.com/dashboard/project/wmlklvlnxftedtylgxsc

---

## ✅ Success Checklist

You've successfully accessed your app when:
- [ ] You clicked Preview in Figma Make
- [ ] A new browser window opened
- [ ] You see the "bonded" beta gate screen
- [ ] You can enter a @uri.edu or @illinois.edu email
- [ ] You can click "Check Access" and get in
- [ ] You can create an account and see the profile setup

---

## 🚀 Next Steps

1. **Access your app** via Figma Make Preview
2. **Copy the URL** from the browser
3. **Test it yourself** with a @uri.edu email
4. **Share with 5 friends** from URI or UIUC
5. **Collect feedback** over 2-3 days
6. **Iterate and improve!**

---

## 📧 Need the URL Right Now?

**Do this:**
1. Look at your Figma Make window
2. Find and click the **Preview** button
3. A new tab opens - that's your app!
4. Copy the URL and you're done!

**Can't find Preview button?** Look for:
- ▶️ Play icon
- "Run" button
- "Test" button
- "Open" button

It's there - you got this! 🎉

---

## 💡 Pro Tips

### For Mobile Testing
Once you have your URL:
1. Open it on your phone
2. Add to home screen
3. Opens like a native app!

### For Beta Testing
- Start with 5-10 close friends
- Ask them to test everything
- Fix critical bugs quickly
- Expand to 20-50 users
- Monitor usage and feedback

### For Monitoring
Check Supabase Dashboard:
- See how many users signed up
- Check storage for uploaded photos
- Monitor API usage
- View error logs

---

**Your app is ready! Click Preview and start testing! 🚀**
