import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

interface DailyLoveQuestionProps {
  accessToken: string;
  onComplete?: () => void;
}

export function DailyLoveQuestion({ accessToken, onComplete }: DailyLoveQuestionProps) {
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadDailyQuestion();
  }, []);

  const loadDailyQuestion = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/daily-question`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
      }
    } catch (error) {
      console.error('Load daily question error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/daily-question/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            questionId: question.id,
            answer,
          }),
        }
      );

      if (response.ok) {
        toast.success('Thanks for sharing! Your Love Print is getting smarter.');
        setDismissed(true);
        onComplete?.();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !question || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-pink-900">Daily Love Question</h4>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Today
                  </Badge>
                </div>
                
                <p className="text-sm text-pink-800 mb-3">{question.question}</p>

                {/* Question Types */}
                {question.type === 'scale' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-pink-700">
                      <span>{question.scaleLabels[0]}</span>
                      <span>{question.scaleLabels[1]}</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => setAnswer(num)}
                          className={`aspect-square rounded text-sm font-medium transition-all ${
                            answer === num
                              ? 'bg-pink-500 text-white scale-110'
                              : 'bg-white border border-pink-300 hover:bg-pink-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === 'single' && (
                  <div className="space-y-2">
                    {question.options.map((option: string) => (
                      <button
                        key={option}
                        onClick={() => setAnswer(option)}
                        className={`w-full text-left p-2 rounded text-sm transition-all ${
                          answer === option
                            ? 'bg-pink-500 text-white'
                            : 'bg-white border border-pink-300 hover:bg-pink-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multiple' && (
                  <div className="space-y-2">
                    {question.options.map((option: string) => {
                      const isSelected = answer?.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            const current = answer || [];
                            const newAnswer = isSelected
                              ? current.filter((a: string) => a !== option)
                              : [...current, option];
                            setAnswer(newAnswer);
                          }}
                          className={`w-full text-left p-2 rounded text-sm transition-all ${
                            isSelected
                              ? 'bg-pink-500 text-white'
                              : 'bg-white border border-pink-300 hover:bg-pink-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {isSelected && <span>✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {answer && (
                  <Button
                    onClick={submitAnswer}
                    disabled={submitting}
                    size="sm"
                    className="w-full mt-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                )}
              </div>

              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 text-pink-400 hover:text-pink-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-pink-700 mt-2 ml-13 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Daily questions refine your Love Print for better matches
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
