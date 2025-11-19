# 🚀 Deployment Guide

Complete guide for deploying Bonded to production.

---

## 📋 **Prerequisites**

- Supabase account and project
- Vercel account (or your preferred hosting)
- Domain name (optional but recommended)
- Environment variables configured

---

## 🔧 **Step 1: Supabase Setup**

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

### 1.2 Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the SQL migration file:
- `supabase/migrations/20250104000000_forums_classes_clubs.sql`

### 1.3 Set Up Storage Buckets
1. Go to Storage in Supabase dashboard
2. Create bucket: `make-2516be19-profile-photos`
   - Set to **private**
   - Max file size: 5MB

### 1.4 Deploy Edge Functions
```bash
# Deploy the main server function
supabase functions deploy make-server-2516be19
```

### 1.5 Set Edge Function Secrets
```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set GEMINI_API_KEY=your-gemini-key  # Optional
supabase secrets set ENVIRONMENT=production
```

---

## 🌐 **Step 2: Frontend Deployment (Vercel)**

### 2.1 Prepare Environment Variables

Create `.env.production`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENV=production
VITE_SENTRY_DSN=your-sentry-dsn  # Optional
VITE_GEMINI_API_KEY=your-gemini-key  # Optional
```

### 2.2 Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENV=production`
   - `VITE_SENTRY_DSN` (optional)
   - `VITE_GEMINI_API_KEY` (optional)
5. Deploy!

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2.3 Configure Custom Domain (Optional)
1. In Vercel dashboard, go to Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

---

## 🔒 **Step 3: Security Configuration**

### 3.1 Update CORS in Edge Function
Ensure `ENVIRONMENT=production` is set in Edge Function secrets.

The Edge Function will automatically:
- Restrict CORS to production domains only
- Remove localhost and wildcards
- Use strict origin checking

### 3.2 Enable RLS Policies
All database tables should have RLS enabled. Verify in Supabase dashboard:
- Go to Authentication → Policies
- Ensure policies are active for all tables

### 3.3 Set Up Rate Limiting
Rate limiting is built into the Edge Function:
- 100 requests/min for most endpoints
- 10 requests/min for auth endpoints
- 20 requests/min for media uploads

---

## 📊 **Step 4: Monitoring Setup**

### 4.1 Sentry Error Tracking
1. Create account at https://sentry.io
2. Create a React project
3. Copy the DSN
4. Add to environment variables: `VITE_SENTRY_DSN`

### 4.2 Performance Monitoring
Consider setting up:
- **Vercel Analytics** (built-in)
- **Google Analytics** (optional)
- **Web Vitals** monitoring

### 4.3 Uptime Monitoring
Set up uptime monitoring:
- **UptimeRobot** (free tier available)
- **Pingdom**
- **StatusCake**

Monitor:
- Frontend: `https://your-domain.com`
- API: `https://your-project.supabase.co/functions/v1/make-server-2516be19/health`

---

## 🗄️ **Step 5: Database Backups**

### 5.1 Enable Automatic Backups
1. Go to Supabase dashboard
2. Settings → Database
3. Enable "Point-in-time Recovery" (PITR)
4. Set backup retention period

### 5.2 Manual Backup
```bash
# Using Supabase CLI
supabase db dump -f backup.sql
```

---

## ✅ **Step 6: Pre-Launch Checklist**

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Edge Functions deployed
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] CORS configured for production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking configured
- [ ] Database backups enabled
- [ ] Rate limiting active
- [ ] Content moderation enabled
- [ ] Test all major features:
  - [ ] User signup/login
  - [ ] Profile creation
  - [ ] Post creation
  - [ ] Messaging
  - [ ] Search
  - [ ] Notifications

---

## 🧪 **Step 7: Testing**

### 7.1 Smoke Tests
Test these critical flows:
1. User registration
2. Profile creation
3. Post creation
4. Sending messages
5. Friend requests
6. Search functionality

### 7.2 Load Testing
Consider using:
- **k6** for API load testing
- **Lighthouse** for performance testing
- **WebPageTest** for real-world testing

---

## 🚨 **Step 8: Post-Deployment**

### 8.1 Monitor
- Check error logs in Sentry
- Monitor API response times
- Watch for rate limit violations
- Monitor database performance

### 8.2 Optimize
- Review slow queries
- Optimize images (CDN)
- Enable caching where appropriate
- Monitor bundle size

---

## 🔄 **Step 9: Continuous Deployment**

### 9.1 GitHub Actions (Optional)
Set up CI/CD:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📞 **Support**

For issues:
1. Check error logs in Sentry
2. Review Supabase logs
3. Check Vercel deployment logs
4. Review this troubleshooting guide

---

**You're ready to launch! 🚀**

