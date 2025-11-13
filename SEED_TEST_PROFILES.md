# 🌱 Seed Test Profiles - Quick Guide

Add test profiles to see how the Yearbook grid looks!

## Easiest Method: Browser Console

1. **Open your app** and make sure you're logged in
2. **Open browser console** (F12 → Console tab)
3. **Copy and paste this code** (it will automatically get your school and token):

```javascript
// This will automatically get your school and access token from the app
const store = window.__ZUSTAND_STORE__ || (() => {
  // Try to get from Zustand devtools or localStorage
  const state = JSON.parse(localStorage.getItem('bonded-app-store') || '{}');
  return { getState: () => state };
})();

// Get your school name - check what value is used in your profile
// You can also check the Network tab when loading profiles to see the school parameter
const school = prompt('Enter your school name (e.g., "University of Illinois"):') || 'University of Illinois';
const count = parseInt(prompt('How many test profiles? (default: 50):') || '50');

// Get access token from Zustand store
let accessToken = '';
try {
  // Try to get from Zustand store
  const state = store.getState();
  accessToken = state?.accessToken || '';
  
  // If not found, try localStorage
  if (!accessToken) {
    const stored = localStorage.getItem('bonded-app-store');
    if (stored) {
      const parsed = JSON.parse(stored);
      accessToken = parsed?.state?.accessToken || '';
    }
  }
  
  // Last resort: check all localStorage keys
  if (!accessToken) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('token')) {
        const value = localStorage.getItem(key);
        if (value && value.length > 20) {
          accessToken = value;
          break;
        }
      }
    }
  }
} catch (e) {
  console.warn('Could not auto-detect token, you may need to enter it manually');
}

if (!accessToken) {
  accessToken = prompt('Enter your access token (check Network tab → Authorization header):') || '';
}

if (!accessToken) {
  console.error('❌ No access token found. Please check the Network tab when the app loads profiles to get your token.');
} else {
  console.log('🌱 Seeding test profiles...');
  console.log(`School: ${school}`);
  console.log(`Count: ${count}`);
  
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
    if (data.error) {
      console.error('❌ Error:', data.error);
    } else {
      console.log('✅ Success!', data.message);
      console.log(`📊 Created ${data.count} profiles`);
      console.log('🔄 Refreshing page...');
      setTimeout(() => window.location.reload(), 1000);
    }
  })
  .catch(err => {
    console.error('❌ Error:', err);
    console.log('💡 Tip: Check the Network tab to see the full error response');
  });
}
```

## Alternative: Manual Method

If the auto-detection doesn't work, use this simpler version:

```javascript
const school = 'YOUR_SCHOOL_NAME'; // Replace with your school name
const count = 50;
const accessToken = 'YOUR_ACCESS_TOKEN'; // Get from Network tab → Authorization header

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
  console.log('✅', data);
  window.location.reload();
})
.catch(err => console.error('❌', err));
```

## How to Get Your Access Token

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Filter by "profiles" or "make-server"
4. Click on a request to `/profiles`
5. Look at **Request Headers** → `Authorization: Bearer ...`
6. Copy the token (the part after "Bearer ")

## How to Get Your School Name

1. Check your profile in the app
2. Or look at the Network tab when profiles load - the URL will have `?school=...`
3. Or check the Zustand store: `JSON.parse(localStorage.getItem('bonded-app-store'))?.state?.userProfile?.school`

## What Gets Created?

- Random names, majors, class years
- Random interests and personality tags
- Random "looking for" options
- Profile pictures from Unsplash
- All profiles will be visible in the Yearbook grid

## Notes

- The endpoint only works in development (not production)
- You can run this multiple times to add more profiles
- Profiles are stored in KV store and will persist
- Default count is 50 profiles

