# 🚀 Bonded App - Quick Start Guide

**For testing your complete MVP right now!**

---

## ⚡ Test the Complete Flow (10 minutes)

### **Step 1: Sign Up** (1 min)
1. Open the app
2. Click "Sign Up"
3. Enter email, password, name, school
4. Click "Create Account"

✅ **You should see:** Onboarding Wizard

---

### **Step 2: Complete Onboarding** (5-7 mins)

#### **Page 1: Basic Info**
- Enter age (e.g., 20)
- Select major from dropdown
- Select year (e.g., Sophomore)
- Click "Next"

#### **Page 2: Upload Photos** 📸
- Click "Upload" box
- Choose 1-6 photos from device
- Wait for upload (green toast = success)
- First photo = profile picture
- Click "Next"

#### **Page 3: Interests**
- Click interests you like (they turn purple)
- Select at least 3, max 10
- See counter at bottom
- Click "Next"

#### **Page 4: Personality**
- Click traits that fit you
- Select at least 3, max 8
- Be honest!
- Click "Next"

#### **Page 5: Living Habits**
- Choose sleep schedule (Early Bird / Night Owl)
- Choose cleanliness level
- Choose guests frequency
- Choose noise tolerance
- Click "Next"

#### **Page 6: Bio**
- Write about yourself (20+ characters)
- Show personality
- Be authentic
- Click "Next"

#### **Page 7: Looking For**
- Select what you want (friends, roommate, etc.)
- Can choose multiple
- At least 1 required
- Click "Complete"

✅ **You should see:** Bond Print Quiz

---

### **Step 3: Take Bond Print Quiz** (2-3 mins)
1. Read first question
2. Select an answer
3. Click "Next"
4. Repeat for 8 questions
5. On last question, click "Generate Bond Print"
6. Wait for AI to analyze (~5 seconds)

✅ **You should see:** Bond Print Results

---

### **Step 4: View Results** (1 min)
- See your personality type
- Read traits, values, preferences
- Click X button at top to close

✅ **You should see:** Discover Feed

---

### **Step 5: Browse Profiles** (2 mins)
1. Scroll through grid
2. See photos, names, info
3. Click any profile
4. Swipe through details
5. See their Bond Print
6. Click X to go back

✅ **You should see:** Profile details with Bond Print

---

### **Step 6: Send Soft Intro** (1 min)
1. Open a profile you like
2. Click "Soft Intro" button
3. Select reason (e.g., "Make Friends")
4. Wait for AI analysis (~3 seconds)
5. Review compatibility
6. Click "Send Soft Intro"

✅ **You should see:** Success toast, return to Discover

---

### **Step 7: Check Connections Tab** (1 min)
1. Click "Connections" in bottom nav
2. See 3 tabs:
   - **Incoming** - Requests received
   - **Sent** - Your outgoing requests
   - **My Connections** - Accepted connections
3. View your sent intro in "Sent" tab

✅ **You should see:** Your request with status "Pending"

---

### **Step 8: Test with Second Account** (Optional)

**To test full flow:**
1. Sign up second account (different email)
2. Complete onboarding
3. Second account accepts your intro:
   - Go to Connections → Incoming
   - Click "Accept"
4. Both users now see each other in "My Connections"
5. Chat is auto-created

---

### **Step 9: Send Messages** (1 min)
1. Click "Messages" in bottom nav
2. See chat list
3. Click a chat
4. Type message
5. Press Enter or click Send
6. See your message appear

✅ **You should see:** Real-time chat with bubble UI

---

### **Step 10: View Your Profile** (1 min)
1. Click "Profile" in bottom nav
2. See your info
3. See your Bond Print
4. See all onboarding data

✅ **You should see:** Complete profile with photo, Bond Print, etc.

---

## 🎯 Key Features to Test

### **Photo Upload:**
- [ ] Upload 1 photo
- [ ] Upload 6 photos
- [ ] Try to upload 7th (should show error)
- [ ] Delete a photo
- [ ] Large file (>5MB) shows error

### **Validation:**
- [ ] Try to skip step without filling (should show error)
- [ ] Select too few interests (should show error)
- [ ] Bio too short (should show error)
- [ ] All toasts appear correctly

### **Navigation:**
- [ ] Back button works
- [ ] Progress bar updates
- [ ] Animations are smooth
- [ ] Bottom nav switches views

### **Bond Print:**
- [ ] Quiz generates questions
- [ ] AI analysis completes
- [ ] Results display correctly
- [ ] Shows on your profile
- [ ] Shows on other profiles

### **Connections:**
- [ ] Send Soft Intro
- [ ] AI generates compatibility
- [ ] Request appears in "Sent"
- [ ] Accept creates connection
- [ ] Appears in "My Connections"
- [ ] Chat auto-creates

### **Messaging:**
- [ ] See chat list
- [ ] Open chat
- [ ] Send message
- [ ] Message appears
- [ ] Auto-scrolls to newest
- [ ] Timestamps show

---

## 🐛 Common Issues & Fixes

### **"Photo upload failed"**
- Check file size (<5MB)
- Check internet connection
- Try different image
- Check browser console

### **"Failed to create profile"**
- Check all fields filled
- Check internet connection
- Try again
- Check browser console

### **"Quiz won't generate"**
- Wait a moment (AI takes 2-3s)
- Check internet connection
- Refresh if stuck >10s
- Check browser console

### **"Can't see other profiles"**
- Make sure you completed onboarding
- Check if others at your school exist
- Demo profiles should always show
- Check browser console

### **"Messages not sending"**
- Check connection exists
- Check internet
- Try again
- Check browser console

### **"Photos not showing"**
- Wait for upload to complete
- Check signed URL validity
- Refresh page
- Check browser console

---

## 📊 What to Look For

### **User Experience:**
- Is the flow intuitive?
- Are instructions clear?
- Do errors make sense?
- Is it fast enough?
- Does it look good?

### **Visual Design:**
- Are photos crisp?
- Are colors consistent?
- Are animations smooth?
- Is text readable?
- Are buttons obvious?

### **Functionality:**
- Does everything work?
- Are there bugs?
- Does data save?
- Do connections work?
- Do messages send?

### **Mobile Experience:**
- Does it fit your screen?
- Are buttons tappable?
- Does keyboard work?
- Can you scroll easily?
- Does navigation work?

---

## 💾 Test Data

### **Good Test Accounts:**

**Account 1:**
- Email: test1@university.edu
- Password: password123
- Name: Alex Johnson
- School: Stanford University

**Account 2:**
- Email: test2@university.edu  
- Password: password123
- Name: Jordan Smith
- School: Stanford University

**Use same school so you can see each other!**

---

## 🎨 Test Scenarios

### **Scenario 1: New Freshman**
- Age: 18
- Year: Freshman
- Major: Computer Science
- Looking for: Roommate, Friends
- Interests: Gaming, Coding, Music
- Personality: Introverted, Night Owl

### **Scenario 2: Social Sophomore**
- Age: 19
- Year: Sophomore  
- Major: Business
- Looking for: Friends, Network
- Interests: Sports, Events, Travel
- Personality: Outgoing, Organized

### **Scenario 3: Studious Junior**
- Age: 20
- Year: Junior
- Major: Biology
- Looking for: Study Partner, Friends
- Interests: Science, Coffee, Fitness
- Personality: Ambitious, Early Bird

---

## ✅ Success Criteria

**Onboarding:**
- ✅ Can complete all 7 steps
- ✅ Photos upload successfully
- ✅ Data saves correctly
- ✅ Progress is clear

**Bond Print:**
- ✅ Quiz generates questions
- ✅ AI completes analysis
- ✅ Results look good
- ✅ Saves to profile

**Discovery:**
- ✅ Can browse profiles
- ✅ Photos display
- ✅ Search works
- ✅ Filter works

**Connections:**
- ✅ Can send Soft Intro
- ✅ AI generates analysis
- ✅ Can accept/decline
- ✅ Connections display

**Messaging:**
- ✅ Chat list shows
- ✅ Can send messages
- ✅ Messages appear
- ✅ UI looks good

---

## 🚨 Report Bugs

**When you find an issue:**

1. Note what you were doing
2. Note what went wrong
3. Check browser console
4. Take screenshot
5. Note error message
6. Try to reproduce

**Info to include:**
- Browser (Chrome, Safari, etc.)
- Device (iPhone, Android, etc.)
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Screenshots

---

## 🎉 Have Fun!

**Remember:**
- This is a **beta test**
- Bugs are **expected**
- Feedback is **valuable**
- Your input **matters**

**The goal:**
- Test all features
- Find issues
- Suggest improvements
- Help make it better

**You're helping build something awesome!** 🌟

---

## 📞 Need Help?

**Check these docs:**
- `/ONBOARDING_COMPLETE.md` - Onboarding details
- `/CONNECTIONS_MESSAGING_COMPLETE.md` - Connection/chat details  
- `/COMPLETE_APP_STATUS.md` - Full app overview
- `/TROUBLESHOOTING.md` - Common issues

**Browser Console:**
- Right click → Inspect
- Go to Console tab
- See error messages
- Copy for reporting

---

**Ready? Let's test! 🚀**

**Time estimate:** 15-20 minutes for full test  
**Recommended:** Do it twice (two accounts)  
**Best on:** Mobile phone (it's mobile-first!)

Good luck and have fun! 🎊
