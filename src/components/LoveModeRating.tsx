import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, X, MapPin, GraduationCap, Briefcase, Sparkles, Info, ArrowLeft, ChevronDown } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface LoveModeRatingProps {
  userProfile: any;
  accessToken: string;
  onRatingComplete: () => void;
}

export function LoveModeRating({ userProfile, accessToken, onRatingComplete }: LoveModeRatingProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/discover`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load profiles');

      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Load profiles error:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (rating: number) => {
    if (submitting) return;

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ratedUserId: currentProfile.id,
            rating: rating,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit rating');

      toast.success('Rating submitted', {
        duration: 2000,
      });

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedRating(null);
        setShowDetails(false);
      } else {
        toast.success('You\'ve rated everyone! Check back soon for new people.');
        onRatingComplete();
      }
    } catch (error) {
      console.error('Submit rating error:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedRating(null);
      setShowDetails(false);
    } else {
      onRatingComplete();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Finding people near you...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-white">
        <Card className="max-w-md w-full border-0 shadow-none">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2">No profiles available</h3>
            <p className="text-gray-600 mb-6">
              Check back soon! We're always adding new people.
            </p>
            <Button 
              onClick={onRatingComplete} 
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Go to My Matches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Minimal Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <button 
          onClick={onRatingComplete}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium">Rate Profiles</h3>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {profiles.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden max-w-2xl mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-pink-50 px-4 py-2 border-b border-pink-100">
        <div className="max-w-2xl mx-auto flex items-start gap-2">
          <Info className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-pink-900">
            Rate honestly 1-10. Link's AI uses your ratings to create meaningful matches.
          </p>
        </div>
      </div>

      {/* Main Card - Tinder Style */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-2xl mx-auto px-4 py-4 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* Photo Card */}
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden flex-1 flex flex-col">
                {/* Large Photo */}
                <div className="relative h-[55vh] overflow-hidden">
                  {currentProfile.photos && currentProfile.photos.length > 0 ? (
                    <img
                      src={currentProfile.photos[0]}
                      alt={currentProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="text-4xl bg-white/20 text-white">
                          {getInitials(currentProfile.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                  
                  {/* Name & Basic Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h2 className="text-3xl font-semibold mb-2">
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    <div className="flex flex-col gap-1 text-white/90 text-sm">
                      {currentProfile.school && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          <span>{currentProfile.school}</span>
                        </div>
                      )}
                      {currentProfile.major && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" />
                          <span>{currentProfile.major} • {currentProfile.year}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{currentProfile.distance || '< 5'} miles away</span>
                      </div>
                    </div>
                  </div>

                  {/* Swipe hint */}
                  {!showDetails && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                        Scroll down for more info
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrollable Details */}
                <div 
                  className="flex-1 overflow-y-auto bg-white"
                  onScroll={(e) => {
                    if (e.currentTarget.scrollTop > 10) {
                      setShowDetails(true);
                    }
                  }}
                >
                  <div className="p-5 space-y-5">
                    {/* Scroll Indicator */}
                    {!showDetails && (
                      <div className="flex justify-center -mt-2 mb-2">
                        <ChevronDown className="w-5 h-5 text-gray-400 animate-bounce" />
                      </div>
                    )}

                    {/* Bio */}
                    {currentProfile.bio && (
                      <div>
                        <h4 className="font-medium mb-2">About</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {currentProfile.bio}
                        </p>
                      </div>
                    )}

                    {/* Interests */}
                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.interests.map((interest: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personality */}
                    {currentProfile.personality && currentProfile.personality.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Personality</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.personality.map((trait: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Looking For */}
                    {currentProfile.lookingFor && currentProfile.lookingFor.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Looking For</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.lookingFor.map((goal: string, idx: number) => (
                            <Badge key={idx} className="text-xs bg-pink-100 text-pink-700 border-pink-200">
                              {goal.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Photos */}
                    {currentProfile.photos && currentProfile.photos.length > 1 && (
                      <div>
                        <h4 className="font-medium mb-3">More Photos</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {currentProfile.photos.slice(1, 5).map((photo: string, idx: number) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Photo ${idx + 2}`}
                              className="w-full aspect-[3/4] object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Rating Interface - Bottom Fixed */}
      <div className="bg-white border-t px-4 py-4 safe-bottom">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="text-center">
            <p className="text-sm font-medium">Rate this person</p>
            <p className="text-xs text-gray-500 mt-0.5">1 = Not interested • 10 = Very interested</p>
          </div>

          {/* Rating Buttons */}
          <div className="grid grid-cols-10 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                disabled={submitting}
                className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-sm font-semibold ${
                  selectedRating === rating
                    ? rating >= 7
                      ? 'border-pink-500 bg-pink-500 text-white shadow-md scale-105'
                      : rating >= 4
                      ? 'border-indigo-500 bg-indigo-500 text-white shadow-md scale-105'
                      : 'border-gray-500 bg-gray-500 text-white shadow-md scale-105'
                    : rating >= 7
                    ? 'border-pink-200 hover:border-pink-400 hover:bg-pink-50 text-pink-600'
                    : rating >= 4
                    ? 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={submitting}
              className="flex-1 h-12 border-gray-300"
            >
              Skip
            </Button>
            <Button
              onClick={() => selectedRating && submitRating(selectedRating)}
              disabled={!selectedRating || submitting}
              className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
