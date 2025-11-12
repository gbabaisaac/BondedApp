# 🚀 Production Deployment Checklist

Your Bonded app is now ready for production deployment! Follow this checklist to launch safely.

## ✅ Week 1 Completed Tasks

All critical production requirements have been implemented:

- [x] **Sentry Error Tracking** - Catches and reports all production errors
- [x] **Server-Side Rate Limiting** - Prevents API abuse and DDoS attacks
- [x] **CORS Security** - Restricts API access to approved domains
- [x] **Content Moderation** - Filters inappropriate content automatically
- [x] **Privacy Policy** - GDPR-compliant privacy page
- [x] **Terms of Service** - Legal protection for your platform
- [x] **GDPR Data Export** - Users can download all their data
- [x] **Environment Configuration** - All secrets properly documented
- [x] **Console.log Cleanup Guide** - Prevents data leaks
- [x] **Uptime Monitoring Guide** - Stay informed when site goes down

---

## 🔧 Pre-Deployment Setup

### 1. Create Sentry Account (10 minutes)

1. Go to https://sentry.io/signup/
2. Create a new project → Select "React"
3. Copy your DSN (looks like: `https://abc@o123.ingest.sentry.io/456`)
4. Save for next step

### 2. Set Vercel Environment Variables (5 minutes)

Go to your Vercel project → Settings → Environment Variables

Add these variables for **Production, Preview, and Development**:

```bash
VITE_SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-from-supabase
VITE_SENTRY_DSN=your-sentry-dsn-from-step-1
VITE_GEMINI_API_KEY=your-gemini-key-if-using-ai
VITE_ENV=production
```

**Where to get these:**
- Supabase keys: Project Settings → API
- Sentry DSN: From step 1 above
- Gemini key: https://makersuite.google.com/app/apikey

### 3. Deploy Edge Function with New Features (5 minutes)

Your Edge Function now has rate limiting, CORS, and content moderation.

```bash
# Set Edge Function secrets (if not already set)
supabase secrets set SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy the updated function
supabase functions deploy make-server-2516be19

# Test the health endpoint
curl https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2025-01-11T..."}
```

### 4. Update CORS Allowed Origins (2 minutes)

Edit `supabase/functions/make-server-2516be19/index.ts` line 41:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bonded.vercel.app',  // Your production URL
  'https://*.vercel.app',
  'https://yourdomain.com',     // Add your custom domain if you have one
];
```

Then redeploy: `supabase functions deploy make-server-2516be19`

### 5. Add Legal Pages to App (5 minutes)

Create a Settings page or Footer with links to Privacy & Terms:

```tsx
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

// In your Settings or Footer component:
<Link to="/privacy">Privacy Policy</Link>
<Link to="/terms">Terms of Service</Link>

// Add routes in your router:
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
```

Or use a modal approach in Settings.

### 6. Set Up Uptime Monitoring (15 minutes)

1. **Create UptimeRobot account** (free): https://uptimerobot.com/signUp

2. **Add Frontend Monitor:**
   - Type: HTTP(s)
   - URL: `https://bonded.vercel.app`
   - Name: Bonded Frontend
   - Interval: 5 minutes

3. **Add API Monitor:**
   - Type: HTTP(s)
   - URL: `https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health`
   - Name: Bonded API
   - Interval: 5 minutes

4. **Add your email** for alerts

5. **Test:** Pause a monitor and verify you get an alert

### 7. Clean Console.logs (1-2 hours)

Follow the guide in `CONSOLE_LOG_CLEANUP_GUIDE.md`:

```bash
# Quick automated cleanup with VSCode
# Find: console\.log\(
# Replace: logger.log(
# Review each change manually
```

**Priority files to clean:**
- `src/App.tsx`
- `src/components/AuthFlow.tsx`
- `src/components/ChatView.tsx`
- `src/components/ProfileSetup.tsx`

---

## 🧪 Testing Checklist

Test these features before launch:

### Sentry Error Tracking
```javascript
// In browser console on production site:
throw new Error('Test Sentry');
// Check Sentry dashboard - error should appear within 1 minute
```

### Rate Limiting
```javascript
// Make 100 rapid requests to test rate limiting
for(let i=0; i<100; i++) {
  fetch('https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health');
}
// Should get 429 "Too Many Requests" after ~60 requests
```

### Content Moderation
1. Try creating profile with profanity in bio
2. Try sending message with inappropriate content
3. Should get error: "Content moderation failed"

### GDPR Data Export
1. Log in to your app
2. Call: `GET /export-data` with your auth token
3. Should download JSON file with all your data

### CORS
1. Open browser console on a different domain
2. Try: `fetch('https://...supabase.co/functions/v1/.../health')`
3. Should fail with CORS error (good!)
4. Try from your production domain - should work

### Privacy & Terms Pages
1. Navigate to `/privacy` and `/terms`
2. Pages should load without errors
3. Content should be readable and properly formatted

---

## 🚀 Deployment Steps

### Step 1: Commit Your Changes

```bash
git add .
git commit -m "feat: production readiness - Week 1 complete

✅ Sentry error tracking
✅ Server-side rate limiting
✅ Content moderation
✅ Privacy Policy & Terms
✅ GDPR data export
✅ CORS restrictions
✅ Environment configuration"

git push origin main
```

### Step 2: Vercel Auto-Deploy

Vercel will automatically deploy when you push to main.

**Monitor the deployment:**
1. Go to Vercel dashboard
2. Watch deployment logs
3. Wait for "✓ Deployment Complete"

### Step 3: Verify Production

Once deployed:

1. Visit `https://bonded.vercel.app`
2. Check browser console - should see Sentry initialization
3. Test signup/login
4. Send a test message
5. Check Sentry dashboard - should see activity

### Step 4: Smoke Test Critical Paths

- [ ] Signup with .edu email works
- [ ] Email verification works
- [ ] Profile creation works (with content moderation)
- [ ] Bond Print quiz works
- [ ] Profile browsing works
- [ ] Sending messages works (with moderation)
- [ ] Connection requests work
- [ ] Settings page works
- [ ] Privacy/Terms pages load
- [ ] No console errors (check DevTools)

---

## 📊 Post-Launch Monitoring

### First 24 Hours

**Check every 2-4 hours:**
- [ ] Sentry dashboard - Any new errors?
- [ ] UptimeRobot - Is site up? Response times OK?
- [ ] Supabase dashboard - Database healthy? No quota issues?
- [ ] Vercel analytics - Traffic patterns normal?

### First Week

**Check daily:**
- [ ] Error rate in Sentry (should be < 1%)
- [ ] Response times (should be < 3s for frontend, < 1s for API)
- [ ] Rate limiting - Any blocked IPs? (check Edge Function logs)
- [ ] Content moderation - Any blocked content? (check logs)
- [ ] User feedback - Any complaints about blocked content?

### First Month

**Weekly checks:**
- [ ] Uptime percentage (goal: > 99.5%)
- [ ] Average response times
- [ ] Error trends
- [ ] User growth
- [ ] API usage patterns

---

## 🔥 Emergency Procedures

### Site is Down

1. **Check Vercel Status:** https://www.vercel-status.com
2. **Check Supabase Status:** https://status.supabase.com
3. **Check your monitors:** UptimeRobot dashboard
4. **View deployment logs:** Vercel dashboard
5. **Rollback if needed:**
   ```bash
   vercel rollback
   ```

### High Error Rate

1. **Check Sentry dashboard** - What errors are occurring?
2. **Check recent deployments** - Did you just deploy?
3. **Check Edge Function logs** - Supabase dashboard
4. **Rollback if critical:**
   ```bash
   vercel rollback
   ```

### Rate Limiting Too Strict

If legitimate users are being blocked:

1. Edit `rate-limiter.ts` - Increase limits
2. Redeploy Edge Function
3. Monitor for abuse

### Content Moderation False Positives

If innocent content is being blocked:

1. Check `content-moderator.ts` - Remove false positive words
2. Redeploy Edge Function
3. Test with previously blocked content

---

## 📈 Success Metrics

**After deployment, you should see:**

| Metric | Target |
|--------|--------|
| Uptime | > 99.5% |
| Average Response Time | < 3 seconds |
| Error Rate | < 1% |
| Sentry Alerts | < 5 per day |
| Blocked Content | > 0 (moderation working) |
| Rate Limited Requests | > 0 (protection working) |

---

## 🎯 Week 2 & 3 Roadmap

After successful deployment, continue improving:

### Week 2 (Recommended)
- [ ] Write basic E2E tests (Playwright/Cypress)
- [ ] Implement image compression on upload
- [ ] Integrate virtual scrolling for better performance
- [ ] Set up push notifications
- [ ] Enable TypeScript strict mode
- [ ] Create admin dashboard

### Week 3 (Nice to Have)
- [ ] Add analytics (PostHog, Mixpanel)
- [ ] Implement deep linking
- [ ] Improve accessibility (ARIA labels, keyboard nav)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Performance optimization
- [ ] Consider PostgreSQL migration (from KV store)

---

## 🆘 Need Help?

All documentation is in these files:

| Question | File |
|----------|------|
| How to set up environment variables? | `ENV_SETUP_GUIDE.md` |
| How to set up monitoring? | `UPTIME_MONITORING_GUIDE.md` |
| How to clean console.logs? | `CONSOLE_LOG_CLEANUP_GUIDE.md` |
| What was completed? | `WEEK_1_COMPLETION_SUMMARY.md` |
| Deployment checklist? | This file |

---

## ✨ Final Notes

**You're 75% ready for production!**

The critical security, legal, and monitoring features are implemented. You can safely launch with a limited beta audience while completing Week 2 & 3 improvements.

**Recommended Launch Strategy:**
1. **Soft launch** (now) - Invite 50-100 beta users
2. **Monitor closely** - Fix issues, gather feedback
3. **Week 2 improvements** - Add tests, push notifications
4. **Public launch** (Week 4) - Open to all students

**Your foundation is solid. Time to ship! 🚀**

---

Last updated: January 11, 2025
Questions? Contact: support@bonded.app
