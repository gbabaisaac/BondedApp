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
  const [generating, setGenerating] = useState(false);

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
    
    // Generate AI analysis
    const analysis = await generateAIAnalysis(reason);
    if (analysis) {
      setAiAnalysis(analysis);
    }
  };

  const generateAIAnalysis = async (reason: string) => {
    if (!accessToken) {
      toast.error('You must be logged in');
      return null;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intro/generate-ai-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            toUserId: profile.id,
            reason: reason.toLowerCase().replace(/\s+/g, '-'),
          }),
        }
      );

      if (!response.ok) {
        // Handle 404 specifically (function not deployed)
        if (response.status === 404) {
          console.error('Endpoint not found - Edge Function may need to be deployed');
          throw new Error('Service temporarily unavailable. Please try again in a moment.');
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error response:', errorData);
        
        // If the response includes analysis data despite error status, use it
        if (errorData.analysis && errorData.score) {
          const compatibility = errorData.score >= 85 ? 'Excellent' : errorData.score >= 70 ? 'Great' : 'Good';
          return {
            similarities: errorData.highlights || [],
            compatibility,
            recommendation: errorData.analysis,
            score: errorData.score,
          };
        }
        
        throw new Error(errorData.error || 'Failed to generate AI analysis');
      }

      const data = await response.json();
      
      // Check if we have valid data
      if (!data || (!data.analysis && !data.score)) {
        console.warn('Invalid response data, using fallback');
        throw new Error('Invalid response format');
      }
      
      // Convert API response to component format
      const compatibility = data.score >= 85 ? 'Excellent' : data.score >= 70 ? 'Great' : 'Good';
      
      return {
        similarities: data.highlights || [],
        compatibility,
        recommendation: data.analysis || "You seem like a great match!",
        score: data.score || 75,
      };
    } catch (error: any) {
      console.error('AI analysis error:', error);
      console.error('Error details:', error.message);
      
      // Don't show error toast if we have fallback data
      if (!error.message?.includes('fallback')) {
        toast.error('Using basic compatibility analysis');
      }
      
      // Fallback to basic analysis
      return {
        similarities: ['Potential for meaningful connection'],
        compatibility: 'Good',
        recommendation: `You and ${profile.name.split(' ')[0]} seem like a great match!`,
        score: 70,
      };
    } finally {
      setGenerating(false);
    }
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
            analysis: aiAnalysis ? {
              score: aiAnalysis.score,
              highlights: aiAnalysis.similarities,
              analysis: aiAnalysis.recommendation,
            } : null,
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
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl flex flex-col"
        style={{
          maxHeight: '90dvh',
          height: '90dvh',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl flex-shrink-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2E7B91]" />
            <h2 className="text-lg">Soft Intro</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
          }}
        >
          <div className="p-6 pb-12">
          {step === 'reason' && (
            <div>
              <h3 className="text-xl mb-2">Why do you want to connect with {profile.name.split(' ')[0]}?</h3>
              <p className="text-sm text-[#475569] mb-6">
                Our AI will analyze your compatibility and create a personalized introduction.
              </p>

              <div className="space-y-3 pb-4">
                {reasonOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleReasonSelect(option.value)}
                    className="w-full text-left p-4 border-2 border-[#EAEAEA] rounded-2xl hover:border-[#2E7B91] hover:bg-[#2E7B9115] active:bg-[#2E7B9120] transition-all touch-manipulation"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium mb-1 text-[#1E4F74]">{option.label}</p>
                        <p className="text-sm text-[#475569]">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'ai-analysis' && (
            <div className="space-y-6">
              {generating ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-[#2E7B91] mx-auto mb-4 animate-pulse" />
                  <p className="text-lg font-medium text-[#1E4F74] mb-2">Analyzing compatibility...</p>
                  <p className="text-sm text-[#475569]">Our AI is finding what makes you a great match!</p>
                </div>
              ) : aiAnalysis ? (
                <>
                  {/* AI Thinking Animation */}
                  <div className="flex items-center gap-3 p-4 bg-[#2E7B9115] rounded-2xl">
                    <Sparkles className="w-6 h-6 text-[#2E7B91]" />
                    <div className="flex-1">
                      <p className="font-medium text-[#1E4F74]">AI Analysis Complete</p>
                      <p className="text-sm text-[#25658A]">Here's what I found...</p>
                    </div>
                  </div>

                  {/* Compatibility */}
                  <div>
                    <h3 className="text-sm text-[#64748b] mb-2 font-medium">Compatibility Score</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#EAEAEA] rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#2E7B91] to-[#B69CFF] h-full rounded-full transition-all duration-1000"
                          style={{ width: `${aiAnalysis.score}%` }}
                        />
                      </div>
                      <Badge className="bg-[#2E7B9120] text-[#1E4F74]">{aiAnalysis.compatibility} Match ({aiAnalysis.score}%)</Badge>
                    </div>
                  </div>

              {/* Similarities */}
              <div>
                <h3 className="text-sm text-[#64748b] mb-3 font-medium">Key Highlights</h3>
                <div className="space-y-2">
                  {aiAnalysis.similarities.map((similarity, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-[#F9F6F3] rounded-2xl">
                      <div className="w-2 h-2 bg-[#2E7B91] rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-[#1E4F74] leading-relaxed">{similarity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-4 bg-gradient-to-br from-[#2E7B9115] to-[#B69CFF15] rounded-2xl border border-[#2E7B9140]">
                <h3 className="text-sm text-[#1E4F74] mb-2 flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-[#2E7B91]" />
                  Why You Should Connect
                </h3>
                <p className="text-sm text-[#1E4F74] leading-relaxed">{aiAnalysis.recommendation}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 pb-4">
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
                  className="flex-1 gap-2 bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] text-white rounded-2xl"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Intro'}
                </Button>
              </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#475569] mb-4">Failed to generate analysis. Please try again.</p>
                  <Button
                    onClick={() => handleReasonSelect(selectedReason)}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Intro Sent! 🎉</h3>
              <p className="text-[#475569] mb-4">
                {profile.name.split(' ')[0]} will receive a notification about your interest in connecting.
              </p>
              <p className="text-sm text-[#64748b]">
                They'll be able to review your profile and decide if they'd like to connect back.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
