# Uptime Monitoring Setup Guide

Ensure your production application stays online and get alerted immediately when issues occur.

## Why Uptime Monitoring?

- **Detect downtime immediately** - Know about issues before users complain
- **Track performance** - Monitor response times and identify slowdowns
- **SLA compliance** - Measure and improve service availability
- **Historical data** - Track uptime trends over time

---

## Recommended Services

### 1. UptimeRobot (Free - Recommended)

**Best for:** Basic uptime monitoring with generous free tier

**Features:**
- ✅ Monitor up to 50 websites (free)
- ✅ 5-minute check intervals
- ✅ Email, SMS, Slack alerts
- ✅ Status page for users
- ✅ No credit card required

**Setup:**

1. **Create account:** https://uptimerobot.com/signUp

2. **Add monitors:**
   - Click "Add New Monitor"
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Bonded - Frontend`
   - URL: `https://bonded.vercel.app`
   - Monitoring Interval: `5 minutes`
   - Click "Create Monitor"

3. **Add Edge Function monitor:**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Bonded - API Health`
   - URL: `https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health`
   - Monitoring Interval: `5 minutes`
   - Click "Create Monitor"

4. **Set up alerts:**
   - Go to "My Settings" → "Alert Contacts"
   - Add your email address
   - Add Slack webhook (optional)
   - Add SMS number (paid feature)

5. **Create public status page:**
   - Go to "Public Status Pages"
   - Click "Add Public Status Page"
   - Select monitors to include
   - Customize subdomain: `bonded-status.uptimerobot.com`
   - Share this URL with users

**Cost:** Free for 50 monitors

---

### 2. Better Stack (Formerly Better Uptime)

**Best for:** More advanced monitoring with team features

**Features:**
- ✅ Unlimited monitors (paid plans)
- ✅ 30-second check intervals
- ✅ Beautiful status pages
- ✅ Incident management
- ✅ On-call scheduling
- ✅ Phone call alerts

**Setup:**

1. **Create account:** https://betterstack.com/uptime

2. **Add monitor:**
   ```
   Name: Bonded Frontend
   URL: https://bonded.vercel.app
   Check interval: 60 seconds
   Regions: Select multiple (US, EU, Asia)
   ```

3. **Add health check endpoint:**
   ```
   Name: Bonded API
   URL: https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health
   Expected status code: 200
   Expected response time: < 2000ms
   ```

4. **Configure alerts:**
   - Email notifications
   - Slack integration
   - PagerDuty integration (for teams)
   - Phone call escalation (paid)

**Cost:** $20/month (Basic) - Free trial available

---

### 3. Pingdom (Enterprise)

**Best for:** Enterprise monitoring with detailed analytics

**Features:**
- ✅ Real user monitoring (RUM)
- ✅ Transaction monitoring
- ✅ Global monitoring locations
- ✅ Detailed performance reports
- ✅ Root cause analysis

**Setup:**

1. Create account: https://www.pingdom.com
2. Add uptime checks for all critical endpoints
3. Set up transaction monitoring for signup/login flows
4. Configure alert integrations

**Cost:** $10-$40/month

---

## What to Monitor

### Critical Endpoints

1. **Frontend Application**
   - URL: `https://bonded.vercel.app`
   - Expected: Status 200
   - Response time: < 3 seconds

2. **API Health Check**
   - URL: `https://[your-project].supabase.co/functions/v1/make-server-2516be19/health`
   - Expected: Status 200, JSON response `{"status":"ok"}`
   - Response time: < 1 second

3. **Authentication Service**
   - URL: `https://[your-project].supabase.co/auth/v1/health`
   - Expected: Status 200
   - Response time: < 1 second

4. **Supabase Dashboard** (Manual check)
   - Check Supabase dashboard for service health
   - Monitor database performance metrics

---

## Health Check Endpoint

Your Edge Function already has a health endpoint at line 112 of `index.ts`:

```typescript
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

**Test it:**
```bash
curl https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

---

## Alert Configuration

### Recommended Alert Rules

1. **Website Down**
   - Trigger: HTTP status code != 200
   - Alert after: 2 failed checks (10 minutes)
   - Notify: Email + Slack immediately

2. **Slow Response Time**
   - Trigger: Response time > 5 seconds
   - Alert after: 3 consecutive checks
   - Notify: Email (low priority)

3. **API Errors**
   - Trigger: Health endpoint returns error
   - Alert after: 1 failed check
   - Notify: Email + Slack immediately

4. **SSL Certificate Expiring**
   - Trigger: 30 days before expiration
   - Alert: Email reminder
   - Note: Vercel auto-renews SSL, but monitor anyway

### Alert Recipients

- **Primary:** Your personal email
- **Secondary:** Team Slack channel
- **Escalation:** Phone call (for extended downtime)

---

## Vercel Built-in Monitoring

Vercel provides built-in monitoring for deployments:

### Enable Vercel Analytics

1. Go to your Vercel project
2. Click "Analytics" tab
3. Enable Analytics
4. Monitor:
   - Page load times
   - Core Web Vitals
   - Traffic patterns
   - Geography distribution

### Vercel Speed Insights

1. Install package:
   ```bash
   npm install @vercel/speed-insights
   ```

2. Add to `App.tsx`:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/react';

   export default function App() {
     return (
       <>
         <YourApp />
         <SpeedInsights />
       </>
     );
   }
   ```

3. View insights in Vercel dashboard

**Cost:** $150/year (bundled with Pro plan)

---

## Supabase Monitoring

Supabase provides built-in monitoring:

### Database Health

1. Go to Supabase Dashboard
2. Click "Database" → "Performance"
3. Monitor:
   - Query performance
   - Active connections
   - Database size
   - Index usage

### Edge Functions

1. Go to "Edge Functions" → "Logs"
2. Monitor:
   - Invocation count
   - Error rate
   - Response times
   - Memory usage

### Set Up Alerts

1. Go to "Project Settings" → "Integrations"
2. Connect Slack/Discord for alerts
3. Configure alert thresholds:
   - Database CPU > 80%
   - Connection pool exhaustion
   - Storage > 90% full

---

## Status Page Setup

Create a public status page so users can check service health:

### Option 1: UptimeRobot Status Page

1. In UptimeRobot, go to "Public Status Pages"
2. Create new status page
3. Add all monitors
4. Customize branding (Bonded logo, colors)
5. URL: `https://status.bonded.app` (custom domain) or `bonded-status.uptimerobot.com`

### Option 2: Statuspage.io

1. Create account: https://www.atlassian.com/software/statuspage
2. Set up status page
3. Connect to monitoring services
4. Add custom domain

### Status Page Content

Include:
- ✅ Current system status (Operational/Degraded/Down)
- ✅ Individual component status (Frontend, API, Database)
- ✅ Incident history
- ✅ Scheduled maintenance notices
- ✅ Subscribe to updates (email/SMS)

---

## Incident Response Workflow

When an alert is triggered:

### 1. Acknowledge Alert
- Open UptimeRobot/Better Stack dashboard
- Acknowledge incident to stop repeat alerts

### 2. Check Vercel Dashboard
- Go to Vercel project dashboard
- Check latest deployment status
- Review deployment logs

### 3. Check Supabase Dashboard
- Go to Supabase project dashboard
- Check database status
- Review Edge Function logs
- Check API usage quotas

### 4. Check Sentry
- Go to Sentry dashboard
- Look for recent error spikes
- Identify error patterns

### 5. Investigate Root Cause
- Check recent code deployments
- Review error logs
- Check third-party service status:
  - https://www.vercel-status.com
  - https://status.supabase.com

### 6. Take Action
- Rollback deployment if needed: `vercel rollback`
- Scale resources if needed
- Apply hotfix
- Update status page

### 7. Post-Incident
- Update status page with resolution
- Write postmortem (if major incident)
- Implement preventive measures

---

## Monitoring Checklist

### Initial Setup
- [ ] Create UptimeRobot account
- [ ] Add frontend monitor
- [ ] Add API health check monitor
- [ ] Configure email alerts
- [ ] Configure Slack alerts
- [ ] Create public status page
- [ ] Test alerts (pause monitor to trigger alert)

### Weekly
- [ ] Review uptime reports
- [ ] Check response time trends
- [ ] Review incident logs
- [ ] Verify alerts are working

### Monthly
- [ ] Review 30-day uptime percentage (goal: >99.5%)
- [ ] Analyze downtime causes
- [ ] Update alert thresholds if needed
- [ ] Check monitoring service limits

---

## Quick Start (15 minutes)

1. **Sign up for UptimeRobot** (Free)
   - https://uptimerobot.com/signUp

2. **Add these monitors:**
   ```
   Monitor 1:
   Name: Bonded Frontend
   URL: https://bonded.vercel.app

   Monitor 2:
   Name: Bonded API
   URL: https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health
   ```

3. **Add your email** for alerts

4. **Create status page** and share with team

5. **Test:** Pause one monitor and verify you receive an alert

---

## Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **UptimeRobot** | 50 monitors, 5-min checks | $7/mo for 1-min checks | Startups |
| **Better Stack** | 10 monitors (trial) | $20/mo | Growing teams |
| **Pingdom** | 14-day trial | $10-40/mo | Enterprise |
| **StatusCake** | 10 monitors | $24/mo | Budget option |

**Recommendation:** Start with UptimeRobot free tier, upgrade when you need faster checks.

---

## Advanced: Custom Monitoring

For more control, create a custom monitoring script:

```typescript
// scripts/monitor.ts
import fetch from 'node-fetch';

const endpoints = [
  { name: 'Frontend', url: 'https://bonded.vercel.app' },
  { name: 'API', url: 'https://[project].supabase.co/functions/v1/make-server-2516be19/health' },
];

async function checkHealth() {
  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(endpoint.url);
      const duration = Date.now() - start;

      if (!response.ok) {
        console.error(`❌ ${endpoint.name} is DOWN (${response.status})`);
        // Send alert (email, Slack, etc.)
      } else {
        console.log(`✅ ${endpoint.name} is UP (${duration}ms)`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint.name} ERROR:`, error.message);
      // Send alert
    }
  }
}

// Run every 5 minutes
setInterval(checkHealth, 5 * 60 * 1000);
```

Run with:
```bash
npx tsx scripts/monitor.ts
```

Or deploy to a cron service (Vercel Cron, AWS Lambda, etc.)

---

## Summary

**Minimum viable monitoring:**
1. UptimeRobot (free) - Monitor frontend + API
2. Email alerts configured
3. Check once a week

**Recommended production setup:**
1. UptimeRobot or Better Stack - Uptime monitoring
2. Vercel Analytics - Performance monitoring
3. Sentry - Error tracking
4. Supabase dashboard - Database monitoring
5. Public status page
6. Slack alerts for team

**Time to set up:** 30 minutes
**Cost:** $0-20/month
**Impact:** Catch issues before users do ✨

---

## Resources

- UptimeRobot: https://uptimerobot.com
- Better Stack: https://betterstack.com/uptime
- Pingdom: https://www.pingdom.com
- Vercel Status: https://www.vercel-status.com
- Supabase Status: https://status.supabase.com

Need help? Contact: support@bonded.app
