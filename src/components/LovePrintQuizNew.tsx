import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Heart, ArrowRight, ArrowLeft, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LovePrintQuizNewProps {
  onComplete: (lovePrint: any) => void;
  onSkip: () => void;
}

// Enhanced Love Print questions focused on emotional intelligence & attachment
const LOVE_PRINT_QUESTIONS = [
  // Values & Communication
  {
    id: 'communication_style',
    category: 'Communication',
    question: 'In a meaningful conversation, I prefer...',
    type: 'single',
    options: [
      'Deep emotional discussions about feelings',
      'Intellectual debates and ideas',
      'Light-hearted, playful banter',
      'Problem-solving and practical talk',
    ],
  },
  {
    id: 'emotional_expression',
    category: 'Emotional Style',
    question: 'I express affection through...',
    type: 'multiple',
    options: [
      'Words of affirmation and compliments',
      'Physical touch and closeness',
      'Quality time and undivided attention',
      'Acts of service and helping',
      'Thoughtful gifts and surprises',
    ],
  },
  {
    id: 'vulnerability_comfort',
    category: 'Emotional Openness',
    question: 'When it comes to being vulnerable...',
    type: 'single',
    options: [
      'I open up easily and share deeply early on',
      'I need trust first, then gradually open up',
      'I struggle with vulnerability but try',
      'I prefer keeping emotional walls up',
    ],
  },

  // Attachment Patterns
  {
    id: 'attachment_style',
    category: 'Attachment',
    question: 'In relationships, I tend to...',
    type: 'single',
    options: [
      'Crave closeness and reassurance often (Anxious)',
      'Value independence and personal space (Avoidant)',
      'Balance intimacy with autonomy naturally (Secure)',
      'Fluctuate between wanting closeness and distance (Fearful)',
    ],
  },
  {
    id: 'conflict_response',
    category: 'Conflict',
    question: 'When there\'s tension or disagreement, I...',
    type: 'single',
    options: [
      'Address it immediately—I need to resolve things',
      'Need time and space to process my feelings',
      'Try to keep the peace and avoid confrontation',
      'Get overwhelmed emotionally and need comfort',
    ],
  },
  {
    id: 'reassurance_needs',
    category: 'Emotional Needs',
    question: 'I feel most secure when my partner...',
    type: 'single',
    options: [
      'Frequently tells me they love me and appreciate me',
      'Gives me freedom and doesn\'t cling',
      'Shows consistency in words and actions',
      'Understands my moods without me explaining',
    ],
  },

  // Dating Preferences & Pace
  {
    id: 'dating_pace',
    category: 'Dating Pace',
    question: 'My ideal relationship timeline is...',
    type: 'single',
    options: [
      'Slow burn—friendship first, romance later',
      'Natural flow—see where things go organically',
      'Fast connection—when it clicks, it clicks',
      'Intentional—clear communication from the start',
    ],
  },
  {
    id: 'emotional_intensity',
    category: 'Emotional Depth',
    question: 'How do you approach emotional intimacy?',
    type: 'single',
    options: [
      'I crave deep emotional connection quickly',
      'I prefer gradual emotional deepening',
      'I\'m comfortable with surface-level connection',
      'I alternate between intense and distant',
    ],
  },

  // Love Languages & Connection
  {
    id: 'ideal_connection',
    category: 'Connection Type',
    question: 'The most important connection for me is...',
    type: 'rank',
    options: [
      'Emotional intimacy and understanding',
      'Physical chemistry and attraction',
      'Intellectual stimulation and deep talks',
      'Shared values and life goals',
      'Having fun and laughing together',
    ],
  },
  {
    id: 'relationship_priority',
    category: 'Priorities',
    question: 'In a partner, I value most...',
    type: 'rank',
    options: [
      'Emotional availability and empathy',
      'Reliability and consistency',
      'Passion and spontaneity',
      'Ambition and drive',
      'Kindness and compassion',
    ],
  },

  // Compatibility Factors
  {
    id: 'alone_time_needs',
    category: 'Personal Space',
    question: 'My need for alone time is...',
    type: 'scale',
    scale: { min: 1, max: 10, minLabel: 'Need constant togetherness', maxLabel: 'Need lots of solo time' },
  },
  {
    id: 'emotional_availability',
    category: 'Emotional Readiness',
    question: 'Right now, I\'m emotionally ready for...',
    type: 'single',
    options: [
      'A serious, committed relationship',
      'Dating with intention, open to commitment',
      'Casual dating, seeing what happens',
      'Just exploring and meeting people',
    ],
  },

  // Deeper Questions
  {
    id: 'past_patterns',
    category: 'Self-Awareness',
    question: 'In past relationships, I\'ve noticed I...',
    type: 'multiple',
    options: [
      'Get anxious when they pull away',
      'Pull away when things get too close',
      'Overthink and need constant communication',
      'Struggle to express my needs clearly',
      'Have a secure, balanced approach',
    ],
  },
  {
    id: 'love_beliefs',
    category: 'Beliefs About Love',
    question: 'I believe love should be...',
    type: 'single',
    options: [
      'Effortless and natural—if it\'s right, it\'s easy',
      'Work and commitment—love is a choice',
      'Passionate and intense—deep emotional highs',
      'Balanced—effort, passion, and stability',
    ],
  },
  {
    id: 'deal_breakers',
    category: 'Non-Negotiables',
    question: 'What would be hardest for you in a relationship?',
    type: 'single',
    options: [
      'Lack of emotional communication',
      'Not enough quality time together',
      'Feeling controlled or smothered',
      'Inconsistency or unreliability',
    ],
  },
];

export function LovePrintQuizNew({ onComplete, onSkip }: LovePrintQuizNewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [rankingOrder, setRankingOrder] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState(5);

  const question = LOVE_PRINT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / LOVE_PRINT_QUESTIONS.length) * 100;

  const handleSingleChoice = (option: string) => {
    setAnswers({ ...answers, [question.id]: option });
  };

  const handleMultipleChoice = (option: string) => {
    const current = selectedOptions.includes(option)
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option];
    setSelectedOptions(current);
  };

  const handleRankingDrag = (option: string, newIndex: number) => {
    const currentOrder = rankingOrder.length > 0 ? rankingOrder : question.options;
    const oldIndex = currentOrder.indexOf(option);
    const newOrder = [...currentOrder];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, option);
    setRankingOrder(newOrder);
  };

  const canProceed = () => {
    if (question.type === 'single') {
      return answers[question.id] !== undefined;
    } else if (question.type === 'multiple') {
      return selectedOptions.length > 0;
    } else if (question.type === 'rank') {
      return rankingOrder.length === question.options.length;
    } else if (question.type === 'scale') {
      return true; // Always has a value
    }
    return false;
  };

  const handleNext = () => {
    // Save current answer
    let answer;
    if (question.type === 'multiple') {
      answer = selectedOptions;
    } else if (question.type === 'rank') {
      answer = rankingOrder.length > 0 ? rankingOrder : question.options;
    } else if (question.type === 'scale') {
      answer = scaleValue;
    } else {
      answer = answers[question.id];
    }

    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    // Move to next question or complete
    if (currentQuestion < LOVE_PRINT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions([]);
      setRankingOrder([]);
      setScaleValue(5);
    } else {
      // Calculate Love Print profile
      const lovePrint = {
        answers: newAnswers,
        profile: analyzeLovePrint(newAnswers),
        completedAt: new Date().toISOString(),
      };
      onComplete(lovePrint);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);

      // Restore previous answer
      const prevQuestion = LOVE_PRINT_QUESTIONS[currentQuestion - 1];
      const prevAnswer = answers[prevQuestion.id];

      if (prevQuestion.type === 'multiple' && Array.isArray(prevAnswer)) {
        setSelectedOptions(prevAnswer);
      } else if (prevQuestion.type === 'rank' && Array.isArray(prevAnswer)) {
        setRankingOrder(prevAnswer);
      } else if (prevQuestion.type === 'scale' && typeof prevAnswer === 'number') {
        setScaleValue(prevAnswer);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <Sparkles className="w-6 h-6 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Love Print Quiz
          </h1>
          <p className="text-gray-600">
            Understand your emotional patterns & attachment style
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {LOVE_PRINT_QUESTIONS.length}
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 mb-6">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  {question.category}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                {question.question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-3">
                {question.type === 'single' && question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={answers[question.id] === option ? 'default' : 'outline'}
                    className={`
                      w-full justify-start text-left h-auto py-4 px-6
                      ${answers[question.id] === option
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                        : 'hover:border-purple-300'}
                    `}
                    onClick={() => handleSingleChoice(option)}
                  >
                    <span className="text-base">{option}</span>
                  </Button>
                ))}

                {question.type === 'multiple' && question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOptions.includes(option) ? 'default' : 'outline'}
                    className={`
                      w-full justify-start text-left h-auto py-4 px-6
                      ${selectedOptions.includes(option)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                        : 'hover:border-purple-300'}
                    `}
                    onClick={() => handleMultipleChoice(option)}
                  >
                    <span className="text-base">{option}</span>
                  </Button>
                ))}

                {question.type === 'rank' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-4">
                      Drag to rank from most to least important
                    </p>
                    {(rankingOrder.length > 0 ? rankingOrder : question.options).map((option, index) => (
                      <div
                        key={option}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-purple-300"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', option)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const draggedOption = e.dataTransfer.getData('text/plain');
                          handleRankingDrag(draggedOption, index);
                        }}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <span className="text-base">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'scale' && question.scale && (
                  <div className="py-4">
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-600">{question.scale.minLabel}</span>
                      <span className="text-sm text-gray-600">{question.scale.maxLabel}</span>
                    </div>
                    <input
                      type="range"
                      min={question.scale.min}
                      max={question.scale.max}
                      value={scaleValue}
                      onChange={(e) => setScaleValue(Number(e.target.value))}
                      className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="text-center mt-4">
                      <span className="text-3xl font-bold text-purple-600">{scaleValue}</span>
                      <span className="text-gray-600"> / {question.scale.max}</span>
                    </div>
                  </div>
                )}
              </div>

              {question.type === 'multiple' && (
                <p className="text-sm text-gray-500 mt-4">
                  Select all that apply ({selectedOptions.length} selected)
                </p>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {currentQuestion === LOVE_PRINT_QUESTIONS.length - 1 ? (
              <>
                Complete
                <Heart className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}

// Analyze answers to create Love Print profile
function analyzeLovePrint(answers: Record<string, any>) {
  // This is a simplified analysis - in production, use more sophisticated algorithm

  const profile: any = {
    communicationStyle: answers.communication_style || 'Balanced',
    emotionalOpenness: answers.vulnerability_comfort || 'Gradual',
    attachmentStyle: answers.attachment_style || 'Secure',
    conflictStyle: answers.conflict_response || 'Direct',
    loveLanguages: answers.emotional_expression || [],
    intimacyPace: answers.dating_pace || 'Natural',
    emotionalIntensity: answers.emotional_intensity || 'Moderate',
    priorities: answers.relationship_priority || [],
    idealConnection: answers.ideal_connection || [],
    spaceNeeds: answers.alone_time_needs || 5,
    emotionalReadiness: answers.emotional_availability || 'Open',
    pastPatterns: answers.past_patterns || [],
    loveBeliefs: answers.love_beliefs || 'Balanced',
    dealBreakers: answers.deal_breakers || [],
  };

  return profile;
}
