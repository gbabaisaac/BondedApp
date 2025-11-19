import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import '../styles/tokens.css';
import '../styles/animations.css';

interface BondPrintQuizProps {
  onComplete: (bondPrint: any) => void;
  onSkip?: () => void;
  userProfile?: any;
  accessToken?: string;
}

interface Question {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
}

export function BondPrintQuiz({ onComplete, onSkip, userProfile, accessToken: propAccessToken }: BondPrintQuizProps) {
  // Get accessToken from prop or store
  const accessToken = propAccessToken || useAppStore.getState().accessToken;
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const startQuiz = async () => {
    if (!userProfile || !userProfile.name) {
      toast.error('Profile information is missing. Please complete your profile first.');
      return;
    }
    if (!accessToken) {
      toast.error('Please log in to start the quiz.');
      return;
    }

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
      <div
        className="fixed inset-0 flex items-center justify-center p-6"
        style={{
          background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
          minHeight: '-webkit-fill-available',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <Card 
            className="bg-white/95 backdrop-blur-xl shadow-2xl border-none"
            style={{
              borderRadius: '28px',
              padding: '40px 32px',
            }}
          >
            <CardContent className="p-0">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                  boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
                }}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <h2 
                className="text-center mb-3"
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1A1D2E',
                  letterSpacing: '-0.02em',
                }}
              >
                Create Your Bond Print
              </h2>
              <p 
                className="text-center mb-8"
                style={{ 
                  color: '#6B6B6B',
                  fontSize: '16px',
                  lineHeight: '1.6',
                }}
              >
                Quick quiz for personalized matches
              </p>

              {/* Features */}
              <div className="flex items-center justify-around mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255, 107, 107, 0.1)' }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: '#FF6B6B' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '600' }}>AI Match</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(167, 139, 250, 0.1)' }}
                  >
                    <Heart className="w-6 h-6" style={{ color: '#A78BFA' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '600' }}>Compatible</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(96, 165, 250, 0.1)' }}
                  >
                    <Check className="w-6 h-6" style={{ color: '#60A5FA' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '600' }}>3 min</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <motion.div whileTap={{ scale: loading ? 1 : 0.98 }}>
                  <Button
                    onClick={startQuiz}
                    disabled={loading}
                    className="w-full text-white border-none shadow-lg"
                    size="lg"
                    style={{
                      height: '56px',
                      borderRadius: '16px',
                      background: loading 
                        ? '#D1D5DB' 
                        : 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                      fontSize: '17px',
                      fontWeight: '700',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        Start Quiz
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
                {onSkip && (
                  <Button
                    onClick={onSkip}
                    variant="ghost"
                    className="w-full"
                    style={{
                      height: '48px',
                      color: '#6B6B6B',
                      fontSize: '15px',
                      fontWeight: '600',
                    }}
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
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
          height: '100dvh',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
              boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
            }}
          >
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h2 
            className="text-2xl mb-3"
            style={{
              color: '#1A1D2E',
              fontWeight: '700',
            }}
          >
            Analyzing Your Responses...
          </h2>
          <p style={{ color: '#6B6B6B', marginBottom: '16px' }}>
            Creating your unique Bond Print
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FF6B6B', animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#A78BFA', animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FF6B6B', animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz questions
  if (!currentQuestion) return null;

  const progress = (currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100;

  return (
    <div
      className="fixed inset-0 overflow-y-auto p-6"
      style={{
        background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
        height: '100dvh',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}
    >
      <motion.div
        key={currentQuestion.questionNumber}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-xl w-full mx-auto"
        style={{ paddingTop: '40px', paddingBottom: '40px' }}
      >
        <div 
          className="bg-white/95 backdrop-blur-xl shadow-2xl"
          style={{
            borderRadius: '28px',
            padding: '32px 24px',
          }}
        >
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span 
                className="text-sm font-semibold"
                style={{ color: '#6B6B6B' }}
              >
                Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
              </span>
              <span 
                className="text-sm font-bold"
                style={{ 
                  color: '#FF6B6B',
                  background: 'rgba(255, 107, 107, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ background: '#E8E8F0' }}
            >
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)'
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 
              className="text-xl leading-relaxed mb-6"
              style={{
                color: '#1A1D2E',
                fontWeight: '700',
                fontSize: '20px',
                lineHeight: '1.4'
              }}
            >
              {currentQuestion.question}
            </h2>

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
                    className="w-full text-left p-4 rounded-2xl transition-all"
                    style={{
                      background: selectedOption === option 
                        ? 'rgba(255, 107, 107, 0.1)' 
                        : 'rgba(248, 249, 250, 0.8)',
                      border: selectedOption === option 
                        ? '2px solid #FF6B6B' 
                        : '2px solid transparent',
                      boxShadow: selectedOption === option 
                        ? '0 4px 12px rgba(255, 107, 107, 0.15)' 
                        : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: selectedOption === option ? '#FF6B6B' : '#D1D5DB',
                          background: selectedOption === option ? '#FF6B6B' : 'transparent',
                        }}
                      >
                        {selectedOption === option && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span 
                        className="leading-relaxed"
                        style={{
                          color: selectedOption === option ? '#1A1D2E' : '#6B6B6B',
                          fontWeight: selectedOption === option ? '600' : '400',
                          fontSize: '15px'
                        }}
                      >
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
            className="w-full text-white border-none shadow-lg"
            size="lg"
            style={{
              height: '56px',
              borderRadius: '16px',
              background: !selectedOption || isSubmitting
                ? '#D1D5DB' 
                : 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
              fontSize: '17px',
              fontWeight: '700',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {currentQuestion.questionNumber === currentQuestion.totalQuestions
                  ? 'Finish Quiz'
                  : 'Next Question'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
