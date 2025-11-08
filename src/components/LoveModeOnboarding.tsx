import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Heart, 
  Sparkles, 
  Lock, 
  MessageCircle, 
  Star,
  Shield,
  MapPin,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoveModeOnboardingProps {
  onActivate: () => void;
  onCancel: () => void;
}

export function LoveModeOnboarding({ onActivate, onCancel }: LoveModeOnboardingProps) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      icon: Heart,
      color: 'from-pink-500 to-red-500',
      title: 'Activating Love Mode',
      subtitle: 'A different kind of dating experience',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Love Mode is designed for meaningful romantic connections using AI-powered matching 
            and progressive stages that build emotional intimacy.
          </p>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-medium text-pink-900 mb-2">How it differs from Friend Mode:</h4>
            <ul className="space-y-2 text-sm text-pink-800">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-0.5">•</span>
                <span><strong>Distance-based:</strong> See people near you from any school</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-0.5">•</span>
                <span><strong>Anonymous start:</strong> Matches begin with AI-generated aliases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-0.5">•</span>
                <span><strong>AI matching:</strong> Link combines personality & attraction for perfect matches</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      title: 'How Love Mode Works',
      subtitle: '4 simple steps to meaningful connection',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Rate Profiles</h4>
                <p className="text-sm text-gray-600">
                  View profiles and honestly rate 1-10. Your ratings are private.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">AI Analyzes Compatibility</h4>
                <p className="text-sm text-gray-600">
                  Link's AI combines your ratings with personality insights to create meaningful blind matches.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Chat Anonymously</h4>
                <p className="text-sm text-gray-600">
                  Start with aliases like "Calm Fox" - no names or photos yet.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium mb-1">Progress Through Stages</h4>
                <p className="text-sm text-gray-600">
                  Text → Voice → Reveal → Date. Build connection step by step.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Lock,
      color: 'from-red-500 to-pink-500',
      title: 'Privacy & Safety',
      subtitle: 'Your safety is our priority',
      content: (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Anonymous Start</h4>
              <p className="text-sm text-gray-600">
                Every match begins anonymously. Real identities unlock only when both users progress through stages.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">AI Moderation</h4>
              <p className="text-sm text-gray-600">
                Link monitors all conversations for safety, providing guidance and detecting concerning behavior.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Private Ratings</h4>
              <p className="text-sm text-gray-600">
                Your ratings are never shown to others. Only you and Link know how you rated someone.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Distance-Based</h4>
              <p className="text-sm text-gray-600">
                Unlike Friend Mode (school-only), Love Mode shows people near you from any school.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 flex items-center justify-center p-4 overflow-y-auto" style={{ height: '100dvh' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg my-auto"
      >
        <Card className="shadow-2xl">
          <CardContent className="pt-8 pb-6 px-6">
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx + 1 === step
                      ? 'w-8 bg-gradient-to-r ' + currentStep.color
                      : idx + 1 < step
                      ? 'w-2 bg-purple-400'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl mb-2">{currentStep.title}</h2>
              <p className="text-gray-600 text-sm mb-6">{currentStep.subtitle}</p>
              <div className="text-left">{currentStep.content}</div>
            </motion.div>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              
              {step < steps.length ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className={`flex-1 bg-gradient-to-r ${currentStep.color} hover:opacity-90 text-white`}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={onActivate}
                  className={`flex-1 bg-gradient-to-r ${currentStep.color} hover:opacity-90 text-white gap-2`}
                >
                  <Zap className="w-4 h-4" />
                  Activate Love Mode
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
