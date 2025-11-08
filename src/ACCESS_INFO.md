# 🔗 Access Your App - bonded

## ⚠️ IMPORTANT UPDATE

**You asked:** "I don't want beta testers to see the Figma file"

**Solution:** Deploy to Netlify or Vercel instead of using Figma Make!

---

## 🚀 Deploy Your App (No Figma Visibility)

### ⚡ Quick Deploy (3 minutes)

```bash
npm install
npm run build
```

Then go to: **https://app.netlify.com/drop**

Drag your `dist` folder → Get your URL!

**Full Guide:** See `/DEPLOY_NOW.md`

---

## 📱 Your App URLs

### ❌ Don't Share This (Shows Figma)
```
https://[figma-make-id].figma.com/...
```
Beta testers will see your Figma workspace!

### ✅ Share This Instead (After Deploy)
```
https://bonded-app.netlify.app
```
Clean app experience, no Figma visibility!

### ❌ Also Not This (Just the Backend)
```
https://wmlklvlnxftedtylgxsc.supabase.co/...
```
This is only the API, not the full app.

---

## 📱 Quick Access

### Desktop/Laptop
1. **Copy the URL above**
2. **Paste in Chrome, Safari, or Firefox**
3. **Bookmark it** for easy access

### Mobile (iOS)
1. **Open the URL in Safari**
2. **Tap the Share button** (square with arrow)
3. **Scroll down and tap "Add to Home Screen"**
4. **Tap "Add"**
5. **App icon appears on your home screen!**

### Mobile (Android)
1. **Open the URL in Chrome**
2. **Tap the 3-dot menu**
3. **Tap "Add to Home screen"**
4. **Tap "Add"**
5. **App icon appears on your home screen!**

---

## 🎓 Beta Access - Who Can Sign Up?

**Currently Whitelisted:**
- ✅ **@uri.edu** - All University of Rhode Island students
- ✅ **@illinois.edu** - All University of Illinois students
- ✅ **@stanford.edu** - All Stanford students
- ✅ **@berkeley.edu** - All UC Berkeley students

**How to sign up:**
1. Open the app URL
2. Enter your university email (e.g., yourname@uri.edu)
3. Click "Check Access"
4. If approved, you can create an account!

---

## 🧪 Test Accounts (For Quick Testing)

If you want to test without creating a new account, you can use:

**Test Account 1:**
- Email: `test1@uri.edu`
- Password: `password123`

**Test Account 2:**
- Email: `test2@illinois.edu`
- Password: `password123`

*Note: You may need to create these accounts first if they don't exist yet.*

---

## ➕ Adding More Schools

To add more universities to the beta:

1. **Open** `/components/BetaAccessGate.tsx`
2. **Find** the `BETA_EMAILS` array (around line 15)
3. **Add** your school:

```typescript
const BETA_EMAILS = [
  '@uri.edu',
  '@illinois.edu',
  '@youruniversity.edu',  // ← Add here
];
```

4. **Save** and the app will automatically update!

---

## 📧 Share With Your Friends

Send them this message:

```
Hey! Check out bonded - a new social app for college students!

🔗 Link: https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19

📱 Works best on mobile (add to home screen!)

Sign up with your @uri.edu or @illinois.edu email.

Let me know what you think!
```

---

## 🎯 What to Test

Once you're in:

1. ✅ **Create your profile** (add photos, interests, bio)
2. ✅ **Take the Bond Print quiz** (AI personality test)
3. ✅ **Browse profiles** in Discover tab
4. ✅ **Send connection requests**
5. ✅ **Chat with connections** in Messages tab
6. ✅ **Try Love Mode** (optional dating mode)

---

## 🐛 Troubleshooting

### "Beta access denied"
- Make sure you're using @uri.edu or @illinois.edu email
- Check spelling of your email
- Contact support if you should have access

### "Page not loading"
- Check your internet connection
- Try refreshing the page
- Clear browser cache
- Try a different browser

### "Photos won't upload"
- Make sure photos are < 5MB
- Use JPG or PNG format
- Try a different photo
- Check internet connection

### "Can't send messages"
- Make sure you're connected with the person
- Check internet connection
- Wait a few seconds and try again

---

## 📊 Monitor Your Beta

As the app creator, you can track usage by checking:

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. **Project**: wmlklvlnxftedtylgxsc
3. **Storage**: See how many photos uploaded
4. **Auth**: See how many users signed up

---

## 🔒 Privacy & Security

- ✅ All data encrypted in transit
- ✅ Passwords hashed and secure
- ✅ Photos stored in private buckets
- ✅ Only .edu emails can sign up
- ✅ Users can only see profiles at their school

---

## 🚀 Quick Command Center

### Your App URL
```
https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19
```

### Supabase Dashboard
```
https://supabase.com/dashboard/project/wmlklvlnxftedtylgxsc
```

### Supabase Project ID
```
wmlklvlnxftedtylgxsc
```

### Beta Schools
```
@uri.edu
@illinois.edu
@stanford.edu
@berkeley.edu
```

---

## 📱 QR Code (Optional)

You can create a QR code for easy mobile access:

1. Go to: https://qr-code-generator.com
2. Paste your app URL
3. Download the QR code
4. Share with friends to scan and install!

---

## 🎉 You're All Set!

**Copy this URL and start testing:**
```
https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19
```

**Beta schools enabled:**
- University of Rhode Island (@uri.edu)
- University of Illinois (@illinois.edu)
- Stanford (@stanford.edu)
- UC Berkeley (@berkeley.edu)

**Enjoy your app! 🚀**

Need help? Check the other documentation files in your project!
