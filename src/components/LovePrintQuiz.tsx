import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Heart, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LovePrintQuizProps {
  onComplete: (lovePrint: any) => void;
  onSkip: () => void;
}

const LOVE_PRINT_QUESTIONS = [
  {
    id: 'physical_attraction',
    question: 'What physical traits do you notice first?',
    type: 'multiple',
    options: ['Eyes', 'Smile', 'Style/Fashion', 'Body Language', 'Hair', 'Overall Vibe'],
  },
  {
    id: 'attraction_importance',
    question: 'How important is physical attraction for you?',
    type: 'scale',
    scale: { min: 1, max: 10, minLabel: 'Personality First', maxLabel: 'Very Important' },
  },
  {
    id: 'communication_preference',
    question: 'In a relationship, I prefer communication that is...',
    type: 'single',
    options: [
      'Deep and meaningful discussions',
      'Light and playful banter',
      'Balanced mix of both',
      'Action over words',
    ],
  },
  {
    id: 'emotional_expression',
    question: 'How do you express affection?',
    type: 'multiple',
    options: [
      'Words of affirmation',
      'Physical touch',
      'Quality time together',
      'Acts of service',
      'Thoughtful gifts',
    ],
  },
  {
    id: 'conflict_style',
    question: 'When there\'s a disagreement, I tend to...',
    type: 'single',
    options: [
      'Address it immediately and talk it through',
      'Take time to cool down first',
      'Avoid conflict when possible',
      'Get emotional and need reassurance',
    ],
  },
  {
    id: 'dating_pace',
    question: 'Your ideal dating pace is...',
    type: 'single',
    options: [
      'Slow and steady - build friendship first',
      'Natural flow - see where it goes',
      'Fast - when you know, you know',
      'Very intentional - clear communication about feelings',
    ],
  },
  {
    id: 'vulnerability',
    question: 'How comfortable are you being vulnerable?',
    type: 'scale',
    scale: { min: 1, max: 10, minLabel: 'Takes Time', maxLabel: 'Open Book' },
  },
  {
    id: 'ideal_date',
    question: 'Your dream date would involve...',
    type: 'multiple',
    options: [
      'Deep conversation over coffee',
      'Adventure or outdoor activity',
      'Creative activity together',
      'Trying new food/restaurants',
      'Low-key hangout at home',
      'Cultural event (museum, concert)',
    ],
  },
  {
    id: 'relationship_priority',
    question: 'In a relationship, what matters most to you?',
    type: 'rank',
    options: [
      'Emotional intimacy',
      'Physical chemistry',
      'Shared values/goals',
      'Having fun together',
      'Intellectual connection',
    ],
  },
  {
    id: 'dealbreakers',
    question: 'Select your dealbreakers (if any):',
    type: 'multiple',
    options: [
      'Lack of ambition',
      'Poor communication',
      'Different life goals',
      'Incompatible values',
      'No emotional availability',
      'Different views on commitment',
    ],
  },
  {
    id: 'love_language',
    question: 'You feel most loved when someone...',
    type: 'rank',
    options: [
      'Tells you how they feel',
      'Spends quality time with you',
      'Does things to help you',
      'Gives you thoughtful surprises',
      'Shows physical affection',
    ],
  },
  {
    id: 'attachment_style',
    question: 'In relationships, you tend to be...',
    type: 'single',
    options: [
      'Secure - comfortable with closeness and independence',
      'Anxious - need reassurance and closeness',
      'Avoidant - value independence, careful with closeness',
      'Mixed - depends on the person and situation',
    ],
  },
];

export function LovePrintQuiz({ onComplete, onSkip }: LovePrintQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [rankingAnswers, setRankingAnswers] = useState<string[]>([]);

  const question = LOVE_PRINT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / LOVE_PRINT_QUESTIONS.length) * 100;

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [question.id]: answer });
    
    if (question.type !== 'rank') {
      if (currentQuestion < LOVE_PRINT_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        completeLovePrint({ ...answers, [question.id]: answer });
      }
    }
  };

  const handleRankSubmit = () => {
    setAnswers({ ...answers, [question.id]: rankingAnswers });
    setRankingAnswers([]);
    
    if (currentQuestion < LOVE_PRINT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeLovePrint({ ...answers, [question.id]: rankingAnswers });
    }
  };

  const completeLovePrint = (finalAnswers: any) => {
    const lovePrint = {
      answers: finalAnswers,
      completedAt: new Date().toISOString(),
      version: '1.0',
    };
    onComplete(lovePrint);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setRankingAnswers([]);
    }
  };

  const toggleRanking = (option: string) => {
    if (rankingAnswers.includes(option)) {
      setRankingAnswers(rankingAnswers.filter(a => a !== option));
    } else {
      setRankingAnswers([...rankingAnswers, option]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="pt-6 pb-6 px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl mb-2">Love Print Quiz</h2>
            <p className="text-gray-600 text-sm">
              Help Link understand what you're looking for in a romantic connection
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {LOVE_PRINT_QUESTIONS.length}
              </span>
              <span className="text-sm font-medium text-pink-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-xl mb-6">{question.question}</h3>

              {/* Scale Type */}
              {question.type === 'scale' && question.scale && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{question.scale.minLabel}</span>
                    <span>{question.scale.maxLabel}</span>
                  </div>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => handleAnswer(num)}
                        className={`aspect-square rounded-lg border-2 font-medium transition-all ${
                          answers[question.id] === num
                            ? 'border-pink-500 bg-pink-500 text-white shadow-lg scale-110'
                            : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Choice */}
              {question.type === 'single' && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        answers[question.id] === option
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple' && (
                <div className="space-y-3">
                  {question.options?.map((option) => {
                    const isSelected = answers[question.id]?.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          const current = answers[question.id] || [];
                          const newAnswer = isSelected
                            ? current.filter((a: string) => a !== option)
                            : [...current, option];
                          setAnswers({ ...answers, [question.id]: newAnswer });
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isSelected && <span className="text-pink-600">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                  {answers[question.id]?.length > 0 && (
                    <Button
                      onClick={() => handleAnswer(answers[question.id])}
                      className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}

              {/* Ranking */}
              {question.type === 'rank' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Tap to rank in order of importance (1st = most important)
                  </p>
                  <div className="space-y-2">
                    {question.options?.map((option) => {
                      const rank = rankingAnswers.indexOf(option);
                      const isRanked = rank !== -1;
                      return (
                        <button
                          key={option}
                          onClick={() => toggleRanking(option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isRanked
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {isRanked && (
                              <span className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-medium">
                                {rank + 1}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {rankingAnswers.length > 0 && (
                    <Button
                      onClick={handleRankSubmit}
                      className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentQuestion === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>

          {/* Skip Info */}
          <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Complete Love Print for better AI matching
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
