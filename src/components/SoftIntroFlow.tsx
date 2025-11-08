import { useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SoftIntroFlowProps {
  profile: {
    id: string;
    name: string;
    interests: string[];
    lookingFor: string[];
    personality?: string[];
    major: string;
    year: string;
  };
  onClose: () => void;
  currentUserName?: string;
  accessToken?: string;
}

type Step = 'reason' | 'ai-analysis' | 'confirmation' | 'success';

export function SoftIntroFlow({ profile, onClose, currentUserName = 'You', accessToken }: SoftIntroFlowProps) {
  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<{
    similarities: string[];
    compatibility: string;
    recommendation: string;
    score: number;
  } | null>(null);
  const [sending, setSending] = useState(false);

  const reasonOptions = [
    { value: 'friends', label: '👋 Make Friends', description: 'Looking to connect and hang out' },
    { value: 'roommate', label: '🏠 Find a Roommate', description: 'Searching for someone to live with' },
    { value: 'study', label: '📚 Study Together', description: 'Need a study buddy or group' },
    { value: 'collaborate', label: '💡 Collaborate', description: 'Work on projects together' },
    { value: 'network', label: '🤝 Network', description: 'Professional connections' },
  ];

  const handleReasonSelect = async (reason: string) => {
    setSelectedReason(reason);
    setStep('ai-analysis');
    
    // Call real AI compatibility analysis if accessToken is available
    if (accessToken) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-print/compatibility`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              otherUserId: profile.id,
              reason,
            }),
          }
        );

        if (response.ok) {
          const compatibility = await response.json();
          setAiAnalysis({
            similarities: compatibility.similarities,
            compatibility: compatibility.compatibility,
            recommendation: compatibility.recommendation,
            score: compatibility.score,
          });
        } else {
          // Fall back to mock analysis
          const analysis = generateAIAnalysis(reason);
          setAiAnalysis(analysis);
        }
      } catch (error) {
        console.error('Error getting AI compatibility:', error);
        // Fall back to mock analysis
        const analysis = generateAIAnalysis(reason);
        setAiAnalysis(analysis);
      }
    } else {
      // No auth, use mock
      const analysis = generateAIAnalysis(reason);
      setAiAnalysis(analysis);
    }
  };

  const generateAIAnalysis = (reason: string) => {
    // This is a mock AI analysis - in production, this would call your AI backend
    const similarities: string[] = [];
    
    // Analyze common interests
    const mockUserInterests = ['Coding', 'Coffee', 'Gaming'];
    const commonInterests = profile.interests.filter(interest => 
      mockUserInterests.some(ui => ui.toLowerCase() === interest.toLowerCase())
    );
    
    if (commonInterests.length > 0) {
      similarities.push(`You both enjoy ${commonInterests.join(', ')}`);
    }
    
    // Analyze personality match
    if (profile.personality && profile.personality.includes('Introverted')) {
      similarities.push('Similar personality types - both appreciate quiet time');
    }
    
    // Analyze academic alignment
    similarities.push(`Both are interested in ${profile.major.includes('Computer') || profile.major.includes('Engineering') ? 'tech and innovation' : 'learning and growth'}`);
    
    // Generate compatibility score
    const score = 75 + Math.floor(Math.random() * 20);
    const compatibility = score >= 85 ? 'Excellent' : score >= 70 ? 'Great' : 'Good';
    
    // Generate recommendation
    let recommendation = '';
    switch (reason) {
      case 'friends':
        recommendation = `Based on your shared interests and compatible personalities, I think you two would make great friends! ${profile.name.split(' ')[0]} seems like someone who would enjoy the same activities as you.`;
        break;
      case 'roommate':
        recommendation = `Your living preferences and schedules appear to align well. ${profile.name.split(' ')[0]} could be an excellent roommate match with a ${score}% compatibility score!`;
        break;
      case 'study':
        recommendation = `With your similar academic interests and study styles, you could form a productive study partnership. ${profile.name.split(' ')[0]} is a ${profile.year} in ${profile.major}.`;
        break;
      case 'collaborate':
        recommendation = `Your complementary skills and shared passion for innovation make you great collaboration candidates. I recommend connecting!`;
        break;
      case 'network':
        recommendation = `Your professional interests align well. This could be a valuable connection for both of your careers!`;
        break;
    }
    
    return { similarities, compatibility, recommendation, score };
  };

  const handleSendIntro = async () => {
    if (!accessToken) {
      toast.error('You must be logged in to send an intro');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intro`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            toUserId: profile.id,
            reason: selectedReason,
            analysis: aiAnalysis,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send intro');
      }

      setStep('success');
      
      setTimeout(() => {
        toast.success(`Soft intro sent to ${profile.name}!`, {
          description: "They'll receive a notification and can choose to connect with you.",
        });
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending intro:', error);
      toast.error('Failed to send intro. Please try again.');
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] max-h-[90dvh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg">Soft Intro</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'reason' && (
            <div>
              <h3 className="text-xl mb-2">Why do you want to connect with {profile.name.split(' ')[0]}?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Our AI will analyze your compatibility and create a personalized introduction.
              </p>

              <div className="space-y-3">
                {reasonOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleReasonSelect(option.value)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium mb-1">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'ai-analysis' && aiAnalysis && (
            <div className="space-y-6">
              {/* AI Thinking Animation */}
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-purple-900">AI Analysis Complete</p>
                  <p className="text-sm text-purple-700">Here's what I found...</p>
                </div>
              </div>

              {/* Compatibility */}
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Compatibility Score</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${75 + Math.floor(Math.random() * 20)}%` }}
                    />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">{aiAnalysis.compatibility} Match</Badge>
                </div>
              </div>

              {/* Similarities */}
              <div>
                <h3 className="text-sm text-gray-500 mb-3">What You Have in Common</h3>
                <div className="space-y-2">
                  {aiAnalysis.similarities.map((similarity, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{similarity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h3 className="text-sm text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Recommendation
                </h3>
                <p className="text-sm text-gray-700">{aiAnalysis.recommendation}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleSendIntro}
                  disabled={sending}
                  className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Intro'}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Intro Sent! 🎉</h3>
              <p className="text-gray-600 mb-4">
                {profile.name.split(' ')[0]} will receive a notification about your interest in connecting.
              </p>
              <p className="text-sm text-gray-500">
                They'll be able to review your profile and decide if they'd like to connect back.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
