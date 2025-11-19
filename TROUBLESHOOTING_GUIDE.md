# 🔧 Troubleshooting Guide

Common issues and solutions for the Bonded app.

---

## 🔐 **Authentication Issues**

### Issue: "Unauthorized" or 401 errors

**Symptoms:**
- Users can't access features
- API calls return 401
- "Please log in again" messages

**Solutions:**
1. **Check access token:**
   ```javascript
   // In browser console
   localStorage.getItem('accessToken')
   ```

2. **Verify token expiration:**
   - Tokens expire after 1 hour
   - User needs to refresh/login again

3. **Check Supabase auth:**
   - Verify user exists in Supabase Auth
   - Check if account is disabled

4. **Clear and re-login:**
   ```javascript
   localStorage.clear();
   // Then login again
   ```

---

## 🌐 **Network Issues**

### Issue: "Failed to fetch" errors

**Symptoms:**
- Network errors in console
- API calls fail
- "Network error" toasts

**Solutions:**
1. **Check CORS configuration:**
   - Verify your domain is in allowed origins
   - Check Edge Function CORS settings
   - Ensure `ENVIRONMENT=production` is set

2. **Check network connectivity:**
   - Verify internet connection
   - Check if Supabase is down: https://status.supabase.com

3. **Verify API endpoint:**
   - Check Edge Function is deployed
   - Verify function URL is correct
   - Test with: `curl https://your-project.supabase.co/functions/v1/make-server-2516be19/health`

---

## 💾 **Database Issues**

### Issue: "Profile not found" or data not loading

**Symptoms:**
- Profiles don't load
- Posts don't appear
- Empty lists

**Solutions:**
1. **Check RLS policies:**
   - Verify policies are enabled
   - Check if user has read permissions
   - Review policy conditions

2. **Check data exists:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM profiles WHERE id = 'user-id';
   ```

3. **Verify KV store:**
   - Check if profile exists in KV
   - May need to recreate profile

---

## 📤 **Upload Issues**

### Issue: Media upload fails

**Symptoms:**
- Images don't upload
- "Upload failed" errors
- Files too large errors

**Solutions:**
1. **Check file size:**
   - Images: Max 10MB (compressed to 2MB)
   - Videos: Max 50MB

2. **Check storage bucket:**
   - Verify bucket exists
   - Check bucket permissions
   - Ensure bucket is configured correctly

3. **Check file type:**
   - Only images and videos allowed
   - Verify MIME type is correct

---

## 🔔 **Notification Issues**

### Issue: Notifications not appearing

**Symptoms:**
- No notifications shown
- Notifications don't update
- Mark as read doesn't work

**Solutions:**
1. **Check notification creation:**
   - Verify notifications are being created in database
   - Check `notifications` table

2. **Check API response:**
   - Verify `/notifications` endpoint works
   - Check for errors in network tab

3. **Check polling:**
   - Notifications refetch every 60 seconds
   - Check if query is enabled

---

## 🔍 **Search Issues**

### Issue: Search returns no results

**Symptoms:**
- Search shows "No results"
- Search doesn't work
- Wrong results returned

**Solutions:**
1. **Check search query:**
   - Minimum 1 character required
   - Verify query is being sent

2. **Check backend:**
   - Verify `/search` endpoint is working
   - Check search type parameter

3. **Check data:**
   - Ensure profiles/posts exist
   - Verify school filtering

---

## 💬 **Messaging Issues**

### Issue: Messages not loading or sending

**Symptoms:**
- Messages don't appear
- Can't send messages
- Conversations empty

**Solutions:**
1. **Check chat creation:**
   - Verify chat exists in KV store
   - Check chat participants

2. **Check message storage:**
   - Verify messages are stored
   - Check KV store keys

3. **Check permissions:**
   - Verify user is participant
   - Check RLS policies

---

## 🎨 **UI/UX Issues**

### Issue: Components not rendering correctly

**Symptoms:**
- Layout broken
- Styles not applied
- Components missing

**Solutions:**
1. **Clear cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache

2. **Check CSS:**
   - Verify Tailwind is compiled
   - Check for CSS conflicts
   - Verify design tokens are loaded

3. **Check React errors:**
   - Open browser console
   - Look for React errors
   - Check for missing dependencies

---

## ⚡ **Performance Issues**

### Issue: App is slow

**Symptoms:**
- Slow loading
- Laggy interactions
- Timeouts

**Solutions:**
1. **Check bundle size:**
   ```bash
   npm run build
   # Check bundle size in dist/
   ```

2. **Enable caching:**
   - React Query is already set up
   - Verify queries are cached
   - Check stale times

3. **Optimize images:**
   - Images are compressed client-side
   - Consider CDN for images
   - Use lazy loading

4. **Check database:**
   - Review slow queries
   - Add indexes if needed
   - Optimize RLS policies

---

## 🐛 **Common Errors**

### Error: "Rendered more hooks than during the previous render"

**Cause:** Conditional hook calls

**Solution:**
- Ensure all hooks are called unconditionally
- Move hooks to top of component
- Don't call hooks inside conditions

### Error: "Cannot read property of undefined"

**Cause:** Missing data or null values

**Solution:**
- Add null checks
- Use optional chaining (`?.`)
- Provide default values

### Error: "Network request failed"

**Cause:** CORS or network issues

**Solution:**
- Check CORS configuration
- Verify API endpoint
- Check network connectivity

---

## 📝 **Debugging Tips**

### 1. Enable Debug Logging
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### 2. Check Network Tab
- Open DevTools → Network
- Filter by "Fetch/XHR"
- Check request/response details

### 3. Check React DevTools
- Install React DevTools extension
- Inspect component state
- Check props and hooks

### 4. Check Supabase Logs
- Go to Supabase dashboard
- Edge Functions → Logs
- Review function execution logs

---

## 🆘 **Getting Help**

If issues persist:

1. **Check logs:**
   - Browser console
   - Supabase Edge Function logs
   - Vercel deployment logs
   - Sentry error tracking

2. **Collect information:**
   - Error messages
   - Steps to reproduce
   - Browser/device info
   - Network conditions

3. **Review documentation:**
   - API Documentation
   - Deployment Guide
   - Environment Variables Guide

---

**Most issues can be resolved by checking logs and verifying configuration! 🔍**

