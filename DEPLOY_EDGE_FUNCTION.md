# Deploy Supabase Edge Function

## The Issue
You're getting a 404 error because the Edge Function needs to be deployed/updated in Supabase.

## Quick Fix - Deploy via Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref wmlklvlnxftedtylgxsc
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy make-server-2516be19
   ```

   Or if your function folder structure is different:
   ```bash
   cd src/supabase/functions
   supabase functions deploy make-server-2516be19 --no-verify-jwt
   ```

## Alternative: Deploy via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Find `make-server-2516be19` function
4. Click **Deploy** or **Redeploy**
5. Make sure the function code is up to date

## Verify Deployment

After deploying, test the endpoint:
```bash
curl https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/health
```

Should return: `{"status":"ok"}`

## Set Environment Variables

Make sure `GEMINI_API_KEY` is set in Supabase:

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add or update `GEMINI_API_KEY` with your Google AI API key
3. Get your API key from: https://makersuite.google.com/app/apikey

## Troubleshooting

- **404 Error**: Function not deployed or wrong function name
- **401 Error**: Missing or invalid API key
- **500 Error**: Check Edge Function logs in Supabase Dashboard

