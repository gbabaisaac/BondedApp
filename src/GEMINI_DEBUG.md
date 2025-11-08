# Gemini API Debug Guide

## The Issue

Gemini API integration may not be working. Here's how to debug and fix it.

## Step 1: Check if Gemini API Key is Set

Open browser console and check the Network tab when you start the Love Print quiz.

**What to look for:**
- Request to `/love-print/start`  
- Check the response - does it have an error?
- Look for messages like "GEMINI_API_KEY not configured"

## Step 2: Verify API Key Format

Gemini API keys should look like: `AIzaSy...` (starts with `AIzaSy`)

If your key doesn't match this format, it won't work.

## Step 3: Test Gemini API Directly

Try this in your browser console:

```javascript
const testGemini = async () => {
  const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual key
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say hello!' }]
        }]
      })
    }
  );
  
  const data = await response.json();
  console.log('Gemini response:', data);
};

testGemini();
```

**Expected result:**
- Should return JSON with `candidates[0].content.parts[0].text` = "Hello!"

**Common errors:**
- `403 Forbidden`: API key invalid or not enabled
- `400 Bad Request`: Request format issue
- `429 Rate Limit`: Too many requests

## Step 4: Get a New API Key

If API key doesn't work:

1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Enable "Generative Language API"
4. Copy the key
5. Update in your environment

## Step 5: Fallback System

**Good news:** The system has a fallback!

If Gemini fails, it uses preset questions instead. The quiz will still work, just won't be adaptive.

**To force fallback mode:**
- Quiz will automatically use fallback if Gemini fails
- Check server logs for "Using fallback questions"

## Step 6: Check Server Logs

In the Supabase dashboard:
1. Go to Edge Functions
2. Click on "make-server-2516be19"
3. View Logs
4. Look for:
   - "Calling Gemini API..."
   - "Gemini API success" (good!)
   - "Gemini failed, using fallback" (API not working, but quiz still works)
   - Any error messages

## Common Issues & Solutions

### Issue 1: "GEMINI_API_KEY not configured"
**Solution:** API key wasn't uploaded. Use the create_supabase_secret tool or add manually in Supabase dashboard.

### Issue 2: "403 Forbidden"
**Solution:** 
- API key invalid
- Get new key from https://makersuite.google.com/app/apikey
- Make sure "Generative Language API" is enabled

### Issue 3: "Failed to parse Gemini response"
**Solution:**
- Gemini returned unexpected format
- Fallback kicks in automatically
- Quiz still works

### Issue 4: Quiz doesn't start at all
**Solution:**
- Check browser console for JavaScript errors
- Check Network tab for failed requests
- Try refreshing the page

## Quick Fix: Use Fallback Mode

If you just want the quiz to work NOW, you can temporarily skip Gemini:

**Option A:** The fallback is already automatic! Just proceed with the quiz.

**Option B:** If you want to confirm fallback is working:
1. Start the quiz
2. Check browser console
3. Look for error messages
4. Quiz should still show questions (from fallback)

## Testing the Quiz

1. Create a new account or use existing
2. Complete profile setup
3. Start Love Print quiz
4. Answer 8 questions
5. View results

**What should happen:**
- Questions appear one by one
- Progress bar updates
- After 8 questions, generates Love Print
- Shows beautiful results page

**If it doesn't work:**
- Open browser console (F12)
- Check for errors
- Share the error message to debug further

## The Good News

Even if Gemini doesn't work:
✅ Quiz still works with preset questions
✅ Love Print still generates
✅ Results page still shows
✅ Compatibility matching still works

The only difference:
❌ Questions aren't adaptive (same for everyone)
❌ Love Print analysis is algorithmic, not AI-generated

## Next Steps

Once you get the Gemini API working properly:
- Quiz questions will adapt based on answers
- Love Print will have AI-generated insights
- Compatibility analysis will be more nuanced

But the system is **fully functional** even without Gemini! 🎉
