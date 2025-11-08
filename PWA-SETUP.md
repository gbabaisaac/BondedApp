# PWA Setup Guide for Bonded

## Current Status

Your app has been configured as a Progressive Web App (PWA) with the following improvements:

### ✅ Completed

1. **Fixed Mobile Scrolling Issues**
   - Updated `OnboardingWizard.tsx` to use dynamic viewport height (`100dvh`)
   - Fixed `LoveModeOnboarding.tsx` scrolling
   - Fixed `BondPrintQuiz.tsx` viewport issues
   - Added proper flex container management to prevent bottom content cutoff

2. **PWA Manifest**
   - Created `public/manifest.json` with app metadata
   - Linked manifest in `src/index.html`
   - Configured app name, theme colors, and display mode

3. **Service Worker**
   - Installed `vite-plugin-pwa` for automatic service worker generation
   - Configured Workbox for offline caching
   - Set up runtime caching for:
     - Supabase API calls (NetworkFirst strategy)
     - Images (CacheFirst strategy)

4. **Icon Generator**
   - Created `generate-icons.html` for easy icon generation

## 🚀 Next Steps for Production

### 1. Generate App Icons

**Option A: Use the Icon Generator (Recommended for Quick Setup)**
1. Open `generate-icons.html` in your browser
2. Click "Download All Icons"
3. Save the downloaded files (`icon-192.png` and `icon-512.png`) to the `public/` folder

**Option B: Create Custom Icons (Recommended for Production)**
1. Design your app icon in Figma, Photoshop, or Illustrator
2. Export as PNG in the following sizes:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
3. Place them in the `public/` folder
4. Ensure icons are:
   - High quality with transparent or rounded corners
   - Recognizable at small sizes
   - Match your brand colors (#6366F1 to #EC4899 gradient)

### 2. Add a Favicon
Create and add `public/favicon.svg` or `public/favicon.ico`

### 3. Optional: Add Screenshots
For better app listing in app stores and browsers:
1. Take screenshots of your app (540x720px for mobile)
2. Add them to `public/` folder
3. Update the `screenshots` section in `manifest.json`

### 4. Test Your PWA

**Local Testing:**
```bash
npm run build
npm run preview  # or use a local server to test the built version
```

**Test Checklist:**
- [ ] App installs on mobile (Chrome: "Add to Home Screen")
- [ ] App works offline (disconnect network and refresh)
- [ ] Bottom navigation/buttons are accessible (not cut off)
- [ ] Scrolling works smoothly on all onboarding screens
- [ ] Service worker updates properly
- [ ] Icons display correctly on home screen

**Testing Tools:**
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Application > Service Workers
- Chrome DevTools > Lighthouse (run PWA audit)

### 5. Performance Optimization

Already configured:
- ✅ Code splitting for vendor libraries
- ✅ CSS minification
- ✅ Image caching
- ✅ Lazy loading of components

Additional recommendations:
- [ ] Compress images (use WebP format)
- [ ] Enable gzip/brotli compression on server
- [ ] Consider adding loading skeletons for better UX
- [ ] Optimize bundle size (check with `npm run build`)

### 6. Production Deployment Checklist

Before deploying:
- [ ] Update `start_url` in manifest.json if needed
- [ ] Set proper cache expiration times
- [ ] Test on multiple devices (iOS, Android)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Ensure HTTPS is enabled (required for PWA)
- [ ] Verify service worker registration
- [ ] Test offline functionality
- [ ] Check console for errors
- [ ] Run Lighthouse audit (target: 90+ PWA score)

### 7. iOS-Specific Considerations

The app already includes iOS meta tags in `index.html`:
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `apple-touch-icon` links

Additional iOS considerations:
- iOS doesn't support all PWA features (like push notifications)
- Test "Add to Home Screen" on Safari
- Ensure splash screen looks good (auto-generated from manifest)

### 8. Android-Specific Considerations

Android has better PWA support:
- Test installation from Chrome
- Verify app shows in app drawer
- Test deep linking if applicable

## Build Commands

```bash
# Development with PWA enabled
npm run dev

# Build for production
npm run build

# Preview production build locally
npx vite preview
```

## Troubleshooting

### Service Worker Not Updating
- Clear browser cache and service worker
- Increment version in manifest.json
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Bottom Content Still Cut Off
- Check if viewport meta tag is present
- Verify `100dvh` is being applied
- Test on actual device (not just browser DevTools)

### Icons Not Showing
- Verify files exist in `public/` folder
- Check file names match manifest.json
- Clear cache and reinstall app

### Offline Not Working
- Check service worker registration in DevTools
- Verify network requests are being cached
- Check Workbox configuration in vite.config.ts

## Resources

- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Support

If you encounter issues:
1. Check browser console for errors
2. Use Chrome DevTools > Application tab for debugging
3. Test in incognito mode to avoid cache issues
4. Verify HTTPS is enabled in production
