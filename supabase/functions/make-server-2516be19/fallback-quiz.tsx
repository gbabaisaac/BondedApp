// Fallback quiz questions if Gemini API fails
// This ensures the Bond Print system works even without AI

export const fallbackQuestions = [
  {
    question: "How do you typically recharge after a long day of classes?",
    options: [
      "Alone time in my room with a book or show",
      "Grabbing coffee or dinner with a few close friends",
      "Hitting up a party or social event",
      "Video chatting with friends back home"
    ]
  },
  {
    question: "When working on a group project, you tend to:",
    options: [
      "Take charge and organize everything",
      "Support the team and help where needed",
      "Focus on your specific task independently",
      "Brainstorm creative ideas and solutions"
    ]
  },
  {
    question: "How would you describe your ideal weekend?",
    options: [
      "Exploring something new - new cafe, hiking trail, or event",
      "Relaxing at home with familiar comforts",
      "Catching up on work/studying to stay ahead",
      "Hanging out with friends, no specific plans"
    ]
  },
  {
    question: "When you have a disagreement with a friend or roommate:",
    options: [
      "I address it directly and openly right away",
      "I give it time and bring it up when emotions settle",
      "I try to avoid conflict and let things blow over",
      "I seek advice from others before addressing it"
    ]
  },
  {
    question: "Your approach to keeping your living space is:",
    options: [
      "Everything has a place, I clean regularly",
      "Organized chaos - looks messy but I know where things are",
      "I clean when I have time, usually on weekends",
      "Pretty relaxed, cleanliness isn't a top priority"
    ]
  },
  {
    question: "When making important decisions, you:",
    options: [
      "Trust my gut feeling and instincts",
      "Make a pro/con list and think it through",
      "Talk it through with trusted friends or family",
      "Research thoroughly and consider all options"
    ]
  },
  {
    question: "Your ideal study environment is:",
    options: [
      "Complete silence in the library",
      "Coffee shop with background noise",
      "Study group with friends",
      "My room with music playing"
    ]
  },
  {
    question: "When it comes to planning and schedules:",
    options: [
      "I plan everything weeks in advance",
      "I have a rough plan but stay flexible",
      "I prefer to be spontaneous and go with the flow",
      "I plan the important stuff, wing the rest"
    ]
  }
];

export function generateFallbackBondPrint(answers: any[]): any {
  // Simple scoring algorithm based on answers
  const traits = {
    socialEnergy: 0.5,
    communication: 0.5,
    emotionalStyle: 0.5,
    spontaneity: 0.5,
    conflictStyle: 0.5,
    independence: 0.5,
    adventurousness: 0.5,
    empathy: 0.5,
    competitiveness: 0.5
  };

  // Analyze Q1 - Social recharge
  if (answers[0]?.answer.includes('Alone')) {
    traits.socialEnergy = 0.2;
  } else if (answers[0]?.answer.includes('party')) {
    traits.socialEnergy = 0.9;
  } else if (answers[0]?.answer.includes('close friends')) {
    traits.socialEnergy = 0.6;
  }

  // Analyze Q2 - Group work
  if (answers[1]?.answer.includes('Take charge')) {
    traits.independence = 0.8;
    traits.competitiveness = 0.7;
  } else if (answers[1]?.answer.includes('independently')) {
    traits.independence = 0.9;
  } else if (answers[1]?.answer.includes('Support')) {
    traits.empathy = 0.8;
    traits.independence = 0.3;
  }

  // Analyze Q3 - Weekend style
  if (answers[2]?.answer.includes('Exploring')) {
    traits.adventurousness = 0.9;
    traits.spontaneity = 0.7;
  } else if (answers[2]?.answer.includes('Relaxing at home')) {
    traits.adventurousness = 0.2;
  } else if (answers[2]?.answer.includes('work/studying')) {
    traits.competitiveness = 0.8;
  }

  // Analyze Q4 - Conflict style
  if (answers[3]?.answer.includes('directly and openly')) {
    traits.conflictStyle = 0.9;
    traits.communication = 0.9;
  } else if (answers[3]?.answer.includes('avoid conflict')) {
    traits.conflictStyle = 0.1;
    traits.empathy = 0.7;
  } else if (answers[3]?.answer.includes('give it time')) {
    traits.conflictStyle = 0.4;
    traits.emotionalStyle = 0.3;
  }

  // Analyze Q5 - Cleanliness (for living preferences)
  const cleanlinessLevel = answers[4]?.answer.includes('Everything has a place') ? 0.9 :
                          answers[4]?.answer.includes('relaxed') ? 0.2 :
                          answers[4]?.answer.includes('weekends') ? 0.5 : 0.6;

  // Analyze Q6 - Decision making
  if (answers[5]?.answer.includes('gut feeling')) {
    traits.emotionalStyle = 0.8;
    traits.spontaneity = 0.7;
  } else if (answers[5]?.answer.includes('Research')) {
    traits.emotionalStyle = 0.2;
  } else if (answers[5]?.answer.includes('Talk it through')) {
    traits.socialEnergy = 0.7;
    traits.empathy = 0.8;
  }

  // Analyze Q7 - Study environment
  if (answers[6]?.answer.includes('silence')) {
    traits.socialEnergy = 0.3;
  } else if (answers[6]?.answer.includes('Study group')) {
    traits.socialEnergy = 0.9;
    traits.independence = 0.3;
  }

  // Analyze Q8 - Planning style
  if (answers[7]?.answer.includes('weeks in advance')) {
    traits.spontaneity = 0.1;
  } else if (answers[7]?.answer.includes('spontaneous')) {
    traits.spontaneity = 0.9;
  } else if (answers[7]?.answer.includes('flexible')) {
    traits.spontaneity = 0.6;
  }

  // Determine personality type based on traits
  let primaryType = 'Balanced Individual';
  if (traits.socialEnergy > 0.7 && traits.adventurousness > 0.7) {
    primaryType = 'Social Butterfly';
  } else if (traits.socialEnergy < 0.4 && traits.emotionalStyle < 0.4) {
    primaryType = 'Deep Thinker';
  } else if (traits.adventurousness > 0.7 && traits.spontaneity > 0.7) {
    primaryType = 'Free Spirit';
  } else if (traits.empathy > 0.7 && traits.conflictStyle < 0.4) {
    primaryType = 'Harmonizer';
  } else if (traits.independence > 0.7 && traits.competitiveness > 0.6) {
    primaryType = 'Leader';
  } else if (traits.emotionalStyle > 0.7 && traits.empathy > 0.7) {
    primaryType = 'Creative Soul';
  } else if (traits.spontaneity < 0.4 && traits.independence > 0.6) {
    primaryType = 'Steady Rock';
  }

  // Generate secondary traits
  const secondaryTraits = [];
  if (traits.empathy > 0.6) secondaryTraits.push('Empathetic');
  if (traits.adventurousness > 0.6) secondaryTraits.push('Adventurous');
  if (traits.independence > 0.6) secondaryTraits.push('Independent');
  if (traits.communication > 0.6) secondaryTraits.push('Direct');
  if (traits.spontaneity > 0.6) secondaryTraits.push('Spontaneous');

  // Determine communication style
  let commStyle = 'Balanced Communicator';
  if (traits.communication > 0.7 && traits.emotionalStyle > 0.6) {
    commStyle = 'Warm & Supportive';
  } else if (traits.communication > 0.7 && traits.emotionalStyle < 0.4) {
    commStyle = 'Direct & Honest';
  } else if (traits.socialEnergy > 0.7 && traits.spontaneity > 0.6) {
    commStyle = 'Energetic & Enthusiastic';
  } else if (traits.socialEnergy < 0.4) {
    commStyle = 'Thoughtful & Reserved';
  } else if (traits.empathy > 0.7) {
    commStyle = 'Warm & Supportive';
  }

  // Determine ideal setting
  let idealSetting = 'Mix of both';
  if (traits.socialEnergy > 0.7) {
    idealSetting = traits.spontaneity > 0.6 ? 'Large groups' : 'Small intimate groups';
  } else if (traits.socialEnergy < 0.4) {
    idealSetting = 'One-on-one';
  }

  // Determine schedule
  let schedule = 'Flexible';
  if (traits.spontaneity < 0.3) {
    schedule = 'Structured';
  }

  return {
    traits,
    personality: {
      primaryType,
      secondaryTraits: secondaryTraits.slice(0, 3),
      description: `You're a ${primaryType.toLowerCase()} who values authentic connections and personal growth. You bring a unique perspective to friendships and living situations.`
    },
    communication: {
      style: commStyle,
      preferences: [
        traits.communication > 0.6 ? 'Values open and honest dialogue' : 'Prefers thoughtful, considered responses',
        traits.empathy > 0.6 ? 'Listens actively and empathetically' : 'Appreciates practical solutions'
      ]
    },
    social: {
      idealSetting,
      rechargeMethod: traits.socialEnergy > 0.6 ? 'Spending time with friends' : 'Quiet alone time',
      friendshipStyle: traits.empathy > 0.6 ? 'Builds deep, meaningful connections' : 'Maintains a solid circle of trusted friends'
    },
    values: [
      'Authenticity',
      traits.adventurousness > 0.6 ? 'Growth' : 'Stability',
      traits.empathy > 0.6 ? 'Community' : 'Independence',
      traits.spontaneity > 0.6 ? 'Flexibility' : 'Reliability'
    ],
    livingPreferences: {
      cleanliness: cleanlinessLevel,
      noiseLevel: traits.socialEnergy * 0.7,
      socialSpace: traits.socialEnergy,
      schedule
    },
    summary: `A ${primaryType.toLowerCase()} who thrives in ${idealSetting.toLowerCase()} settings`
  };
}
