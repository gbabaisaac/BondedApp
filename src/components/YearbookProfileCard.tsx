import { motion } from 'motion/react';
import { Sparkles, Instagram, Music2, Heart } from 'lucide-react';
import { ProfilePhotoCarousel } from './ProfilePhotoCarousel';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface YearbookProfileCardProps {
  profile: {
    id: string;
    name: string;
    pronouns?: string;
    profilePicture?: string;
    photos?: string[];
    bio?: string;
    interests?: string[];
    personality?: string[];
    bondPrint?: any;
    lookingFor?: string[];
    instagram?: string;
    spotify?: string;
    socialConnections?: any;
    scrapbookEnabled?: boolean;
    roommateMode?: boolean;
  };
  bondPrintScore?: number;
  sharedInsights?: string[];
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  'aria-label'?: string;
}

export function YearbookProfileCard({
  profile,
  bondPrintScore,
  sharedInsights = [],
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
}: YearbookProfileCardProps) {
  const isHighMatch = bondPrintScore && bondPrintScore >= 70;
  
  // Get photos array
  const photos = profile.photos || (profile.profilePicture ? [profile.profilePicture] : []);
  const carouselImages = photos.map((photo, index) => ({
    src: photo,
    alt: `${profile.name} photo ${index + 1}`,
  }));

  // Get personality tags
  const getPersonalityTags = (): string[] => {
    const tags: string[] = [];
    
    if (profile.bondPrint?.personality?.type) {
      const type = profile.bondPrint.personality.type;
      const typeMap: Record<string, string> = {
        'introvert': '🧠 The Thinker',
        'extrovert': '🌟 The Explorer',
        'ambivert': '⚖️ The Balancer',
        'analytical': '🔬 The Builder',
        'creative': '🎨 The Creator',
        'empath': '💝 The Empath',
      };
      tags.push(typeMap[type] || `🧠 ${type}`);
    }
    
    profile.personality?.slice(0, 2).forEach((trait: string) => {
      tags.push(trait);
    });
    
    return tags;
  };

  // Get vibe tags (interests)
  const getVibeTags = (): string[] => {
    const tags: string[] = [];
    
    profile.interests?.slice(0, 3).forEach((interest: string) => {
      const interestMap: Record<string, string> = {
        'music': '🎵 Music',
        'indie': '🎵 Indie',
        'r&b': '🎵 R&B',
        'house': '🎵 House',
        'travel': '✈️ Travel',
        'gaming': '🎮 Gaming',
        'design': '🎨 Design',
        'fashion': '👗 Fashion',
        'fitness': '💪 Fitness',
      };
      tags.push(interestMap[interest.toLowerCase()] || interest);
    });
    
    if (profile.bondPrint?.traits) {
      const vibeWords = ['Chill', 'Ambitious', 'Funny', 'Deep', 'Creative', 'Adventurous'];
      vibeWords.forEach((word) => {
        if (profile.bondPrint.traits[word.toLowerCase()]) {
          tags.push(word);
        }
      });
    }
    
    return tags;
  };

  const personalityTags = getPersonalityTags();
  const vibeTags = getVibeTags();
  const allTags = [...personalityTags, ...vibeTags].slice(0, 4);

  // Get mode badges
  const getModeBadges = (): string[] => {
    const badges: string[] = [];
    if (profile.scrapbookEnabled) {
      badges.push('💞 Scrapbook');
    }
    if (profile.roommateMode) {
      badges.push('🏠 Roommate');
    }
    if (!profile.scrapbookEnabled && !profile.roommateMode) {
      badges.push('🫱 Friend');
    }
    return badges;
  };

  const modeBadges = getModeBadges();

  // Get quote/bio
  const getQuote = (): string => {
    if (profile.bio) {
      return profile.bio.length > 60 ? profile.bio.substring(0, 60) + '...' : profile.bio;
    }
    return 'Late-night thinker, early-morning texter.';
  };

  const quote = getQuote();

  // Check for social connections
  const hasInstagram = profile.instagram || profile.socialConnections?.instagram;
  const hasSpotify = profile.spotify || profile.socialConnections?.spotify;

  return (
    <motion.button
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden bg-white rounded-[18px] shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 w-full text-left",
        isHighMatch && "ring-2 ring-teal-400 ring-offset-2"
      )}
    >
      {/* Bond Print Badge */}
      {bondPrintScore && bondPrintScore >= 50 && (
        <div
          className={cn(
            "absolute top-3 right-3 z-10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1",
            isHighMatch
              ? "bg-gradient-to-r from-teal-500 to-navy-500"
              : "bg-teal-500"
          )}
        >
          <Sparkles className="w-3 h-3" />
          {bondPrintScore}% Match
        </div>
      )}

      {/* Photo Carousel Area */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-teal-100 to-navy-100">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <ProfilePhotoCarousel
            images={carouselImages.length > 0 ? carouselImages : [{ src: '', alt: 'No photo' }]}
            loop={carouselImages.length > 2}
            autoplay={false}
            showPagination={false}
            showNavigation={false}
            height="100%"
            className="max-w-full"
          />
        </div>

        {/* Mode Badges Overlay */}
        {modeBadges.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {modeBadges.map((badge, i) => (
              <Badge
                key={i}
                className="bg-white/90 backdrop-blur-sm text-teal-700 text-[10px] font-medium px-2 py-1"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Tag Row */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.05 }}
                className="text-[10px] bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 px-2 py-1 rounded-full font-medium"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        )}

        {/* Bottom Overlay Gradient Section */}
        <div className="bg-gradient-to-br from-teal-600 to-navy-600 rounded-xl p-3 text-white space-y-1.5">
          <div>
            <p className="font-bold text-sm">{profile.name.split(' ')[0]}</p>
            {profile.pronouns && (
              <p className="text-[10px] text-teal-100">{profile.pronouns}</p>
            )}
          </div>
          <p className="text-xs text-teal-50 italic line-clamp-2">"{quote}"</p>
        </div>

        {/* Social Links */}
        {(hasInstagram || hasSpotify) && (
          <div className="flex items-center gap-2 justify-center">
            {hasInstagram && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
            )}
            {hasSpotify && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Bonded Insights */}
        {sharedInsights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sharedInsights.slice(0, 2).map((insight, i) => (
              <span
                key={i}
                className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200"
              >
                {insight}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

