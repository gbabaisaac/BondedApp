import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DailyLoveQuestion } from './DailyLoveQuestion';
import { Heart, Sparkles, MessageCircle, RefreshCw, Lock, Star, ArrowRight, Mic, Eye } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { loveStageIcons } from '../utils/design-system';

interface LoveModeMatchesProps {
  userProfile: any;
  accessToken: string;
  relationships: any[];
  onOpenChat: (relationship: any) => void;
  onRefresh: () => void;
  onStartRating: () => void;
}

export function LoveModeMatches({ 
  userProfile, 
  accessToken, 
  relationships, 
  onOpenChat,
  onRefresh,
  onStartRating
}: LoveModeMatchesProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onRefresh();
  }, []);

  const getStageDisplay = (stage: number) => {
    const stages = [
      { name: 'Anonymous Chat', Icon: MessageCircle, color: 'bg-indigo-100 text-indigo-700' },
      { name: 'Voice Exchange', Icon: Mic, color: 'bg-purple-100 text-purple-700' },
      { name: 'Reveal Stage', Icon: Eye, color: 'bg-pink-100 text-pink-700' },
      { name: 'Bonded Date', Icon: Heart, color: 'bg-rose-100 text-rose-700' },
    ];
    return stages[stage - 1] || stages[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h2 className="text-xl">My Matches</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Daily Love Question */}
        <DailyLoveQuestion 
          accessToken={accessToken}
          onComplete={onRefresh}
        />

        {/* Rate More People Button */}
        <Card 
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={onStartRating}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Rate More People</h3>
                  <p className="text-sm text-white/90">Help Link find better matches for you</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* AI Match Explanation */}
        {relationships.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-purple-900 mb-1">AI Blind Matches</h4>
                  <p className="text-xs text-purple-800">
                    Link analyzed your ratings and Bond Print to create these connections. 
                    Both of you rated each other highly. Start anonymous and progress through stages!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Matches */}
        {relationships.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              Your Connections ({relationships.length})
            </h3>
            <div className="space-y-2">
              {relationships.map((rel) => {
                const stageInfo = getStageDisplay(rel.stage);
                const isRevealed = rel.stage >= 3;
                
                return (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onOpenChat(rel)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {isRevealed && rel.otherUser?.profilePicture ? (
                              <img
                                src={rel.otherUser.profilePicture}
                                alt={rel.otherUser.name}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                                <Lock className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-lg">
                                {isRevealed ? rel.otherUser?.name || 'Anonymous' : rel.theirAlias}
                              </p>
                              <Badge className={`text-xs ${stageInfo.color} border mt-1 inline-flex items-center gap-1`}>
                                <stageInfo.Icon className="w-3 h-3" />
                                {stageInfo.name}
                              </Badge>
                            </div>
                          </div>
                          <MessageCircle className="w-5 h-5 text-gray-400" />
                        </div>

                        {rel.lastMessage && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 truncate">
                              {rel.lastMessage}
                            </p>
                          </div>
                        )}

                        {/* Bond Score Progress */}
                        {rel.bondScore !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Connection Strength</span>
                              <span>{rel.bondScore}/100</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-500"
                                style={{ width: `${rel.bondScore}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Match Quality */}
                        {rel.compatibilityScore && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                            <Sparkles className="w-3 h-3" />
                            <span>{rel.compatibilityScore}% AI Match Quality</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-6">
                Start rating profiles! Link will create blind matches when you and someone else rate each other highly.
              </p>
              <Button
                onClick={onStartRating}
                className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
              >
                <Star className="w-4 h-4 mr-2" />
                Rate Profiles
              </Button>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">How Love Mode Works</h4>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</div>
                <span>Rate people 1-10 based on their profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</div>
                <span>Link's AI analyzes ratings + Bond Prints for compatibility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</div>
                <span>When both rate each other 7+, a blind match is created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</div>
                <span>Chat anonymously → Progress through stages → Reveal identities</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
