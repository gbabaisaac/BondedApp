import { useState, useEffect } from 'react';
import { LoveModeOnboarding } from './LoveModeOnboarding';
import { LoveModeRatingNew } from './LoveModeRatingNew';
import { LovePrintQuizNew } from './LovePrintQuizNew';
import { BlindChatWithLink } from './BlindChatWithLink';
import { BondRevealReport } from './BondRevealReport';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  Heart,
  Sparkles,
  MessageCircle,
  User,
  Settings,
  ArrowLeft,
  Lock,
  Unlock,
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface LoveModeNewProps {
  userProfile: any;
  accessToken: string;
  onExit: () => void;
}

type LoveModeView =
  | 'onboarding'
  | 'lovePrintQuiz'
  | 'rating'
  | 'matches'
  | 'chat'
  | 'reveal';

export function LoveModeNew({ userProfile, accessToken, onExit }: LoveModeNewProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<LoveModeView>('onboarding');
  const [relationships, setRelationships] = useState<any[]>([]);
  const [activeRelationship, setActiveRelationship] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  useEffect(() => {
    checkLoveModeActivation();
  }, []);

  const checkLoveModeActivation = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/activation-status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsActivated(data.isActivated || false);

        if (data.isActivated) {
          // Check if user has Love Print
          if (!userProfile.lovePrint) {
            setCurrentView('lovePrintQuiz');
          } else {
            setCurrentView('matches');
            loadRelationships();
          }
        }
      } else {
        setIsActivated(false);
      }
    } catch (error) {
      console.error('Check activation error:', error);
      setIsActivated(false);
    } finally {
      setLoading(false);
    }
  };

  const activateLoveMode = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/activate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setIsActivated(true);

        // Start with Love Print quiz if not completed
        if (!userProfile.lovePrint) {
          setCurrentView('lovePrintQuiz');
        } else {
          setCurrentView('rating');
        }

        toast.success('Welcome to Love Mode! 💜');
        loadRelationships();
      } else {
        throw new Error('Failed to activate');
      }
    } catch (error) {
      console.error('Activate Love Mode error:', error);
      toast.error('Failed to activate Love Mode');
    }
  };

  const handleLovePrintComplete = async (lovePrint: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/love-print`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ lovePrint }),
        }
      );

      if (response.ok) {
        toast.success('Love Print complete! Now let\'s find your matches.');
        setCurrentView('rating');
      }
    } catch (error) {
      console.error('Save Love Print error:', error);
      toast.error('Failed to save Love Print');
    }
  };

  const skipLovePrint = () => {
    setCurrentView('rating');
  };

  const loadRelationships = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/relationships`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRelationships(data.relationships || []);
      }
    } catch (error) {
      console.error('Load relationships error:', error);
    }
  };

  const handleRatingComplete = () => {
    loadRelationships();
    setCurrentView('matches');
  };

  const handleOpenChat = async (relationship: any) => {
    setActiveRelationship(relationship);

    // Load partner profile if revealed
    if (relationship.revealed) {
      await loadPartnerProfile(relationship.partnerId);
    }

    setCurrentView('chat');
  };

  const loadPartnerProfile = async (partnerId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile/${partnerId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const profile = await response.json();
        setPartnerProfile(profile);
      }
    } catch (error) {
      console.error('Load partner profile error:', error);
    }
  };

  const handleRevealRequested = async () => {
    // Reload relationship to check if both agreed
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/relationships`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedRelationship = data.relationships.find((r: any) => r.id === activeRelationship.id);

        if (updatedRelationship?.revealed) {
          // Both agreed - show reveal!
          await loadPartnerProfile(updatedRelationship.partnerId);
          setActiveRelationship(updatedRelationship);
          setCurrentView('reveal');
        }
      }
    } catch (error) {
      console.error('Check reveal status error:', error);
    }
  };

  // Views
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Sparkles className="w-12 h-12 text-pink-500 animate-pulse" />
      </div>
    );
  }

  if (!isActivated) {
    return <LoveModeOnboarding onActivate={activateLoveMode} />;
  }

  if (currentView === 'lovePrintQuiz') {
    return (
      <LovePrintQuizNew
        onComplete={handleLovePrintComplete}
        onSkip={skipLovePrint}
      />
    );
  }

  if (currentView === 'rating') {
    return (
      <LoveModeRatingNew
        userProfile={userProfile}
        accessToken={accessToken}
        onRatingComplete={handleRatingComplete}
      />
    );
  }

  if (currentView === 'chat' && activeRelationship) {
    return (
      <BlindChatWithLink
        relationship={activeRelationship}
        userProfile={userProfile}
        accessToken={accessToken}
        onBack={() => {
          setActiveRelationship(null);
          setCurrentView('matches');
          loadRelationships();
        }}
        onRevealRequested={handleRevealRequested}
      />
    );
  }

  if (currentView === 'reveal' && activeRelationship && partnerProfile) {
    return (
      <BondRevealReport
        relationship={activeRelationship}
        userProfile={userProfile}
        partnerProfile={partnerProfile}
        accessToken={accessToken}
        onContinueChat={() => setCurrentView('chat')}
      />
    );
  }

  // Matches View (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onExit}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Love Mode
                  </h1>
                </div>
                <p className="text-xs text-gray-600">
                  Where hearts connect first
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('rating')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Rate More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {relationships.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Matches Yet</h2>
            <p className="text-gray-600 mb-6">
              Keep rating profiles to help our AI understand your type.<br />
              We'll notify you when you have a match!
            </p>
            <Button
              onClick={() => setCurrentView('rating')}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Rating
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Connections</h2>

            {relationships.map((relationship) => (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-pink-200"
                  onClick={() => handleOpenChat(relationship)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {relationship.revealed ? (
                        <Avatar className="w-16 h-16 border-2 border-pink-200">
                          <AvatarImage src={relationship.partnerPhoto} />
                          <AvatarFallback className="bg-pink-100 text-pink-700">
                            {relationship.partnerName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-gray-500" />
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-lg">
                          {relationship.revealed
                            ? relationship.partnerName
                            : relationship.anonymousName || 'Mystery Match'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              relationship.bondStrength >= 75 ? 'bg-pink-100 text-pink-700' :
                              relationship.bondStrength >= 50 ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            Bond: {relationship.bondStrength}%
                          </Badge>
                          {relationship.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {relationship.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {relationship.revealed ? (
                        <Unlock className="w-6 h-6 text-pink-500" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {relationship.lastMessage
                          ? new Date(relationship.lastMessageAt).toLocaleDateString()
                          : 'Start chatting'}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
