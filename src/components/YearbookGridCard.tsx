import { motion } from 'motion/react';

interface YearbookGridCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    pronouns?: string;
    year?: string;
    profilePicture?: string;
    photos?: string[];
    interests?: string[];
    personality?: string[];
    bondPrint?: any;
    scrapbookEnabled?: boolean;
    roommateMode?: boolean;
  };
  onClick: () => void;
}

export function YearbookGridCard({ profile, onClick }: YearbookGridCardProps) {
  const photos = profile.photos || (profile.profilePicture ? [profile.profilePicture] : []);
  const photoCount = photos.length || 1;

  // Get mode badge
  const getModeBadge = () => {
    if (profile.scrapbookEnabled) {
      return { emoji: '💕', label: 'Scrapbook' };
    }
    if (profile.roommateMode) {
      return { emoji: '🏠', label: 'Roommate' };
    }
    return { emoji: '👋', label: 'Friend' };
  };

  const modeBadge = getModeBadge();

  // Get tags (personality, interests, vibes)
  const personalityTags = profile.personality?.slice(0, 1) || [];
  const interestTags = profile.interests?.slice(0, 1) || [];
  const vibeTags = profile.bondPrint?.traits 
    ? ['Chill', 'Ambitious', 'Funny', 'Deep', 'Creative', 'Adventurous']
        .filter((vibe) => profile.bondPrint.traits[vibe.toLowerCase()])
        .slice(0, 1)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white/5 backdrop-blur-[20px] rounded-[20px] border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:border-white/15"
      onClick={onClick}
    >
      {/* Photo Section */}
      <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-teal-500/20 to-blue-500/20 overflow-hidden flex items-center justify-center">
        {/* Mode Badge */}
        <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-[10px] px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold text-white flex items-center gap-1 border border-white/20">
          <span>{modeBadge.emoji}</span>
          <span>{modeBadge.label}</span>
        </div>

        {/* Photo Count */}
        {photoCount > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-[10px] px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-white border border-white/20">
            {1}/{photoCount}
          </div>
        )}

        {/* Photo */}
        {photos.length > 0 && photos[0] ? (
          <img
            src={photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">👤</div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 text-white">
        {/* Name and Age */}
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-xl font-extrabold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
            {profile.name}
          </h3>
          <span className="text-lg font-bold text-white/60">{profile.age}</span>
        </div>

        {/* Pronouns and Year */}
        <p className="text-xs text-white/50 mb-2.5">
          {profile.pronouns || 'they/them'} {profile.year && `• ${profile.year}`}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {personalityTags.map((tag, i) => (
            <span
              key={`personality-${i}`}
              className="px-2.5 py-1 rounded-[14px] text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              {tag}
            </span>
          ))}
          {interestTags.map((tag, i) => (
            <span
              key={`interest-${i}`}
              className="px-2.5 py-1 rounded-[14px] text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30"
            >
              {tag}
            </span>
          ))}
          {vibeTags.map((tag, i) => (
            <span
              key={`vibe-${i}`}
              className="px-2.5 py-1 rounded-[14px] text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

