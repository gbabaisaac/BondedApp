# Seed Test Profiles

This guide shows you how to add test profiles to see how the Yearbook grid looks.

## Option 1: Using Browser Console (Easiest) ⭐

1. Open your app in the browser and **log in**
2. Open the browser console (F12 or right-click → Inspect → Console)
3. Get your access token from the Zustand store or localStorage
4. Run this code (replace `YOUR_SCHOOL_NAME` with your actual school name):

```javascript
// Get your school name from your profile (check the app or use the value you see in the Yearbook)
const school = 'YOUR_SCHOOL_NAME'; // e.g., "University of Illinois", "UIUC", etc.
const count = 50; // Number of test profiles to create

// Get access token from Zustand store (if available) or use the one from your app
// You can also check localStorage or the Zustand devtools
const accessToken = 'YOUR_ACCESS_TOKEN_HERE'; // Get this from your app's auth state

fetch(`https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/seed-test-profiles`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ school, count }),
})
.then(res => res.json())
.then(data => {
  console.log('✅ Success!', data);
  console.log(`Created ${data.count} test profiles`);
  // Refresh the page to see the new profiles
  window.location.reload();
})
.catch(err => console.error('❌ Error:', err));
```

**Quick way to get your access token:**
- In the browser console, check `localStorage` or look for your auth token
- Or use the Zustand devtools if you have them installed
- Or check the Network tab when the app loads profiles - the Authorization header will show your token

## Option 2: Using Node.js Script

1. Make sure you have Node.js installed
2. Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Run the script:
   ```bash
   node scripts/seed-test-profiles.js "University of Illinois" 50
   ```

## Option 3: Add a Dev Button (Temporary)

You can temporarily add a button to your app that calls the endpoint. Add this to `MainApp.tsx` or create a dev component.

## Notes

- The endpoint only works in development (not production)
- Test profiles will have random names, majors, interests, and profile pictures
- Profiles are added to the KV store, so they'll persist until cleared
- You can run this multiple times to add more profiles

