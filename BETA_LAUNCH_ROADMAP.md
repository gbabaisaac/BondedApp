# 🚀 Beta Launch Roadmap - From Closed to Discoverable Beta

## Overview
Transform Bonded from a closed beta (hardcoded emails) to a discoverable beta that people can find and join easily.

**Note:** Love Mode has been disabled for the initial beta launch and will be rolled out next quarter. See `LOVE_MODE_DISABLED.md` for details.

---

## 📋 Phase 1: Foundation (Week 1-2) - CRITICAL

### 1.1 Domain & Hosting Setup ✅
**Status:** You have Vercel configured - need domain

**Action Items:**
- [ ] **Buy a domain** (e.g., `getbonded.com`, `bonded.app`, `joinbonded.com`)
  - Cost: ~$10-15/year (Namecheap, Google Domains, Cloudflare)
  - Choose `.com` or `.app` for best discoverability
- [ ] **Connect domain to Vercel**
  - Vercel Dashboard → Project → Settings → Domains
  - Add your domain and configure DNS
- [ ] **Set up SSL** (automatic with Vercel)
- [ ] **Test deployment** at your new domain

**Why:** People need an easy URL to remember and share, not a random Vercel subdomain.

---

### 1.2 Run Database Optimization ⚠️
**Status:** Script ready, needs execution

**Action Items:**
- [ ] Run `database_optimization.sql` in Supabase SQL editor
- [ ] Verify indexes are cleaned up
- [ ] Test connections feature works

**Why:** Critical for performance before launch.

---

### 1.3 Replace Hardcoded Beta Access
**Status:** Currently using hardcoded email list

**Action Items:**
- [ ] Create beta signup system (see Phase 2)
- [ ] Store beta signups in database
- [ ] Update `BetaAccessGate` to check database instead of hardcoded list
- [ ] Add waitlist functionality

**Why:** Can't scale with hardcoded emails.

---

## 📋 Phase 2: Beta Signup System (Week 2-3)

### 2.1 Database Schema for Beta Signups
**Create new table in Supabase:**

```sql
CREATE TABLE beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  school TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_beta_signups_email ON beta_signups(email);
CREATE INDEX idx_beta_signups_status ON beta_signups(status);
```

### 2.2 Beta Signup API Endpoint
**Add to `src/supabase/functions/server/index.tsx`:**

```typescript
// Sign up for beta waitlist
app.post("/make-server-2516be19/beta/signup", async (c) => {
  try {
    const { email, school, referralCode } = await c.req.json();
    
    if (!email || !email.includes('.edu')) {
      return c.json({ error: 'Valid .edu email required' }, 400);
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('beta_signups')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return c.json({ 
        message: 'You\'re already on the list!',
        status: existing.status 
      });
    }

    // Create signup
    const { data, error } = await supabase
      .from('beta_signups')
      .insert({
        email: email.toLowerCase(),
        school,
        referral_code: generateReferralCode(),
        referred_by: referralCode || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-approve if school is in early access list
    const earlyAccessSchools = ['uri.edu', 'illinois.edu', 'stanford.edu', 'berkeley.edu'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (earlyAccessSchools.some(school => emailDomain?.includes(school))) {
      await supabase
        .from('beta_signups')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', data.id);
      
      return c.json({ 
        message: 'Welcome! You have immediate access.',
        status: 'approved',
        accessGranted: true
      });
    }

    return c.json({ 
      message: 'You\'re on the waitlist! We\'ll notify you soon.',
      status: 'pending',
      referralCode: data.referral_code
    });
  } catch (error: any) {
    console.error('Beta signup error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Check beta access
app.get("/make-server-2516be19/beta/check", async (c) => {
  try {
    const email = c.req.query('email');
    if (!email) {
      return c.json({ hasAccess: false });
    }

    const { data } = await supabase
      .from('beta_signups')
      .select('status')
      .eq('email', email.toLowerCase())
      .single();

    return c.json({ 
      hasAccess: data?.status === 'approved',
      status: data?.status || 'not_found'
    });
  } catch (error: any) {
    return c.json({ hasAccess: false, error: error.message });
  }
});
```

### 2.3 Update BetaAccessGate Component
**Replace hardcoded list with API calls:**

```typescript
// In BetaAccessGate.tsx
const checkAccess = async () => {
  // First check if they have access
  const checkResponse = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/beta/check?email=${encodeURIComponent(email)}`
  );
  const { hasAccess } = await checkResponse.json();
  
  if (hasAccess) {
    // Grant access
    localStorage.setItem('betaAccess', 'granted');
    setHasAccess(true);
    onAccessGranted();
    toast.success('Welcome to the beta! 🎉');
    return;
  }
  
  // If no access, sign them up for waitlist
  const signupResponse = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/beta/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }
  );
  
  const result = await signupResponse.json();
  
  if (result.accessGranted) {
    localStorage.setItem('betaAccess', 'granted');
    setHasAccess(true);
    onAccessGranted();
    toast.success('Welcome! You have immediate access. 🎉');
  } else {
    toast.success('You\'re on the waitlist! We\'ll notify you soon.');
    // Show waitlist confirmation UI
  }
};
```

---

## 📋 Phase 3: Landing Page & SEO (Week 3-4)

### 3.1 Create Landing Page
**Create `src/pages/LandingPage.tsx`:**

- Hero section with value proposition
- Features showcase
- Beta signup form (prominent)
- Social proof (if any)
- FAQ section
- Footer with links

**Key Elements:**
- Clear headline: "Find Your People at College"
- Subheadline explaining what Bonded does
- Large, prominent signup form
- Mobile-responsive design
- Fast loading (< 2 seconds)

### 3.2 SEO Optimization
**Update `index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO Meta Tags -->
  <title>Bonded - Find Friends, Roommates & Connections at Your University</title>
  <meta name="description" content="Bonded helps college students find friends, roommates, and meaningful connections at their university. Join the beta today!" />
  <meta name="keywords" content="college social network, find roommates, university friends, college connections" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yourdomain.com/" />
  <meta property="og:title" content="Bonded - Find Your People at College" />
  <meta property="og:description" content="Find friends, roommates, and connections at your university" />
  <meta property="og:image" content="https://yourdomain.com/og-image.png" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://yourdomain.com/" />
  <meta property="twitter:title" content="Bonded - Find Your People at College" />
  <meta property="twitter:description" content="Find friends, roommates, and connections at your university" />
  <meta property="twitter:image" content="https://yourdomain.com/og-image.png" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/icon.svg" />
  
  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://your-project.supabase.co" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### 3.3 Create OG Image
**Action Items:**
- [ ] Design 1200x630px image for social sharing
- [ ] Include logo, tagline, and key visual
- [ ] Save as `public/og-image.png`
- [ ] Test on Facebook/Twitter debuggers

---

## 📋 Phase 4: Analytics & Monitoring (Week 4)

### 4.1 Add Google Analytics
**Install:**
```bash
npm install @react-ga4/react-ga4
```

**Create `src/utils/analytics.ts`:**
```typescript
import ReactGA from '@react-ga4/react-ga4';

export const initAnalytics = () => {
  if (process.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.initialize(process.env.VITE_GA_MEASUREMENT_ID);
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (process.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.event({
      action,
      category,
      label,
    });
  }
};

export const trackPageView = (path: string) => {
  if (process.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};
```

**Add to `App.tsx`:**
```typescript
useEffect(() => {
  initAnalytics();
  trackPageView(window.location.pathname);
}, []);
```

**Track key events:**
- Beta signup
- User registration
- Connection requests
- Profile completions

### 4.2 Add Error Tracking (Sentry)
**Install:**
```bash
npm install @sentry/react
```

**Setup in `main.tsx`:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

### 4.3 Supabase Logging
**Already have function logs - monitor:**
- Error rates
- Response times
- Failed requests

---

## 📋 Phase 5: App Store Optimization (Week 4-5)

### 5.1 PWA App Store Submission
**Your app is already a PWA! Now optimize:**

**Update `manifest.json`:**
- [ ] Add proper screenshots (at least 2)
- [ ] Add app categories
- [ ] Ensure all icons are present (192x192, 512x512)
- [ ] Add short description
- [ ] Add long description

**Create App Store Listings:**
- [ ] **Google Play Store** (PWA can be submitted)
- [ ] **Apple App Store** (requires native wrapper or PWA submission)
- [ ] **Microsoft Store** (PWA support)

### 5.2 App Store Assets Needed
- [ ] App icon (1024x1024)
- [ ] Screenshots (various sizes)
- [ ] Feature graphic
- [ ] App description
- [ ] Privacy policy URL
- [ ] Terms of service URL

---

## 📋 Phase 6: Marketing & Discovery (Week 5-6)

### 6.1 Social Media Presence
**Create accounts:**
- [ ] Instagram (@getbonded)
- [ ] Twitter/X (@getbonded)
- [ ] TikTok (@getbonded)
- [ ] LinkedIn (company page)

**Content strategy:**
- Behind-the-scenes development
- User testimonials (when available)
- College life tips
- Feature announcements

### 6.2 Launch Strategy
**Pre-Launch (2 weeks before):**
- [ ] Build email list (beta signups)
- [ ] Create launch content
- [ ] Reach out to college newspapers/blogs
- [ ] Post on Product Hunt (prepare)

**Launch Day:**
- [ ] Post on Product Hunt
- [ ] Share on social media
- [ ] Email beta waitlist
- [ ] Post on Reddit (r/startups, college subreddits)
- [ ] Reach out to college influencers

**Post-Launch:**
- [ ] Monitor feedback
- [ ] Fix critical bugs
- [ ] Iterate based on usage

### 6.3 Referral Program
**Implement referral system:**
- Each user gets unique referral code
- Track referrals in database
- Reward referrers (early access, badges, etc.)
- Show referral stats in profile

---

## 📋 Phase 7: Production Readiness (Ongoing)

### 7.1 Security Checklist
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] SQL injection prevention (using parameterized queries ✅)
- [ ] XSS prevention (React handles this ✅)
- [ ] HTTPS enforced (Vercel handles this ✅)

### 7.2 Performance Optimization
- [ ] Image optimization (WebP format)
- [ ] Code splitting (already done ✅)
- [ ] Lazy loading
- [ ] CDN for static assets (Vercel handles this ✅)
- [ ] Database query optimization (done ✅)

### 7.3 Legal Requirements
- [ ] Privacy Policy (required for app stores)
- [ ] Terms of Service
- [ ] Cookie Policy (if using analytics)
- [ ] GDPR compliance (if EU users)
- [ ] COPPA compliance (if under 13)

### 7.4 Support System
- [ ] Help/FAQ page
- [ ] Contact form
- [ ] Email support (support@yourdomain.com)
- [ ] In-app feedback mechanism

---

## 📋 Phase 8: Beta Management (Ongoing)

### 8.1 Access Control
**Create admin dashboard:**
- View beta signups
- Approve/reject users
- Send approval emails
- Track metrics

### 8.2 Gradual Rollout
**Phases:**
1. **Alpha:** Friends & family (current)
2. **Closed Beta:** Selected schools (100-500 users)
3. **Open Beta:** All .edu emails (unlimited)
4. **Public Launch:** Everyone

### 8.3 Feedback Collection
- [ ] In-app feedback button
- [ ] User surveys
- [ ] Analytics tracking
- [ ] Support tickets

---

## 🎯 Quick Start Checklist (Do These First!)

### This Week:
1. [ ] Buy domain name
2. [ ] Connect domain to Vercel
3. [ ] Run database optimization SQL
4. [ ] Create beta signups table
5. [ ] Update BetaAccessGate to use API

### Next Week:
6. [ ] Build landing page
7. [ ] Add SEO meta tags
8. [ ] Set up Google Analytics
9. [ ] Create social media accounts
10. [ ] Write Privacy Policy

### Week 3:
11. [ ] Launch landing page
12. [ ] Start collecting beta signups
13. [ ] Begin social media posting
14. [ ] Prepare Product Hunt launch
15. [ ] Test everything end-to-end

---

## 📊 Success Metrics

**Track these:**
- Beta signups per day
- Conversion rate (signup → registration)
- Daily active users (DAU)
- Connection requests sent
- User retention (Day 1, Day 7, Day 30)
- Error rate
- Page load times

---

## 💰 Estimated Costs

**Monthly:**
- Domain: ~$1/month
- Vercel: Free (Hobby plan) or $20/month (Pro)
- Supabase: Free tier or $25/month (Pro)
- Analytics: Free (Google Analytics)
- Error tracking: Free tier (Sentry)
- **Total: ~$0-50/month** (can start free!)

---

## 🚨 Common Pitfalls to Avoid

1. **Don't launch too early** - Fix critical bugs first
2. **Don't ignore feedback** - Users will tell you what's wrong
3. **Don't over-engineer** - Start simple, iterate
4. **Don't forget mobile** - Most users will be on phones
5. **Don't skip legal** - Privacy policy is required
6. **Don't ignore SEO** - It's free marketing
7. **Don't launch silently** - Tell people about it!

---

## 🎉 You're Ready When...

- [ ] Domain is live and working
- [ ] Beta signup system works
- [ ] Landing page looks professional
- [ ] Analytics tracking events
- [ ] Error tracking set up
- [ ] Privacy policy published
- [ ] Social media accounts created
- [ ] Tested on multiple devices
- [ ] No critical bugs
- [ ] Database optimized

**Then you can launch! 🚀**

