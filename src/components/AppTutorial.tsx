import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Search, 
  Sparkles,
  ArrowRight,
  X,
  Home,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    id: 1,
    icon: Home,
    title: 'Discover Your Campus',
    description: 'Browse profiles of students at your school. Swipe through to find friends, roommates, study partners, and more!',
    color: 'from-blue-500 to-purple-500',
  },
  {
    id: 2,
    icon: Search,
    title: 'Find Your People',
    description: 'Use filters to find exactly what you\'re looking for - by major, year, interests, or goals.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    icon: Heart,
    title: 'Bond Print Matching',
    description: 'Our AI analyzes compatibility to show you people you\'ll actually connect with. Higher scores = better matches!',
    color: 'from-pink-500 to-red-500',
  },
  {
    id: 4,
    icon: MessageCircle,
    title: 'Start Conversations',
    description: 'Send connection requests and chat with matches. Build your campus network one connection at a time.',
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 5,
    icon: Sparkles,
    title: 'You\'re All Set!',
    description: 'Start exploring and connecting with students on your campus. The more you use Bonded, the better your matches get!',
    color: 'from-orange-500 to-yellow-500',
  },
];

export function AppTutorial({ onComplete, onSkip }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const seen = localStorage.getItem('hasSeenAppTutorial');
    if (seen === 'true') {
      setHasSeenTutorial(true);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenAppTutorial', 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenAppTutorial', 'true');
    onSkip();
  };

  if (hasSeenTutorial) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-md w-full"
      >
        <Card className="border-2 border-purple-200 shadow-2xl">
          <CardContent className="p-6">
            {/* Skip Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </span>
                <span className="text-xs font-medium text-purple-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                {/* Icon */}
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-gray-900">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 bg-gradient-to-r ${step.color} text-white`}
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

