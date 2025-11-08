import { motion } from 'motion/react';
import { Heart, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface BondPrintResultsProps {
  bondPrint: any;
  onContinue: () => void;
}

export function BondPrintResults({ bondPrint, onContinue }: BondPrintResultsProps) {
  const getTraitLabel = (trait: string) => {
    const labels: { [key: string]: { low: string; high: string } } = {
      socialEnergy: { low: 'Introvert', high: 'Extrovert' },
      communication: { low: 'Subtle', high: 'Direct' },
      emotionalStyle: { low: 'Logical', high: 'Emotional' },
      spontaneity: { low: 'Planned', high: 'Spontaneous' },
      conflictStyle: { low: 'Harmonious', high: 'Direct' },
      independence: { low: 'Collaborative', high: 'Independent' },
      adventurousness: { low: 'Stable', high: 'Adventurous' },
      empathy: { low: 'Pragmatic', high: 'Empathetic' },
      competitiveness: { low: 'Cooperative', high: 'Competitive' },
    };
    return labels[trait] || { low: 'Low', high: 'High' };
  };

  const getTraitName = (trait: string) => {
    const names: { [key: string]: string } = {
      socialEnergy: 'Social Energy',
      communication: 'Communication',
      emotionalStyle: 'Emotional Style',
      spontaneity: 'Spontaneity',
      conflictStyle: 'Conflict Resolution',
      independence: 'Independence',
      adventurousness: 'Adventurousness',
      empathy: 'Empathy',
      competitiveness: 'Competitiveness',
    };
    return names[trait] || trait;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4 pb-8">
      {/* Top Close Button */}
      <div className="max-w-3xl mx-auto pt-4 flex justify-end">
        <Button
          onClick={onContinue}
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto pb-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl mb-3">Your Bond Print is Ready! 🎉</h1>
          <p className="text-xl text-gray-600">
            {bondPrint.summary}
          </p>
        </div>

        {/* Personality Card */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl">Your Personality</h2>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-4 py-1">
                {bondPrint.personality.primaryType}
              </Badge>
            </div>

            <p className="text-gray-700 mb-4">
              {bondPrint.personality.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {bondPrint.personality.secondaryTraits.map((trait: string) => (
                <Badge key={trait} variant="outline" className="border-purple-300">
                  {trait}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication Style */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              💬 Communication Style
            </h3>
            <Badge className="bg-purple-100 text-purple-700 mb-3">
              {bondPrint.communication.style}
            </Badge>
            <div className="space-y-2">
              {bondPrint.communication.preferences.map((pref: string) => (
                <div key={pref} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{pref}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              🎭 Personality Traits
            </h3>
            <div className="space-y-4">
              {Object.entries(bondPrint.traits).map(([key, value]) => {
                const score = value as number;
                const labels = getTraitLabel(key);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{getTraitName(key)}</span>
                      <span className="text-xs text-gray-500">
                        {score < 0.3 ? labels.low : score > 0.7 ? labels.high : 'Balanced'}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={score * 100} className="h-2" />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{labels.low}</span>
                        <span className="text-xs text-gray-500">{labels.high}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Social Preferences */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              👥 Social Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Ideal Setting:</span>
                <p className="font-medium">{bondPrint.social.idealSetting}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Recharge Method:</span>
                <p className="font-medium">{bondPrint.social.rechargeMethod}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Friendship Style:</span>
                <p className="font-medium">{bondPrint.social.friendshipStyle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Values */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              ⭐ Core Values
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {bondPrint.values.map((value: string) => (
                <div key={value} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Heart className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Living Preferences */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              🏠 Living Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Cleanliness</span>
                  <span className="text-xs text-gray-500">
                    {bondPrint.livingPreferences.cleanliness > 0.7 ? 'Very Clean' : 
                     bondPrint.livingPreferences.cleanliness > 0.4 ? 'Moderate' : 'Relaxed'}
                  </span>
                </div>
                <Progress value={bondPrint.livingPreferences.cleanliness * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Noise Level</span>
                  <span className="text-xs text-gray-500">
                    {bondPrint.livingPreferences.noiseLevel > 0.7 ? 'Lively' : 
                     bondPrint.livingPreferences.noiseLevel > 0.4 ? 'Moderate' : 'Quiet'}
                  </span>
                </div>
                <Progress value={bondPrint.livingPreferences.noiseLevel * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Social Space</span>
                  <span className="text-xs text-gray-500">
                    {bondPrint.livingPreferences.socialSpace > 0.7 ? 'Very Social' : 
                     bondPrint.livingPreferences.socialSpace > 0.4 ? 'Balanced' : 'Private'}
                  </span>
                </div>
                <Progress value={bondPrint.livingPreferences.socialSpace * 100} className="h-2" />
              </div>
              <div>
                <span className="text-sm text-gray-600">Schedule:</span>
                <Badge className="ml-2 bg-purple-100 text-purple-700">
                  {bondPrint.livingPreferences.schedule}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
          size="lg"
        >
          Start Finding Connections
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Your Bond Print helps us match you with friends, roommates, and potential dates 💜
        </p>
      </motion.div>
    </div>
  );
}
