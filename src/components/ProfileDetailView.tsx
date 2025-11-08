import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Sparkles, Instagram, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { SoftIntroFlow } from './SoftIntroFlow';
import { projectId } from '../utils/supabase/info';
import { theme } from '../utils/theme';

interface Profile {
  id: string;
  name: string;
  age: number;
  school: string;
  major: string;
  year: string;
  bio: string;
  interests: string[];
  lookingFor: string[];
  imageUrl: string;
  personality?: string[];
  sleepSchedule?: string;
  cleanliness?: string;
  instagram?: string;
  snapchat?: string;
}

interface ProfileDetailViewProps {
  profile: Profile;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  accessToken?: string;
}

export function ProfileDetailView({ profile, onClose, onNext, onPrev, hasNext, hasPrev, accessToken }: ProfileDetailViewProps) {
  const [showSoftIntro, setShowSoftIntro] = useState(false);
  const [liked, setLiked] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);

  // Reset liked state when profile changes
  useEffect(() => {
    setLiked(false);
    loadCompatibility();
  }, [profile.id]);

  const loadCompatibility = async () => {
    if (!accessToken) return;
    setLoadingCompatibility(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/compatibility/${profile.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCompatibility(data);
      }
    } catch (error) {
      console.error('Error loading compatibility:', error);
    } finally {
      setLoadingCompatibility(false);
    }
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasNext) {
      setDirection(1);
      onNext();
    }
    if (isRightSwipe && hasPrev) {
      setDirection(-1);
      onPrev();
    }
  };

  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    if (newLikedState) {
      toast.success(`You liked ${profile.name}!`, {
        description: "They'll be notified of your interest.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white z-[100] flex flex-col"
      style={{
        height: '100vh',
        height: '100dvh',
      }}
    >
      {/* Header */}
      <div className={`${theme.components.navigation.header} px-4 py-4 flex items-center justify-between flex-shrink-0`}>
        <button onClick={onClose} className={`p-2 -ml-2 hover:bg-gray-100 rounded-full ${theme.transition.default}`}>
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <h3 className="font-semibold text-lg">{profile.name}, {profile.age}</h3>
          <p className="text-sm text-gray-500">{profile.school}</p>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
        }}
      >
        {/* Image with tap zones for navigation */}
        <div 
          className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <motion.img
            key={profile.id}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ duration: 0.3 }}
            src={profile.profilePicture || profile.photos?.[0] || profile.imageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          
          {/* Tap zones for navigation */}
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-4 group"
            >
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <ChevronLeft className="w-6 h-6" />
              </div>
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-4 group"
            >
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6" />
              </div>
            </button>
          )}

          {/* Position indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
            <p className="text-white text-xs">Swipe to see more profiles</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div>
            <h2 className="text-2xl mb-1">{profile.name}, {profile.age}</h2>
            <p className="text-gray-600">{profile.major} • {profile.year}</p>
            <p className="text-sm text-gray-500">{profile.school}</p>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-sm text-gray-500 mb-2">About</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>

          {/* Compatibility Analysis */}
          {compatibility && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-medium">Compatibility</h3>
              </div>
              <div className="space-y-3">
                {compatibility.score && (
                  <div>
                    <p className="text-sm font-medium text-indigo-700">
                      {compatibility.score}% Match
                    </p>
                  </div>
                )}
                {compatibility.commonInterests && compatibility.commonInterests.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">You both enjoy:</p>
                    <div className="flex flex-wrap gap-1">
                      {compatibility.commonInterests.map((interest: string) => (
                        <Badge key={interest} className="text-xs bg-indigo-100 text-indigo-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {compatibility.analysis && (
                  <p className="text-sm text-gray-700">
                    {compatibility.analysis}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Looking For */}
          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {profile.lookingFor.map((item) => (
                  <Badge key={item} className="bg-indigo-100 text-indigo-700">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Personality */}
          {profile.personality && profile.personality.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Personality</h3>
              <div className="flex flex-wrap gap-2">
                {profile.personality.map((trait) => (
                  <Badge key={trait} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Living Habits */}
          {(profile.sleepSchedule || profile.cleanliness) && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Living Habits</h3>
              <div className="space-y-1 text-sm">
                {profile.sleepSchedule && (
                  <p>
                    <span className="text-gray-500">Sleep Schedule:</span>{' '}
                    <span className="capitalize">{profile.sleepSchedule}</span>
                  </p>
                )}
                {profile.cleanliness && (
                  <p>
                    <span className="text-gray-500">Cleanliness:</span>{' '}
                    <span className="capitalize">{profile.cleanliness}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {(profile.instagram || profile.snapchat) && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Social Media</h3>
              <div className="space-y-2">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:underline"
                  >
                    <Instagram className="w-4 h-4" />
                    {profile.instagram}
                  </a>
                )}
                {profile.snapchat && (
                  <p className="text-sm">
                    <span className="text-gray-500">Snapchat:</span> {profile.snapchat}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div
        className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4 safe-bottom"
        style={{
          paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
        }}
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLike}
            className={`flex-1 gap-2 font-semibold ${
              liked ? 'bg-red-50 border-red-400 text-red-600 hover:bg-red-100' : 'hover:border-gray-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-600' : ''}`} />
            {liked ? 'Liked' : 'Like'}
          </Button>
          <Button
            size="lg"
            onClick={() => setShowSoftIntro(true)}
            className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            Soft Intro
          </Button>
        </div>
      </div>

      {/* Soft Intro Flow */}
      {showSoftIntro && (
        <SoftIntroFlow 
          profile={profile}
          onClose={() => setShowSoftIntro(false)}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}
