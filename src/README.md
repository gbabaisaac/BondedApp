# 🎉 bonded - Social Network for College Students

A complete social networking app for college students featuring AI-powered personality matching, friend discovery, roommate finding, and optional dating mode.

---

## 🚀 Quick Deploy (No Figma Visibility)

Your app is **production-ready** and can be deployed in 3 minutes!

### ⚡ Deploy Right Now:

```bash
npm install
npm run build
```

Then drag the `dist` folder to: **https://app.netlify.com/drop**

**📚 Full Guide:** See `/DEPLOY_NOW.md` (3 min read)

---

## 🎯 What's Built

### ✅ Friend Mode (Main App)
- **Profile Creation** - Photos, bio, interests, personality
- **Bond Print Quiz** - AI-powered personality assessment (Gemini)
- **Discovery Feed** - Browse students at your school
- **Connection System** - Send/accept "soft intro" requests
- **Real-time Messaging** - 1-on-1 chat with connections
- **Search & Filters** - Find by major, interests, year

### ✅ Love Mode (Optional Dating)
- **1-10 Rating System** - Tinder-style card swiping
- **AI Matching** - Mutual 7+ ratings create matches
- **Anonymous Chat** - 4-stage progression to reveal identities
- **Bond Score** - Compatibility tracking (0-100)
- **Distance-based** - Find people nearby (simulated)

### ✅ Design & Polish
- **Beta Access Gate** - Controlled rollout with email whitelist
- **Mobile-Optimized** - Add to home screen for app-like experience
- **Badge Notifications** - Real-time counts for requests & messages
- **Loading Skeletons** - Professional loading states
- **Indigo/Purple Theme** - Consistent design system throughout

---

## 🎓 Beta Access

Currently enabled for students at:
- **@uri.edu** - University of Rhode Island
- **@illinois.edu** - University of Illinois
- **@stanford.edu** - Stanford University
- **@berkeley.edu** - UC Berkeley

**To add more schools:**
Edit `/components/BetaAccessGate.tsx` line 15

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool
- **Motion** - Animations
- **Lucide Icons** - Icon library
- **Shadcn/ui** - Component library

### Backend
- **Supabase** - Database, Auth, Storage
- **Deno Edge Functions** - Serverless API
- **Gemini AI** - Bond Print personality quiz
- **Postgres** - Data storage
- **Hono** - Web framework

---

## 📂 Project Structure

```
bonded/
├── components/          # React components
│   ├── AuthFlow.tsx    # Sign up/login
│   ├── BetaAccessGate.tsx  # Beta email whitelist
│   ├── BondPrintQuiz.tsx   # AI personality quiz
│   ├── MainApp.tsx     # Main app container
│   ├── LoveMode.tsx    # Dating mode
│   └── ui/             # Shadcn components
├── supabase/
│   └── functions/
│       └── server/     # Backend API
├── styles/
│   └── globals.css     # Global styles
├── utils/
│   └── supabase/       # Supabase client
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.html          # HTML template
```

---

## 🚀 Deployment Options

### Option 1: Netlify Drop (Easiest)
1. `npm run build`
2. Drag `dist` to https://app.netlify.com/drop
3. Done! ✅

**Guide:** `/DEPLOY_SIMPLE.md`

### Option 2: Vercel (Advanced)
1. Connect GitHub
2. Push code
3. Auto-deploy on every commit

**Guide:** `/DEPLOY_TO_VERCEL.md`

### Option 3: Figma Make
- Already hosted in Figma Make
- But shows Figma UI to users ❌
- Not recommended for beta testing

---

## 🧪 Testing

### Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Test Account Setup

See `/QUICK_TEST.md` for complete testing guide

Create two accounts to test:
1. Connection requests
2. Messaging
3. Love Mode matches

---

## 📱 Features in Detail

### Bond Print Quiz
- 8 AI-generated questions
- Powered by Google Gemini
- Creates personality profile
- Used for matching algorithm

### Connection System
- Send "soft intro" with personal message
- Accept/decline requests
- Auto-creates 1-on-1 chat on accept
- Badge notifications for pending requests

### Love Mode Matching
- Rate profiles 1-10 based on photos
- Mutual ratings of 7+ create match
- Anonymous chat with 4 stages:
  1. Fully anonymous
  2. Profile revealed after 10 messages
  3. Photos revealed after bond score 60+
  4. Identities revealed after mutual consent
- Distance-based discovery (simulated)

### Real-time Features
- Message polling (3-second refresh)
- Badge count updates
- Connection status changes
- Future: WebSocket integration planned

---

## 🔒 Security & Privacy

- ✅ Email verification (.edu only)
- ✅ Beta access gate (whitelist only)
- ✅ Supabase Auth with secure tokens
- ✅ Private Storage buckets
- ✅ School-based visibility (users only see same school)
- ✅ HTTPS by default (via Netlify/Vercel)

---

## 💰 Cost

### Beta (0-500 users)
- **Netlify/Vercel:** FREE
- **Supabase:** FREE
- **Total: $0/month** ✅

### Production (500-5000 users)
- **Vercel Pro:** $20/month
- **Supabase Pro:** $25/month
- **Total: $45/month**

---

## 📊 Analytics

### Built-in Tracking
- Badge counts (pending requests, messages)
- User profiles created
- Bond Print completions
- Connection requests sent/accepted
- Messages sent
- Love Mode activations

### Add External Analytics (Optional)
- Vercel Analytics (built-in)
- PostHog (event tracking)
- Google Analytics

---

## 🔄 Updating Your App

### With GitHub + Vercel/Netlify:
```bash
git add .
git commit -m "Updated feature X"
git push
```
Auto-deploys! ✨

### With Drag & Drop:
```bash
npm run build
# Drag new dist folder to Netlify/Vercel
```

---

## 📚 Documentation

### Quick Start
- **`/DEPLOY_NOW.md`** ⚡ - Deploy in 3 minutes
- **`/START_HERE.md`** 📖 - Complete overview
- **`/QUICK_TEST.md`** 🧪 - Testing guide

### Deployment
- **`/DEPLOY_SIMPLE.md`** 🚀 - Netlify drag & drop
- **`/DEPLOY_TO_VERCEL.md`** 🔧 - Vercel deployment
- **`/BETA_DEPLOYMENT_GUIDE.md`** 📱 - Beta testing strategy

### Features & Planning
- **`/FINAL_UPDATES_COMPLETE.md`** ✅ - Latest updates
- **`/WHATS_NEXT.md`** 🎯 - Feature roadmap
- **`/TROUBLESHOOTING.md`** 🐛 - Common issues

---

## 🎯 Next Steps

### Today
1. ✅ Deploy to Netlify/Vercel (3 min)
2. ✅ Test with your own account
3. ✅ Share with 5 friends from URI/UIUC
4. ✅ Collect initial feedback

### This Week
1. Fix critical bugs
2. Add 10-20 more beta users
3. Monitor usage & errors
4. Plan improvements

### Next Week
1. Implement top feature requests
2. Expand to 50+ users
3. Track key metrics
4. Prepare for wider launch

**Full roadmap:** `/WHATS_NEXT.md`

---

## 🆘 Support

### Common Issues

**"npm: command not found"**
- Install Node.js: https://nodejs.org

**"Build failed"**
- Run `npm install` first
- Check error messages
- See `/TROUBLESHOOTING.md`

**"App shows blank page"**
- Check browser console for errors
- Verify Supabase keys in `/utils/supabase/info.tsx`

**"Photos won't upload"**
- Check file size < 5MB
- Verify Supabase Storage bucket exists

---

## 🎉 You're Ready!

Your app is:
- ✅ Complete and production-ready
- ✅ Fully functional (auth, profiles, chat, matching)
- ✅ Mobile-optimized
- ✅ Beta-gated for controlled rollout
- ✅ Ready to deploy in 3 minutes

**Deploy now:** `/DEPLOY_NOW.md`

---

## 📧 Contact

For questions about deployment or features, check the documentation files in this repo.

---

## 📄 License

Private beta - All rights reserved

---

**Built with ❤️ for college students**

🚀 **Deploy now and get your first users today!**
