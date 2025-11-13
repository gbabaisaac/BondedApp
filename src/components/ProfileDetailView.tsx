import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Heart, Share2, Send, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SoftIntroFlow } from './SoftIntroFlow';
import { projectId } from '../utils/supabase/config';
import { shareProfile } from '../utils/deep-linking';
import { ReportBlockModal } from './ReportBlockModal';
import './ProfileDetailView.css';

interface Profile {
  id: string;
  name: string;
  age: number;
  school: string;
  major: string;
  year: string;
  bio: string;
  interests?: string[];
  lookingFor?: string[];
  imageUrl?: string;
  profilePicture?: string;
  photos?: string[];
  personality?: string[];
  sleepSchedule?: string;
  cleanliness?: string;
  instagram?: string;
  snapchat?: string;
  spotify?: string;
  pronouns?: string;
  bondPrint?: any;
  socialConnections?: any;
  scrapbookEnabled?: boolean;
  roommateMode?: boolean;
  rating?: number;
  distance?: string;
}

interface ProfileDetailViewProps {
  profile: Profile;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  accessToken?: string;
  currentIndex?: number;
  totalProfiles?: number;
}

export function ProfileDetailView({ 
  profile, 
  onClose, 
  onNext, 
  onPrev, 
  hasNext, 
  hasPrev, 
  accessToken,
  currentIndex = 0,
  totalProfiles = 1,
}: ProfileDetailViewProps) {
  const [showSoftIntro, setShowSoftIntro] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReportBlock, setShowReportBlock] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);
  
  // Swipe detection state
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const swipeTarget = useRef<'carousel' | 'card' | null>(null);
  const [showSwipeHints, setShowSwipeHints] = useState(false);

  // Get photos array
  const photos = profile.photos || (profile.profilePicture ? [profile.profilePicture] : [profile.imageUrl || '']).filter(Boolean);
  const hasMultiplePhotos = photos.length > 1;

  // Reset states when profile changes
  useEffect(() => {
    setLiked(false);
    setCurrentPhotoIndex(0);
    loadCompatibility();
  }, [profile.id]);

  // Show swipe hints briefly on mount
  useEffect(() => {
    setShowSwipeHints(true);
    const timer = setTimeout(() => setShowSwipeHints(false), 2000);
    return () => clearTimeout(timer);
  }, [profile.id]);

  const loadCompatibility = async () => {
    if (!accessToken) return;
    setLoadingCompatibility(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/bond-print/compatibility/${profile.id}`,
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

  // Carousel swipe handlers
  const handleCarouselTouchStart = (e: React.TouchEvent) => {
    swipeTarget.current = 'carousel';
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleCarouselTouchEnd = (e: React.TouchEvent) => {
    if (swipeTarget.current !== 'carousel') return;
    
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Only handle horizontal swipes (not vertical scrolls)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        // Swipe left = next photo
        nextPhoto();
      } else {
        // Swipe right = previous photo
        prevPhoto();
      }
    }
    
    swipeTarget.current = null;
  };

  // Card swipe handlers (for profile navigation)
  const handleCardTouchStart = (e: React.TouchEvent) => {
    // Don't handle if touch started inside carousel
    const target = e.target as HTMLElement;
    if (carouselRef.current?.contains(target)) {
      return;
    }
    
    swipeTarget.current = 'card';
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (swipeTarget.current !== 'card') return;
    
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Higher threshold for profile navigation (80px vs 50px)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 80) {
      if (deltaX < 0) {
        // Swipe left = next profile
        if (hasNext) {
          showToast(`Viewing next profile`);
          onNext();
        } else {
          showToast('No more profiles! 🎉');
        }
      } else {
        // Swipe right = previous profile
        if (hasPrev) {
          showToast(`Viewing previous profile`);
          onPrev();
        }
      }
    }
    
    swipeTarget.current = null;
  };

  const nextPhoto = () => {
    if (hasMultiplePhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (hasMultiplePhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
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

  const showToast = (message: string) => {
    toast.success(message, {
      duration: 2000,
    });
  };

  // Get mode badges
  const getModeBadges = () => {
    const badges: Array<{ emoji: string; label: string; borderColor: string }> = [];
    
    if (profile.scrapbookEnabled) {
      badges.push({ emoji: '💕', label: 'Scrapbook', borderColor: 'rgba(236,72,153,0.5)' });
    }
    if (profile.roommateMode) {
      badges.push({ emoji: '🏠', label: 'Roommate', borderColor: 'rgba(168,85,247,0.5)' });
    }
    if (!profile.scrapbookEnabled && !profile.roommateMode) {
      badges.push({ emoji: '👋', label: 'Friend Mode', borderColor: 'rgba(59,130,246,0.5)' });
    }
    
    return badges;
  };

  const modeBadges = getModeBadges();
  const bondPrintMatch = compatibility?.score || 0;
  const rating = profile.rating || 4.5;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2841 50%, #0f4d5c 100%)',
        fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        height: '100dvh',
      }}
      onMouseEnter={() => setShowSwipeHints(true)}
      onMouseLeave={() => setShowSwipeHints(false)}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'rotate(90deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'rotate(0deg)';
        }}
        aria-label="Close profile view"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress Indicator */}
      {totalProfiles > 1 && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex gap-2"
        >
          {Array.from({ length: totalProfiles }).map((_, i) => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: i === currentIndex ? '4px' : '50%',
                background: i === currentIndex ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* Swipe Hints */}
      <AnimatePresence>
        {showSwipeHints && (
          <>
            {hasPrev && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute left-5 top-1/2 transform -translate-y-1/2 z-40 w-10 h-10 rounded-full flex items-center justify-center pointer-events-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
            )}
            {hasNext && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 z-40 w-10 h-10 rounded-full flex items-center justify-center pointer-events-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[420px] mx-4"
        onTouchStart={handleCardTouchStart}
        onTouchEnd={handleCardTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className="rounded-[28px] p-7 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Mode Badges */}
          <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
            {modeBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-xs font-semibold text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${badge.borderColor}`,
                }}
              >
                <span>{badge.emoji}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Rating Badge */}
          <div
            className="absolute top-5 right-5 z-10 flex items-center gap-1 px-3.5 py-2 rounded-2xl text-sm font-bold text-white"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span>{rating.toFixed(1)}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>

          {/* Photo Carousel - PRIMARY SWIPE ZONE */}
          <div
            ref={carouselRef}
            className="relative w-full rounded-[20px] overflow-hidden mb-6"
            style={{
              height: '380px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            }}
            onTouchStart={handleCarouselTouchStart}
            onTouchEnd={handleCarouselTouchEnd}
            onMouseEnter={(e) => {
              const navButtons = e.currentTarget.querySelectorAll('.carousel-nav');
              navButtons.forEach((btn) => {
                (btn as HTMLElement).style.opacity = '1';
              });
            }}
            onMouseLeave={(e) => {
              const navButtons = e.currentTarget.querySelectorAll('.carousel-nav');
              navButtons.forEach((btn) => {
                (btn as HTMLElement).style.opacity = '0';
              });
            }}
          >
            {/* Carousel Inner */}
            <div
              className="flex w-full h-full transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: `translateX(-${currentPhotoIndex * 100}%)`,
                willChange: 'transform',
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="min-w-full h-full flex-shrink-0 flex items-center justify-center"
                >
                  <img
                    src={photo}
                    alt={`${profile.name} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Carousel Navigation Arrows */}
            {hasMultiplePhotos && (
              <>
                <button
                  onClick={prevPhoto}
                  className="carousel-nav absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer z-5"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                  }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="carousel-nav absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer z-5"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                  }}
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Carousel Dots */}
            {hasMultiplePhotos && (
              <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-5"
              >
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      width: index === currentPhotoIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: index === currentPhotoIndex ? '4px' : '50%',
                      background: index === currentPhotoIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                    }}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="text-white space-y-5">
            {/* Name Section */}
            <div>
              <div className="flex items-baseline gap-2.5 mb-1">
                <h2
                  className="text-[28px] font-extrabold"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #a0d8ef 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {profile.name}
                </h2>
                <span className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {profile.age}
                </span>
              </div>
              {profile.pronouns && (
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {profile.pronouns}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span>📍</span>
              <span>{profile.distance || '2.4'} miles away • {profile.year}</span>
            </div>

            {/* Bio */}
            <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {profile.bio || 'No bio available.'}
            </p>

            {/* Personality Tags */}
            {profile.personality && profile.personality.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  PERSONALITY
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.personality.map((trait) => (
                    <span
                      key={trait}
                      className="px-3.5 py-2 rounded-[20px] text-[13px] font-semibold transition-transform duration-300 cursor-default"
                      style={{
                        background: 'rgba(59,130,246,0.2)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59,130,246,0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests Tags */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  INTERESTS
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3.5 py-2 rounded-[20px] text-[13px] font-semibold transition-transform duration-300 cursor-default"
                      style={{
                        background: 'rgba(16,185,129,0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vibes Tags (from Bond Print) */}
            {profile.bondPrint?.traits && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  VIBES
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Chill', 'Ambitious', 'Funny', 'Deep', 'Creative', 'Adventurous']
                    .filter((vibe) => profile.bondPrint?.traits[vibe.toLowerCase()])
                    .map((vibe) => (
                      <span
                        key={vibe}
                        className="px-3.5 py-2 rounded-[20px] text-[13px] font-semibold transition-transform duration-300 cursor-default"
                        style={{
                          background: 'rgba(168,85,247,0.2)',
                          color: '#c084fc',
                          border: '1px solid rgba(168,85,247,0.3)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {vibe}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  MAJOR
                </div>
                <div className="text-sm font-semibold text-white">{profile.major || 'Not specified'}</div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  BOND PRINT
                </div>
                <div className="text-sm font-semibold text-white">{bondPrintMatch}% Match</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              {/* Icon Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer text-xl"
                  style={{
                    background: liked ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${liked ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.2)'}`,
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (!liked) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    }
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!liked) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseUp={(e) => {
                    setTimeout(() => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }, 200);
                  }}
                  aria-label="Like profile"
                >
                  💚
                </button>
                <button
                  onClick={() => {
                    shareProfile(profile.id, profile.name);
                    showToast('Profile link copied! 🔗');
                  }}
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer text-xl"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="Share profile"
                >
                  📤
                </button>
              </div>

              {/* Primary CTA Button */}
              <button
                onClick={() => {
                  if (!accessToken) {
                    toast.error('Please log in to send a soft intro');
                    return;
                  }
                  setShowSoftIntro(true);
                }}
                className="flex-1 h-[52px] rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all duration-300 cursor-pointer text-white"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(16,185,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.3)';
                }}
                aria-label={`Send intro to ${profile.name}`}
              >
                <Send className="w-5 h-5" />
                <span>Send Intro</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Soft Intro Flow */}
      {showSoftIntro && (
        <SoftIntroFlow 
          profile={profile}
          onClose={() => setShowSoftIntro(false)}
          accessToken={accessToken}
        />
      )}
      
      {/* Report/Block Modal */}
      {accessToken && (
        <ReportBlockModal
          userId={profile.id}
          userName={profile.name}
          accessToken={accessToken}
          open={showReportBlock}
          onClose={() => setShowReportBlock(false)}
          onBlock={() => {
            toast.success('User blocked. They will no longer appear in your feed.');
            onClose();
          }}
        />
      )}
    </div>
  );
}
