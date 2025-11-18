'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock Bond Print questions
const bondPrintQuestions = [
  {
    id: 1,
    question: "On a Friday night, you'd rather:",
    options: [
      { id: 'a', text: 'Go to a big party', trait: 'social' },
      { id: 'b', text: 'Have a small gathering with close friends', trait: 'intimate' },
      { id: 'c', text: 'Stay in and relax', trait: 'introverted' },
      { id: 'd', text: 'Try something new and spontaneous', trait: 'adventurous' },
    ],
  },
  {
    id: 2,
    question: "How do you make decisions?",
    options: [
      { id: 'a', text: 'Logic and analysis', trait: 'analytical' },
      { id: 'b', text: 'Gut feeling and intuition', trait: 'intuitive' },
      { id: 'c', text: 'What others think', trait: 'collaborative' },
      { id: 'd', text: 'Pros and cons list', trait: 'organized' },
    ],
  },
  {
    id: 3,
    question: "Your ideal study environment:",
    options: [
      { id: 'a', text: 'Complete silence', trait: 'focused' },
      { id: 'b', text: 'With background music', trait: 'creative' },
      { id: 'c', text: 'In a coffee shop', trait: 'ambient' },
      { id: 'd', text: 'With friends in a study group', trait: 'collaborative' },
    ],
  },
  {
    id: 4,
    question: "When stressed, you:",
    options: [
      { id: 'a', text: 'Talk to friends', trait: 'social' },
      { id: 'b', text: 'Exercise or go outside', trait: 'active' },
      { id: 'c', text: 'Watch shows or play games', trait: 'escapist' },
      { id: 'd', text: 'Plan and organize', trait: 'organized' },
    ],
  },
  {
    id: 5,
    question: "Your communication style is:",
    options: [
      { id: 'a', text: 'Direct and to the point', trait: 'direct' },
      { id: 'b', text: 'Warm and empathetic', trait: 'empathetic' },
      { id: 'c', text: 'Thoughtful and considered', trait: 'thoughtful' },
      { id: 'd', text: 'Fun and playful', trait: 'playful' },
    ],
  },
];

export default function BondPrintPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  
  const progress = ((currentQuestion + (answers[currentQuestion + 1] ? 1 : 0)) / bondPrintQuestions.length) * 100;
  
  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion + 1]: optionId });
    
    if (currentQuestion < bondPrintQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setIsComplete(true), 300);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  if (isComplete) {
    return (
      <>
        <TopBar title="Bond Print" showBack={false} showSearch={false} showNotifications={false} />
        
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Bond Print Complete! 🎉
            </h1>
            
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              We're analyzing your personality to find your perfect matches and improve your connections.
            </p>
            
            <Card className="max-w-lg mx-auto mb-6">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  The Creative
                </h2>
                <p className="text-[var(--text-secondary)]">
                  You're imaginative, expressive, and love exploring new ideas. You thrive in collaborative environments and bring unique perspectives to everything you do.
                </p>
              </CardContent>
            </Card>
            
            <Button size="lg" onClick={() => window.location.href = '/yearbook'}>
              <Sparkles className="mr-2 h-5 w-5" />
              Explore Connections
            </Button>
          </motion.div>
        </main>
      </>
    );
  }
  
  const question = bondPrintQuestions[currentQuestion];
  
  return (
    <>
      <TopBar 
        title="Bond Print Quiz" 
        showBack={currentQuestion > 0}
        onBack={handleBack}
        showSearch={false}
        showNotifications={false}
      />
      
      {/* Progress Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-[var(--border-light)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm font-bold text-[var(--text-secondary)]">
              {currentQuestion + 1}/{bondPrintQuestions.length}
            </span>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
                  {question.question}
                </h2>
                
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left font-semibold transition-all border-2',
                        answers[question.id] === option.id
                          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white border-transparent shadow-lg'
                          : 'bg-white border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:shadow-md'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          answers[question.id] === option.id
                            ? 'border-white bg-white'
                            : 'border-[var(--border-medium)]'
                        )}>
                          {answers[question.id] === option.id && (
                            <CheckCircle className="w-5 h-5 text-[var(--primary)]" />
                          )}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

