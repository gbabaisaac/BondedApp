// Bond Print Quiz Helpers with Gemini + Fallback

import { fallbackQuestions, generateFallbackBondPrint } from "./fallback-quiz.tsx";

// Try to call Gemini, return null if fails
export async function tryCallGemini(prompt: string): Promise<string | null> {
  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[GEMINI] GEMINI_API_KEY not configured in environment variables');
      console.error('[GEMINI] Please set GEMINI_API_KEY in Supabase Dashboard > Project Settings > Edge Functions > Secrets');
      return null;
    }

    if (apiKey.length < 20) {
      console.error('[GEMINI] GEMINI_API_KEY appears to be invalid (too short)');
      return null;
    }

    console.log('[GEMINI] Calling Gemini API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GEMINI] API error (${response.status}):`, errorText);
      
      if (response.status === 401) {
        console.error('[GEMINI] Authentication failed - check your API key');
      } else if (response.status === 429) {
        console.error('[GEMINI] Rate limit exceeded');
      } else if (response.status === 400) {
        console.error('[GEMINI] Bad request - check prompt format');
      }
      
      return null;
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error('[GEMINI] Invalid response structure:', JSON.stringify(data).substring(0, 200));
      return null;
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('[GEMINI] API success, response length:', responseText.length);
    return responseText;
  } catch (error: any) {
    console.error('[GEMINI] Call failed:', error.message);
    console.error('[GEMINI] Error stack:', error.stack);
    return null;
  }
}

// Get first question (try Gemini, fall back to preset)
export async function getFirstQuestion(userProfile: any): Promise<any> {
  const prompt = `You are an emotional intelligence expert creating a personalized "Bond Print" quiz - a psychological profile for college students looking for friends, roommates, study partners, and collaborators.

User Info: ${userProfile.name}, ${userProfile.major}, ${userProfile.year}

Create the FIRST question of an adaptive quiz to understand their personality, communication style, social preferences, and collaboration style. This will help match them with compatible people for friendships, study groups, co-founders, and roommates.

Requirements:
- Make it conversational and engaging
- Relate to their college life and major if possible
- Ask about ONE specific trait (communication, social energy, conflict style, values, collaboration style, etc.)
- Provide 3-4 answer options that clearly differentiate personality types
- Make answers feel natural, not clinical
- Focus on friendship, collaboration, and social connection (not romantic relationships)

Return ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "question": "the question text",
  "options": ["option 1", "option 2", "option 3", "option 4"]
}`;

  const geminiResponse = await tryCallGemini(prompt);
  
  if (geminiResponse) {
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Using Gemini-generated first question');
        return { question: parsed, usedGemini: true };
      }
    } catch (e) {
      console.log('Failed to parse Gemini response, using fallback');
    }
  }
  
  console.log('Using fallback first question');
  return { question: fallbackQuestions[0], usedGemini: false };
}

// Get next question based on answers
export async function getNextQuestion(quizSession: any): Promise<any> {
  const questionIndex = quizSession.currentQuestion - 1;
  
  // If using Gemini and it worked before, try it again
  if (quizSession.usedGemini !== false) {
    const previousAnswers = quizSession.answers.map((a: any) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');
    
    const prompt = `You are an emotional intelligence expert creating an adaptive "Bond Print" quiz for college students looking for friends, roommates, study partners, and collaborators.

User Info: ${quizSession.userProfile.name}, ${quizSession.userProfile.major}, ${quizSession.userProfile.year}

Previous answers:
${previousAnswers}

Based on their answers so far, create the NEXT question to deepen understanding of their:
- Personality traits (introvert/extrovert, spontaneous/planned, etc.)
- Communication style (direct/subtle, emotional/logical, etc.)
- Social preferences (group/1-on-1, competitive/collaborative, etc.)
- Collaboration style (leadership, teamwork, independence, etc.)
- Values and priorities (independence/community, adventure/stability, etc.)
- Living habits (cleanliness, noise, schedules, etc.)
- Academic and professional goals alignment

Make the question build on what you've learned. If they seem introverted, ask about their recharge methods. If extroverted, ask about social energy. Focus on friendship, collaboration, and connection (not romantic relationships).

Return ONLY a JSON object (no markdown):
{
  "question": "the question text",
  "options": ["option 1", "option 2", "option 3", "option 4"]
}`;

    const geminiResponse = await tryCallGemini(prompt);
    
    if (geminiResponse) {
      try {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Using Gemini-generated next question');
          return parsed;
        }
      } catch (e) {
        console.log('Failed to parse Gemini response for next question');
      }
    }
  }
  
  // Fall back to preset questions
  if (questionIndex < fallbackQuestions.length) {
    console.log(`Using fallback question ${questionIndex + 1}`);
    return fallbackQuestions[questionIndex];
  }
  
  // If we somehow run out, return a generic question
  return {
    question: "How would you describe your approach to new situations?",
    options: [
      "I jump right in and figure it out as I go",
      "I prefer to plan and prepare beforehand",
      "I like to observe first, then participate",
      "I seek advice from others before diving in"
    ]
  };
}

// Generate Love Print from answers
export async function generateLovePrint(quizSession: any): Promise<any> {
  const answersText = quizSession.answers.map((a: any) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');
  
  // Get full profile data including goals and additionalInfo
  const profile = quizSession.userProfile;
  const goalsText = profile.goals ? `
Academic Goals: ${profile.goals.academic?.join(', ') || 'None specified'}
Leisure Goals: ${profile.goals.leisure?.join(', ') || 'None specified'}
Career Goal: ${profile.goals.career || 'None specified'}
Personal Goal: ${profile.goals.personal || 'None specified'}
` : '';
  
  const additionalInfoText = profile.additionalInfo ? `\nAdditional Context: ${profile.additionalInfo}` : '';
  
  // Try Gemini first
  const prompt = `You are an emotional intelligence expert analyzing quiz responses to create a "Bond Print" - a comprehensive personality profile for college students looking for friends, roommates, study partners, co-founders, and collaborators.

User: ${profile.name}, ${profile.major}, ${profile.year || ''}
Interests: ${profile.interests?.join(', ') || 'None specified'}
Looking For: ${profile.lookingFor?.join(', ') || 'None specified'}
${goalsText}${additionalInfoText}

Quiz Responses:
${answersText}

Create a detailed Bond Print analysis that incorporates their goals, interests, and additional context. This will be used to match them with compatible people for:
- Friendships and social connections
- Roommates and living situations
- Study partners and academic collaboration
- Co-founders and business partners
- Activity partners and shared interests

Focus on friendship, collaboration, and professional connections (not romantic relationships).

Return ONLY a JSON object (no markdown):

{
  "traits": {
    "socialEnergy": 0-1,
    "communication": 0-1,
    "emotionalStyle": 0-1,
    "spontaneity": 0-1,
    "conflictStyle": 0-1,
    "independence": 0-1,
    "adventurousness": 0-1,
    "empathy": 0-1,
    "competitiveness": 0-1
  },
  "personality": {
    "primaryType": "one of: Social Butterfly, Deep Thinker, Adventurer, Harmonizer, Leader, Creative Soul, Steady Rock, Free Spirit",
    "secondaryTraits": ["trait1", "trait2", "trait3"],
    "description": "2-3 sentence natural description"
  },
  "communication": {
    "style": "one of: Direct & Honest, Warm & Supportive, Playful & Witty, Thoughtful & Reserved, Energetic & Enthusiastic",
    "preferences": ["pref1", "pref2"]
  },
  "social": {
    "idealSetting": "one of: Large groups, Small intimate groups, One-on-one, Mix of both",
    "rechargeMethod": "how they recharge",
    "friendshipStyle": "how they approach friendships"
  },
  "values": ["value1", "value2", "value3", "value4"],
  "livingPreferences": {
    "cleanliness": 0-1,
    "noiseLevel": 0-1,
    "socialSpace": 0-1,
    "schedule": "one of: Early Bird, Night Owl, Flexible, Structured"
  },
  "summary": "One compelling sentence"
}`;

  const geminiResponse = await tryCallGemini(prompt);
  
  if (geminiResponse) {
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const bondPrint = JSON.parse(jsonMatch[0]);
        bondPrint.createdAt = new Date().toISOString();
        bondPrint.quizVersion = '1.0-gemini';
        console.log('Using Gemini-generated Bond Print');
        return bondPrint;
      }
    } catch (e) {
      console.log('Failed to parse Gemini Bond Print response');
    }
  }
  
  // Fall back to algorithmic generation
  console.log('Using fallback Bond Print generation');
  const bondPrint = generateFallbackBondPrint(quizSession.answers);
  bondPrint.createdAt = new Date().toISOString();
  bondPrint.quizVersion = '1.0-fallback';
  return bondPrint;
}
