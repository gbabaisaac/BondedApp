import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

interface BondPrintQuizProps {
  userProfile: any;
  accessToken: string;
  onComplete: (bondPrint: any) => void;
  onSkip?: () => void;
}

interface Question {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
}

export function BondPrintQuiz({ userProfile, accessToken, onComplete, onSkip }: BondPrintQuizProps) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/bond-print/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ userProfile }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Quiz start failed:', errorData);
        throw new Error(errorData.error || 'Failed to start quiz');
      }

      const data = await response.json();
      setCurrentQuestion(data);
      setStarted(true);
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      toast.error(error.message || 'Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/bond-print/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            answer: selectedOption,
            questionText: currentQuestion.question,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Answer submission failed:', errorData);
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await response.json();

      // Reset selected option for next question
      setSelectedOption(null);

      if (data.completed) {
        // Quiz complete - generate Bond Print
        await generateBondPrint();
      } else {
        // Load next question
        setCurrentQuestion(data);
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast.error(error.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateBondPrint = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/bond-print/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Bond Print generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate Bond Print');
      }

      const data = await response.json();
      toast.success('Your Bond Print is ready! 🎉');
      onComplete(data.bondPrint);
    } catch (error: any) {
      console.error('Error generating Bond Print:', error);
      toast.error(error.message || 'Failed to generate Bond Print. Please try again.');
      setIsGenerating(false);
    }
  };

  // Intro screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full mx-auto"
        >
          <Card className="border-2 border-purple-200">
            <CardContent className="p-8">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-3xl text-center mb-3">
                Create Your Bond Print
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Bonded is a social app for college students to find friends, roommates, and meaningful connections. We also offer a dating aspect in slow, meaningful stages — but only if you toggle Love Mode on. Answer these questions to create your Bond Print for better matches!
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">AI-Powered & Adaptive</h3>
                    <p className="text-sm text-gray-600">
                      Questions adapt based on your answers for deeper insights
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Personalized Matching</h3>
                    <p className="text-sm text-gray-600">
                      Find friends, roommates, and love interests (if you want!)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Quick & Easy</h3>
                    <p className="text-sm text-gray-600">
                      Only 8 questions, takes about 3 minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={startQuiz}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparing Your Quiz...
                    </>
                  ) : (
                    <>
                      Start Bond Print Quiz
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
                {onSkip && (
                  <Button
                    onClick={onSkip}
                    variant="ghost"
                    className="w-full"
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Generating Bond Print
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4 py-8 pb-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl mb-3">Analyzing Your Responses...</h2>
          <p className="text-gray-600 mb-4">
            Creating your unique Bond Print
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz questions
  if (!currentQuestion) return null;

  const progress = (currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4 py-8 pb-24">
      <motion.div
        key={currentQuestion.questionNumber}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-2xl w-full mx-auto"
      >
        <Card className="border-2 border-purple-200">
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                </span>
                <span className="text-sm font-medium text-purple-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl pt-1">{currentQuestion.question}</h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedOption === option
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedOption === option
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOption === option && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={selectedOption === option ? 'text-purple-900 font-medium' : 'text-gray-700'}>
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Next Button */}
            <Button
              onClick={submitAnswer}
              disabled={!selectedOption || isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentQuestion.questionNumber === currentQuestion.totalQuestions
                    ? 'Finish Quiz'
                    : 'Next Question'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
