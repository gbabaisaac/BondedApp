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
  Star,
  X,
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

type LoveModeTab = 'discover' | 'matches' | 'profile';

export function LoveModeNew({ userProfile, accessToken, onExit }: LoveModeNewProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<LoveModeView>('onboarding');
  const [currentTab, setCurrentTab] = useState<LoveModeTab>('matches');
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
            setCurrentTab('matches');
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
          setCurrentTab('discover');
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
        setCurrentTab('discover');
        setCurrentView('rating');
      }
    } catch (error) {
      console.error('Save Love Print error:', error);
      toast.error('Failed to save Love Print');
    }
  };

  const skipLovePrint = () => {
    setCurrentTab('discover');
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
    setCurrentTab('matches');
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

  // Full-screen views with exit button
  if (currentView === 'lovePrintQuiz') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Exit Button */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <LovePrintQuizNew
          onComplete={handleLovePrintComplete}
          onSkip={skipLovePrint}
        />
      </div>
    );
  }

  if (currentView === 'rating') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
        {/* Exit Button */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <LoveModeRatingNew
          userProfile={userProfile}
          accessToken={accessToken}
          onRatingComplete={handleRatingComplete}
        />
      </div>
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
          setCurrentTab('matches');
          setCurrentView('matches');
          loadRelationships();
        }}
        onRevealRequested={handleRevealRequested}
      />
    );
  }

  if (currentView === 'reveal' && activeRelationship && partnerProfile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
        {/* Exit Button */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCurrentTab('matches');
              setCurrentView('matches');
              setActiveRelationship(null);
              loadRelationships();
            }}
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <BondRevealReport
          relationship={activeRelationship}
          userProfile={userProfile}
          partnerProfile={partnerProfile}
          accessToken={accessToken}
          onContinueChat={() => setCurrentView('chat')}
        />
      </div>
    );
  }

  // Main Love Mode Layout with Navigation
  return (
    <div
      className="fixed inset-0 flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
      style={{
        height: '100dvh',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 z-10 flex-shrink-0 safe-top">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onExit}
                className="hover:bg-pink-50 flex-shrink-0 touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                    Love Mode
                  </h1>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                  Where hearts connect first
                </p>
              </div>
            </div>

            {currentTab === 'matches' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentTab('discover');
                  setCurrentView('rating');
                }}
                className="border-pink-200 hover:bg-pink-50 flex-shrink-0 touch-manipulation hidden sm:flex"
                style={{ minHeight: '36px' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Rate More</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto overflow-x-hidden" style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))'
        }}>
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full">
        {relationships.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Matches Yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-2">
              Keep rating profiles to help our AI understand your type.<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>We'll notify you when you have a match!
            </p>
            <Button
              onClick={() => {
                setCurrentTab('discover');
                setCurrentView('rating');
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Rating
            </Button>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-1">Your Connections</h2>

            {relationships.map((relationship) => (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="p-4 sm:p-6 cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 hover:border-pink-200 touch-manipulation"
                  onClick={() => handleOpenChat(relationship)}
                  style={{ minHeight: '80px' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {relationship.revealed ? (
                        <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-pink-200 flex-shrink-0">
                          <AvatarImage src={relationship.partnerPhoto} />
                          <AvatarFallback className="bg-pink-100 text-pink-700 text-base sm:text-lg">
                            {relationship.partnerName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {relationship.revealed
                            ? relationship.partnerName
                            : relationship.anonymousName || 'Mystery Match'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] sm:text-xs ${
                              relationship.bondStrength >= 75 ? 'bg-pink-100 text-pink-700' :
                              relationship.bondStrength >= 50 ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            Bond: {relationship.bondStrength}%
                          </Badge>
                          {relationship.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-[10px] sm:text-xs">
                              {relationship.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {relationship.revealed ? (
                        <Unlock className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                      ) : (
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 whitespace-nowrap">
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
      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex-shrink-0 safe-bottom"
        style={{
          paddingTop: '4px',
          paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-around h-16 px-2">
            <button
              onClick={() => {
                setCurrentTab('discover');
                setCurrentView('rating');
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation relative ${
                currentTab === 'discover'
                  ? 'text-pink-600'
                  : 'text-gray-500 active:text-gray-700'
              }`}
              style={{ minHeight: '44px' }}
            >
              <Star className={`w-6 h-6 ${currentTab === 'discover' ? 'fill-current' : ''}`} />
              <span className="text-[10px] sm:text-xs font-medium mt-0.5">Discover</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('matches');
                setCurrentView('matches');
                loadRelationships();
              }}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                currentTab === 'matches'
                  ? 'text-pink-600'
                  : 'text-gray-500 active:text-gray-700'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="relative">
                <MessageCircle className={`w-6 h-6 ${currentTab === 'matches' ? 'fill-current' : ''}`} />
                {relationships.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                    {relationships.length > 9 ? '9+' : relationships.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium mt-0.5">Matches</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('profile');
                // TODO: Add profile view
                toast.info('Profile view coming soon!');
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                currentTab === 'profile'
                  ? 'text-pink-600'
                  : 'text-gray-500 active:text-gray-700'
              }`}
              style={{ minHeight: '44px' }}
            >
              <User className={`w-6 h-6 ${currentTab === 'profile' ? 'fill-current' : ''}`} />
              <span className="text-[10px] sm:text-xs font-medium mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
