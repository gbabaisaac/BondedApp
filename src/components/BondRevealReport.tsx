import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  Heart,
  Sparkles,
  MessageCircle,
  Check,
  TrendingUp,
  Brain,
  Zap,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId } from '../utils/supabase/info';

interface BondRevealReportProps {
  relationship: any;
  userProfile: any;
  partnerProfile: any;
  accessToken: string;
  onContinueChat: () => void;
}

export function BondRevealReport({
  relationship,
  userProfile,
  partnerProfile,
  accessToken,
  onContinueChat,
}: BondRevealReportProps) {
  const [showContent, setShowContent] = useState(false);
  const [bondReport, setBondReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dramatic reveal animation
    setTimeout(() => setShowContent(true), 1000);
    loadBondReport();
  }, []);

  const loadBondReport = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/bond-report/${relationship.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBondReport(data.report);
      }
    } catch (error) {
      console.error('Load bond report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const compatibilityScore = bondReport?.overallCompatibility || relationship.bondStrength || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8">
        {/* Reveal Animation */}
        <AnimatePresence>
          {!showContent && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600"
            >
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heart className="w-24 h-24 mx-auto mb-6" />
                  <h1 className="text-4xl font-bold mb-2">The Reveal</h1>
                  <p className="text-xl text-white/90">Showing who you both are...</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <Heart className="w-10 h-10 text-purple-500" />
              <Sparkles className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Your Bond Report
            </h1>
            <p className="text-gray-600">
              Based on your emotional connection and compatibility
            </p>
          </div>

          {/* Profiles Revealed */}
          <Card className="p-8 mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* Your Profile */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-center"
              >
                <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-white shadow-lg">
                  <AvatarImage src={userProfile.profilePicture || userProfile.photos?.[0]} />
                  <AvatarFallback className="bg-purple-200 text-purple-700 text-2xl">
                    {userProfile.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{userProfile.name}</h3>
                <p className="text-sm text-gray-600">{userProfile.school}</p>
              </motion.div>

              {/* Heart Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              </motion.div>

              {/* Partner Profile */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-center"
              >
                <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-white shadow-lg">
                  <AvatarImage src={partnerProfile.profilePicture || partnerProfile.photos?.[0]} />
                  <AvatarFallback className="bg-pink-200 text-pink-700 text-2xl">
                    {partnerProfile.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{partnerProfile.name}</h3>
                <p className="text-sm text-gray-600">{partnerProfile.school}</p>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-gray-700 mb-2">
                You matched with <span className="font-semibold text-purple-600">{partnerProfile.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                You connected through emotional depth, not just appearance
              </p>
            </div>
          </Card>

          {/* Overall Compatibility Score */}
          <Card className="p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">Overall Compatibility</h3>
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2, type: 'spring' }}
                  className="text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {compatibilityScore}%
                </motion.div>
              </div>
            </div>
            <Progress value={compatibilityScore} className="h-3 mb-2" />
            <p className="text-center text-sm text-gray-600">
              {compatibilityScore >= 80 ? 'Exceptional Match' :
               compatibilityScore >= 60 ? 'Strong Connection' :
               compatibilityScore >= 40 ? 'Good Potential' :
               'Growing Together'}
            </p>
          </Card>

          {/* Compatibility Breakdown */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Emotional Compatibility</h4>
                  <p className="text-sm text-gray-600">
                    {bondReport?.emotionalCompatibility || compatibilityScore}%
                  </p>
                </div>
              </div>
              <Progress value={bondReport?.emotionalCompatibility || compatibilityScore} className="mb-2" />
              <p className="text-xs text-gray-600">
                {bondReport?.emotionalInsight || 'Your emotional connection shows strong mutual understanding and empathy.'}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Communication Style</h4>
                  <p className="text-sm text-gray-600">
                    {bondReport?.communicationScore || Math.max(70, compatibilityScore - 10)}%
                  </p>
                </div>
              </div>
              <Progress value={bondReport?.communicationScore || Math.max(70, compatibilityScore - 10)} className="mb-2" />
              <p className="text-xs text-gray-600">
                {bondReport?.communicationInsight || 'You both communicate openly and effectively with each other.'}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Value Alignment</h4>
                  <p className="text-sm text-gray-600">
                    {bondReport?.valueAlignment || Math.max(65, compatibilityScore - 15)}%
                  </p>
                </div>
              </div>
              <Progress value={bondReport?.valueAlignment || Math.max(65, compatibilityScore - 15)} className="mb-2" />
              <p className="text-xs text-gray-600">
                {bondReport?.valuesInsight || 'You share important core values and life priorities.'}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Attachment Compatibility</h4>
                  <p className="text-sm text-gray-600">
                    {bondReport?.attachmentCompatibility || Math.max(60, compatibilityScore - 20)}%
                  </p>
                </div>
              </div>
              <Progress value={bondReport?.attachmentCompatibility || Math.max(60, compatibilityScore - 20)} className="mb-2" />
              <p className="text-xs text-gray-600">
                {bondReport?.attachmentInsight || 'Your attachment styles complement each other well.'}
              </p>
            </Card>
          </div>

          {/* Key Strengths */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Your Connection Strengths
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {(bondReport?.strengths || [
                'Deep emotional connection',
                'Open and authentic communication',
                'Mutual respect and understanding',
                'Shared emotional intelligence',
                'Natural conversation flow',
                'Compatible values and goals',
              ]).map((strength: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Growth Areas */}
          {bondReport?.growthAreas && bondReport.growthAreas.length > 0 && (
            <Card className="p-6 mb-6 bg-blue-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Areas to Explore Together
              </h3>
              <div className="space-y-2">
                {bondReport.growthAreas.map((area: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Insight */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Link's Insight</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {bondReport?.linkInsight ||
                    `What makes your connection special is how you both prioritized emotional depth over surface attraction. Through your conversations, you've shown genuine curiosity, vulnerability, and empathy. This foundation—built on who you truly are—creates a more meaningful and lasting bond than visual chemistry alone.`
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Continue your conversation</p>
                  <p className="text-sm text-gray-600">
                    Now that you know each other, keep building your connection
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Take it to the next level</p>
                  <p className="text-sm text-gray-600">
                    Plan a real date to meet in person
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onContinueChat}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
            >
              Continue Chatting with {partnerProfile.name}
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
