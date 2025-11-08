# ⚡ Quick Test Guide - 5 Minute App Walkthrough

## 🎯 Test Your App Right Now

### Step 1: Beta Access (30 seconds)

1. **Update beta emails** in `/components/BetaAccessGate.tsx`:
```typescript
const BETA_EMAILS = [
  'yourname@youruniversity.edu',  // ← Add your email
  '@stanford.edu',  // Allow all Stanford users
];
```

2. **Refresh your app** - You should see the beta gate

3. **Enter your .edu email** - You should get access

---

### Step 2: Create Account (2 minutes)

**Sign Up Flow:**
```
1. Enter email: test@stanford.edu
2. Enter password: password123
3. Enter name: Test User
4. Click "Create Account"
```

**Expected:** You see the onboarding wizard

---

### Step 3: Complete Profile (3 minutes)

**Onboarding Steps:**

**✅ Step 1: School**
- Select "Stanford University" (or your school)
- Click Next

**✅ Step 2: Basic Info**
- Name: Test User
- Age: 20
- Major: Computer Science
- Year: Junior
- Click Next

**✅ Step 3: Photos**
- Click "Upload Photos"
- Select 1-3 photos
- Wait for upload
- Click Next

**✅ Step 4: Interests**
- Select at least 3 interests
- Examples: Music, Fitness, Tech
- Click Next

**✅ Step 5: Personality**
- Select at least 3 traits
- Examples: Outgoing, Creative, Driven
- Click Next

**✅ Step 6: Living Habits**
- Sleep Schedule: Night Owl
- Cleanliness: Organized
- Guests: Sometimes
- Noise Level: Moderate
- Click Next

**✅ Step 7: Bio**
- Write 20+ characters
- Example: "CS major looking for friends and study partners!"
- Click Next

**✅ Step 8: Looking For**
- Select at least 1 option
- Examples: Make Friends, Find a Roommate
- Click "Complete Profile"

**Expected:** You see the Bond Print quiz intro

---

### Step 4: Bond Print Quiz (3 minutes)

**Quiz Flow:**
```
1. Click "Start Bond Print Quiz"
2. Answer 8 questions (select any option)
3. Wait for AI to generate your results
4. View your Bond Print
5. Click "Continue to App"
```

**Expected:** You enter the main app (Friend Mode)

---

### Step 5: Explore Friend Mode (2 minutes)

**Test Each Tab:**

**📱 Discover Tab (should be active)**
- See grid of profile cards
- Search for profiles
- Filter by interests
- Tap a profile to view details
- Swipe between profiles

**👥 Connections Tab**
- See 3 tabs: Pending, Sent, Friends
- Should be empty (new account)

**💬 Messages Tab**
- Should show "No chats yet"
- Explains you need connections first

**👤 Profile Tab**
- See your profile
- Try "Edit Profile"
- Check Settings
- Toggle Love Mode

---

### Step 6: Send Connection Request (2 minutes)

**From Discover Tab:**
```
1. Tap any profile card
2. View their full profile
3. Click "Send Soft Intro" button
4. Write a personal message
5. Click "Send Request"
```

**Expected:** 
- Toast notification: "Connection request sent!"
- Request appears in "Sent" tab

---

### Step 7: Test Love Mode (3 minutes)

**Toggle to Love Mode:**
```
1. Go to Profile tab
2. Find Love Mode toggle at top
3. Toggle it ON
4. Complete 3-step onboarding:
   - Read intro
   - Set preferences
   - Confirm activation
5. See rating interface
```

**Rate Profiles:**
```
1. View profile photo
2. Rate 1-10 (try rating 8 or 9)
3. Profile slides away
4. Next profile appears
5. Rate 5-10 profiles
```

**Expected:**
- Smooth card animations
- Ratings are saved
- See "Matches" tab appear

---

### Step 8: Test With Second Account (5 minutes)

**Create Second Account:**
```
1. Open app in incognito/private window
2. Sign up with different email
3. Complete profile (can skip Bond Print)
4. Go to Friend Mode
```

**Test Connection Flow:**
```
Account 1: Send connection request to Account 2
Account 2: Check "Connections" → "Pending" tab
Account 2: Click "Accept"

Expected: Chat automatically created
```

**Test Messaging:**
```
Account 2: Go to Messages tab
Account 2: Open the new chat
Account 2: Send a message
Account 1: Refresh Messages tab
Account 1: See new message appear
Account 1: Reply

Expected: Messages appear in both accounts
```

**Test Love Mode Match:**
```
Account 1: Toggle to Love Mode
Account 1: Rate Account 2 profile (give it 8+)
Account 2: Toggle to Love Mode  
Account 2: Rate Account 1 profile (give it 8+)

Expected: 
- Both see "New Match!" notification
- Match appears in Matches tab
- Anonymous chat is created
```

---

## ✅ Success Checklist

After testing, you should have:

### Friend Mode
- [x] Created account
- [x] Completed profile with photos
- [x] Completed Bond Print quiz
- [x] Browsed profiles in Discover
- [x] Viewed profile details
- [x] Sent connection request
- [x] Accepted connection request
- [x] Sent messages in chat
- [x] Edited profile
- [x] Checked settings

### Love Mode
- [x] Activated Love Mode
- [x] Completed onboarding
- [x] Rated profiles 1-10
- [x] Created mutual match
- [x] Chatted anonymously
- [x] Viewed match in Matches tab

### Beta Features
- [x] Beta gate works
- [x] Access granted with .edu email
- [x] Access denied for non-beta emails
- [x] Badge counts update
- [x] Loading skeletons appear

---

## 🐛 Common Test Issues

### Issue: "Beta access denied"
**Fix:** Check `/components/BetaAccessGate.tsx` includes your email

### Issue: "Photos won't upload"
**Fix:** Check file size < 5MB and format is JPG/PNG

### Issue: "Bond Print quiz won't start"
**Fix:** Check Gemini API key is set in Supabase secrets

### Issue: "Can't see other profiles"
**Fix:** Create test data or wait for other users to sign up

### Issue: "Messages not appearing"
**Fix:** Wait 3 seconds (polling interval) or refresh the page

### Issue: "Love Mode shows no profiles"
**Fix:** Need other users at same school with Love Mode active

---

## 📱 Mobile Testing

### iOS (Safari)
```
1. Open app in Safari
2. Tap Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. Icon appears on home screen
6. Open from home screen (no browser UI!)
```

### Android (Chrome)
```
1. Open app in Chrome
2. Tap menu (3 dots)
3. Tap "Add to Home screen"
4. Tap "Add"
5. Icon appears on home screen
6. Open from home screen (no browser UI!)
```

**Test on Mobile:**
- [ ] Bottom navigation works
- [ ] Swipe gestures work
- [ ] Photo upload from camera works
- [ ] Keyboard doesn't break layout
- [ ] Scrolling is smooth
- [ ] Touch targets are big enough

---

## 🎯 Performance Test

### Speed Expectations:
- **Page Load:** < 2 seconds
- **Profile Load:** < 1 second
- **Photo Upload:** < 5 seconds per photo
- **Message Send:** < 1 second
- **Search:** Instant

### If Slow:
1. Check internet connection
2. Check Supabase region (should be US)
3. Check image sizes (should be < 5MB)
4. Check console for errors

---

## 📊 Track Your Test

### Create Test Report:
```
Date: [Today's date]
Time: [Time spent testing]
Device: [iPhone 14, Chrome on Mac, etc.]

✅ Working:
- Beta gate
- Sign up
- Profile creation
- Photo upload
- Bond Print quiz
- Profile browsing
- Connection requests
- Messaging

❌ Issues Found:
1. [Description of bug]
2. [Description of bug]

💡 Suggestions:
1. [Improvement idea]
2. [Improvement idea]

Overall Rating: X/10
Would recommend: Yes/No
```

---

## 🚀 Ready for Beta Testers?

You're ready if:
- [x] All basic flows work
- [x] No critical bugs
- [x] Photos upload successfully
- [x] Messaging works
- [x] Love Mode creates matches
- [x] Mobile experience is good
- [x] Beta gate works correctly

**If yes:** Send to 5 friends and ask them to test!

**If no:** Fix critical issues first, then beta test.

---

## 📝 Beta Tester Instructions

Send this to your first testers:

```
Hi! Thanks for testing bonded!

📱 Install:
1. Open [YOUR_APP_URL]
2. Add to home screen
3. Sign up with .edu email

🧪 What to test:
1. Complete profile setup (10 mins)
2. Browse some profiles
3. Send a connection request
4. Try Love Mode (optional)

🐛 Report bugs:
- Screenshot the issue
- Send me the details
- Include what you were doing

💬 Feedback:
- What did you like?
- What was confusing?
- What would you change?
- Would you use this daily?

Thanks! 🙏
```

---

**Start testing now! 🎉**

Open your app, follow this guide, and see how it works.

The faster you test, the faster you can share with real users!
