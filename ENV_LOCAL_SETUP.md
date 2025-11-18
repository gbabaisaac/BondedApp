# Local Development Environment Setup

## The Problem
Profile creation works in production but fails locally because environment variables aren't set up.

## Quick Fix

1. **Create a `.env` file in the root directory** (same level as `package.json`):

```bash
# .env file
VITE_SUPABASE_URL=https://wmlklvlnxftedtylgxsc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGtsdmxueGZ0ZWR0eWxneHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDE0MTMsImV4cCI6MjA3ODExNzQxM30.HVA2dsB9HerH4qNYTSiIsPzYMbeSLcWjnj82ErRQ0z4
VITE_ENV=development
```

2. **Restart your dev server** after creating the `.env` file:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## Why This Happens

- **Production (Vercel)**: Environment variables are set in Vercel dashboard, so they work automatically
- **Local Dev**: You need a `.env` file for Vite to load environment variables

## Important Notes

- The `.env` file is already in `.gitignore`, so it won't be committed
- Vite only loads variables that start with `VITE_`
- You must restart the dev server after creating/modifying `.env`

## Verify It's Working

After setting up `.env` and restarting:
1. Check browser console - you should NOT see the warning: "⚠️ Supabase configuration missing"
2. Try creating a profile - it should work now

## If It Still Doesn't Work

1. **Check the `.env` file location**: Must be in the root directory (same folder as `package.json`)
2. **Check variable names**: Must start with `VITE_` (case-sensitive)
3. **Restart dev server**: Environment variables only load on startup
4. **Check browser console**: Look for any error messages about missing config


