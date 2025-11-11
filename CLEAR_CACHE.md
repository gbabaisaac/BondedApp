# Clear Browser Cache Instructions

The app uses a Progressive Web App (PWA) that caches API responses. If you're seeing old function responses, follow these steps:

## Option 1: Hard Refresh (Quick Fix)
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`
- **Mobile**: Close and reopen the browser tab

## Option 2: Clear Service Worker Cache (Recommended)
1. Open Developer Tools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Service Workers** in the left sidebar
4. Click **Unregister** for the Bonded service worker
5. Go to **Cache Storage** in the left sidebar
6. Right-click each cache and select **Delete**
7. Refresh the page

## Option 3: Clear All Site Data
1. Open Developer Tools (`F12`)
2. Go to **Application** tab
3. Click **Clear storage** in the left sidebar
4. Check all boxes
5. Click **Clear site data**
6. Refresh the page

## Option 4: Disable Cache (Development)
1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Check **Disable cache** checkbox
4. Keep DevTools open while testing

## After Clearing Cache
- The app will re-register the service worker with updated cache settings
- API calls will use a shorter 5-minute cache instead of 7 days
- You should see the latest function responses immediately

