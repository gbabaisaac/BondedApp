import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, X, Sparkles, ChevronLeft, Info } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface LoveModeRatingNewProps {
  userProfile: any;
  accessToken: string;
  onRatingComplete: () => void;
}

export function LoveModeRatingNew({ userProfile, accessToken, onRatingComplete }: LoveModeRatingNewProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratingsGiven, setRatingsGiven] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

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

      setRatingsGiven(ratingsGiven + 1);

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast.success('Great work! Your AI is learning your type.', {
          duration: 3000,
        });
        onRatingComplete();
      }
    } catch (error) {
      console.error('Submit rating error:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwipeEnd = (_: any, info: any) => {
    const threshold = 50;

    if (Math.abs(info.offset.x) > threshold) {
      const rating = info.offset.x > 0
        ? Math.min(10, Math.ceil((info.offset.x / 200) * 10))
        : Math.max(1, 10 - Math.ceil((Math.abs(info.offset.x) / 200) * 10));

      submitRating(rating);
    }
  };

  const handleRatingClick = (rating: number) => {
    submitRating(rating);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Finding profiles for you...</p>
        </motion.div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-6">
            You've rated everyone available. Check back soon for new profiles!
          </p>
          <Button onClick={onRatingComplete} className="w-full">
            View Matches
          </Button>
        </Card>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span className="font-semibold text-gray-900">Rate Phase</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                {ratingsGiven} rated
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-pink-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentIndex / profiles.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto px-4 pt-4"
          >
            <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-1">How It Works</p>
                  <p className="text-gray-600">
                    Rate based on <span className="font-medium">instinctual attraction</span> (1-10).
                    This trains Bonded's AI to understand your visual preferences.
                    <span className="block mt-1 text-pink-600">
                      → Swipe right for higher ratings, left for lower
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructions(false)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="max-w-md mx-auto px-4 py-6 flex items-center justify-center min-h-[600px]">
        <div className="relative w-full max-w-sm aspect-[3/4]">
          <AnimatePresence>
            {currentProfile && (
              <motion.div
                key={currentProfile.id}
                className="absolute inset-0"
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleSwipeEnd}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full overflow-hidden shadow-2xl border-2 border-white">
                  {/* Profile Image */}
                  <div className="relative h-3/4 bg-gradient-to-br from-pink-100 to-purple-100">
                    {currentProfile.profilePicture || currentProfile.photos?.[0] ? (
                      <img
                        src={currentProfile.profilePicture || currentProfile.photos[0]}
                        alt={currentProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-24 h-24 text-pink-300" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Name & Age */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-3xl font-bold text-white mb-1">
                        {currentProfile.name}, {currentProfile.year || '22'}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {currentProfile.school}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="h-1/4 p-4 bg-white">
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.major && (
                        <Badge variant="secondary" className="text-xs">
                          {currentProfile.major}
                        </Badge>
                      )}
                      {currentProfile.interests?.slice(0, 2).map((interest: string) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rating Buttons */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <p className="text-center text-sm text-gray-600 mb-4">
            Rate your attraction level
          </p>

          {/* Rating Scale */}
          <div className="grid grid-cols-10 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <Button
                key={rating}
                onClick={() => handleRatingClick(rating)}
                disabled={submitting}
                className={`
                  h-12 p-0 text-sm font-semibold transition-all
                  ${rating <= 3 ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' :
                    rating <= 6 ? 'bg-blue-200 hover:bg-blue-300 text-blue-700' :
                    rating <= 8 ? 'bg-purple-200 hover:bg-purple-300 text-purple-700' :
                    'bg-pink-500 hover:bg-pink-600 text-white'}
                `}
              >
                {rating}
              </Button>
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>Not My Type</span>
            <span>Very Attractive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
