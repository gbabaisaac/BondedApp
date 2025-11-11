# Supabase Edge Function Setup Guide

## Step-by-Step Deployment Process

### Step 1: Install/Verify Supabase CLI

The CLI appears to be installed but may not be in your PATH. Try:

```bash
# Option 1: Use npx (recommended)
npx supabase --version

# Option 2: Install globally
npm install -g supabase

# Option 3: Add to PATH manually
# Add C:\Users\gbaba\AppData\Roaming\npm to your system PATH
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

This will open a browser window for authentication. Follow the prompts.

### Step 3: Link Your Project

```bash
npx supabase link --project-ref wmlklvlnxftedtylgxsc
```

You'll need your database password. You can find it in:
- Supabase Dashboard → Project Settings → Database → Database Password

### Step 4: Verify Function Structure

The function is located at:
```
supabase/functions/make-server-2516be19/
├── index.tsx (main entry point)
├── kv_store.tsx (key-value store helper)
├── love-print-helpers.tsx (Bond Print helpers)
├── fallback-quiz.tsx (quiz fallbacks)
└── deno.json (Deno configuration)
```

### Step 5: Deploy the Function

From the project root directory:

```bash
npx supabase functions deploy make-server-2516be19
```

**Important**: Make sure you're in `C:\Users\gbaba\Downloads\Bonded` when running this.

### Step 6: Set Environment Variables

After deployment, set the required secrets in Supabase Dashboard:

1. Go to: **Project Settings** → **Edge Functions** → **Secrets**
2. Add/Update:
   - `GEMINI_API_KEY` - Your Google AI API key
   - `SUPABASE_URL` - Your Supabase project URL (auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (auto-set)

### Step 7: Test the Deployment

Test the health endpoint:

```bash
curl https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health
```

Should return: `{"status":"ok"}`

### Troubleshooting

**404 Error**: 
- Function not deployed or wrong function name
- Verify the function exists in Supabase Dashboard → Edge Functions

**401 Error**: 
- Missing or invalid authorization token
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

**500 Error**: 
- Check Edge Function logs in Supabase Dashboard
- Verify all dependencies are correct in `deno.json`

**Import Errors**:
- The function uses `npm:` imports which Deno supports
- Make sure `deno.json` is in the function directory

### Quick Deploy Command

Once everything is set up, you can deploy with:

```bash
cd C:\Users\gbaba\Downloads\Bonded
npx supabase functions deploy make-server-2516be19
```

### Verify Routes

All routes are now relative (no `/make-server-2516be19` prefix):
- ✅ `/health` → `https://.../functions/v1/make-server-2516be19/health`
- ✅ `/soft-intro/generate-ai-analysis` → `https://.../functions/v1/make-server-2516be19/soft-intro/generate-ai-analysis`
- ✅ `/chats` → `https://.../functions/v1/make-server-2516be19/chats`

The function name is automatically prepended by Supabase.

