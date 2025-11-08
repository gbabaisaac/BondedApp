# CampusBond Troubleshooting Guide

## Quick Fix: Can't Login?

### ✅ EASIEST SOLUTION - Use Quick Demo
1. Look for the green **"Quick Demo Access"** card on the login page
2. Click **"Create & Login to Demo Account"**
3. This creates a random test account and logs you in automatically!

---

## Common Issues & Solutions

### Issue 1: "Invalid email or password" Error

**Cause:** The account doesn't exist yet.

**Solutions:**

**Option A - Quick Demo (Recommended):**
- Use the green "Quick Demo Access" card on the login page
- Creates account instantly and logs you in

**Option B - Use Existing Test Account:**
1. Click "Show test accounts" on login page
2. Click one of the accounts (e.g., john.doe@stanford.edu)
3. Password is pre-filled as "test123"
4. Click "Sign In"

**Option C - Create Multiple Test Accounts:**
1. Click "Need to create test data? Click here" on login page
2. Or navigate to `?setup=test` in URL
3. Click "Create Test Accounts"
4. Wait ~30 seconds
5. Return to login page and use any test account

### Issue 2: Login Button Does Nothing

**Check:**
1. Open browser console (F12 or Cmd+Option+I)
2. Look for red error messages
3. Check the Debug Panel (bottom-right corner):
   - State should show "auth"
   - Token should be ✗
   - Profile should be ✗

**Solutions:**
- Refresh the page
- Clear browser cache and cookies
- Try a different browser
- Use the Quick Demo option

### Issue 3: Stuck on Loading Screen

**Solutions:**
1. Wait 3-5 seconds (it auto-transitions)
2. If still stuck, refresh the page
3. Check browser console for errors

### Issue 4: "Profile not found" or Redirects to Profile Setup

**This is NORMAL if:**
- You just created an account via Quick Demo
- You're using a new test account

**What to do:**
- Complete the profile setup form
- Or use one of the pre-configured test accounts:
  - john.doe@stanford.edu
  - sarah.johnson@stanford.edu
  - mike.chen@stanford.edu

### Issue 5: Backend/Server Errors

**Symptoms:**
- Console shows 500 errors
- "Failed to fetch" messages
- Timeout errors

**Solutions:**
1. Check if the Supabase edge function is deployed
2. Verify environment variables are set
3. Check browser network tab for failed requests
4. Try again in a few seconds (server might be cold-starting)

### Issue 6: Email Validation Error

**Error:** "Please use a valid .edu email address"

**Cause:** Email must end in `.edu`

**Solution:**
- Use Quick Demo (handles this automatically)
- Or manually enter an email ending in `.edu`
- Test accounts all use `@stanford.edu`

---

## Debug Tools

### 1. Browser Console
- Press F12 (Windows) or Cmd+Option+I (Mac)
- Go to "Console" tab
- Look for log messages showing the login flow
- Red messages = errors

### 2. Debug Panel (Bottom-Right)
- Shows current app state
- Shows if you have a token
- Shows if profile is loaded
- Click to expand/collapse
- "Log to Console" button for detailed info

### 3. Network Tab
- Open DevTools (F12)
- Go to "Network" tab
- Try logging in
- Look for failed requests (red)
- Click on request to see error details

---

## Understanding the Login Flow

1. **Loading Screen** → Shows for 2 seconds
2. **Auth Page** → Login/signup form
3. **After Login Success:**
   - Backend checks for user profile
   - IF profile exists → **Main App**
   - IF no profile → **Profile Setup**
4. **Profile Setup** → 4-step form to create profile
5. **Main App** → Discover, Matches, Messages, Profile tabs

---

## Test Account Reference

### Pre-configured (via Test Data Setup):
```
john.doe@stanford.edu - test123
sarah.johnson@stanford.edu - test123
mike.chen@stanford.edu - test123
emily.davis@stanford.edu - test123
alex.rodriguez@stanford.edu - test123
```

### Quick Demo (creates random):
```
testuser.xxxxx@stanford.edu - test123456
```

---

## Still Having Issues?

### What to Check:
1. ✅ Browser console for errors
2. ✅ Debug panel shows correct state
3. ✅ Network tab shows successful requests (200/201 status)
4. ✅ Using .edu email address
5. ✅ Tried Quick Demo option

### Last Resort:
1. Clear all browser data
2. Use incognito/private window
3. Try different browser
4. Use Quick Demo - it's the most reliable!

### Report Issues:
Include in your report:
- Browser console logs
- Network tab errors
- Debug panel state
- Steps to reproduce
