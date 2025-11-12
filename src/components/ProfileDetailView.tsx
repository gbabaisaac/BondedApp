import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Heart, Sparkles, Instagram, Send, Share2, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { SoftIntroFlow } from './SoftIntroFlow';
import { projectId } from '../utils/supabase/config';
import { theme } from '../utils/theme';
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
  const [showReportBlock, setShowReportBlock] = useState(false);
  
  // Debug: Ensure buttons are rendered (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('ProfileDetailView: Buttons should be visible at bottom');
    }
    // Force a re-render check after a short delay
    setTimeout(() => {
      const buttonElement = document.querySelector('[data-action-buttons]');
      if (buttonElement) {
        console.log('✅ Action buttons element found in DOM');
        const styles = window.getComputedStyle(buttonElement);
        console.log('Button position:', styles.position);
        console.log('Button bottom:', styles.bottom);
        console.log('Button zIndex:', styles.zIndex);
        console.log('Button display:', styles.display);
        console.log('Button visibility:', styles.visibility);
      } else {
        console.error('❌ Action buttons element NOT found in DOM!');
      }
    }, 100);
  }, []);
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
      className="fixed inset-0 bg-white z-[9999] flex flex-col"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className={`${theme.components.navigation.header} px-4 py-4 flex items-center justify-between flex-shrink-0`}>
        <button onClick={onClose} className={`p-2 -ml-2 hover:bg-gray-100 rounded-full ${theme.transition.default}`}>
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <h3 className="font-semibold text-lg">{profile.name}, {profile.age}</h3>
          <p className="text-sm text-[#64748b]">{profile.school}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              shareProfile(profile.id, profile.name);
              toast.success('Profile link copied!');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Share profile"
          >
            <Share2 className="w-5 h-5 text-[#2E7B91]" />
          </button>
          {accessToken && (
            <button
              onClick={() => setShowReportBlock(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-[#2E7B91]" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))', // Extra space for fixed buttons
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
            <p className="text-[#475569]">{profile.major} • {profile.year}</p>
            <p className="text-sm text-[#64748b]">{profile.school}</p>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-sm text-[#64748b] mb-2 font-medium">About</h3>
            <p className="text-[#1E4F74]">{profile.bio}</p>
          </div>

          {/* Compatibility Analysis */}
          {compatibility && (
            <div className="bg-gradient-to-br from-[#2E7B9115] to-[#25658A15] rounded-2xl p-4 border border-[#2E7B9140]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#2E7B91]" />
                <h3 className="font-medium text-[#1E4F74]">Compatibility</h3>
              </div>
              <div className="space-y-3">
                {compatibility.score && (
                  <div>
                    <p className="text-sm font-medium text-[#25658A]">
                      {compatibility.score}% Match
                    </p>
                  </div>
                )}
                {compatibility.commonInterests && compatibility.commonInterests.length > 0 && (
                  <div>
                    <p className="text-xs text-[#64748b] mb-1">You both enjoy:</p>
                    <div className="flex flex-wrap gap-1">
                      {compatibility.commonInterests.map((interest: string) => (
                        <Badge key={interest} className="text-xs bg-[#2E7B9120] text-[#1E4F74]">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {compatibility.analysis && (
                  <p className="text-sm text-[#1E4F74]">
                    {compatibility.analysis}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Looking For */}
          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <div>
              <h3 className="text-sm text-[#64748b] mb-2 font-medium">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {profile.lookingFor.map((item) => {
                  // Convert normalized format (study-partner) to display format (Study Partner)
                  const displayText = item.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  return (
                    <Badge key={item} className="bg-[#2E7B9120] text-[#1E4F74] whitespace-nowrap">
                      {displayText}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-sm text-[#64748b] mb-2 font-medium">Interests</h3>
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
              <h3 className="text-sm text-[#64748b] mb-2 font-medium">Personality</h3>
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
              <h3 className="text-sm text-[#64748b] mb-2 font-medium">Living Habits</h3>
              <div className="space-y-1 text-sm">
                {profile.sleepSchedule && (
                  <p>
                    <span className="text-[#64748b]">Sleep Schedule:</span>{' '}
                    <span className="capitalize">{profile.sleepSchedule}</span>
                  </p>
                )}
                {profile.cleanliness && (
                  <p>
                    <span className="text-[#64748b]">Cleanliness:</span>{' '}
                    <span className="capitalize">{profile.cleanliness}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {(profile.instagram || profile.snapchat) && (
            <div>
              <h3 className="text-sm text-[#64748b] mb-2 font-medium">Social Media</h3>
              <div className="space-y-2">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#2E7B91] hover:text-[#25658A] hover:underline"
                  >
                    <Instagram className="w-4 h-4" />
                    {profile.instagram}
                  </a>
                )}
                {profile.snapchat && (
                  <p className="text-sm">
                    <span className="text-[#64748b]">Snapchat:</span> {profile.snapchat}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom - Always visible - Rendered via Portal for Safari */}
      {typeof document !== 'undefined' && createPortal(
        <div
          data-action-buttons
          className="bg-white border-t-2 border-[#EAEAEA] px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: '1rem',
            paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
            minHeight: '80px',
            width: '100vw',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            zIndex: 99999,
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            willChange: 'transform',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            WebkitBackfaceVisibility: 'visible',
            backfaceVisibility: 'visible',
          }}
        >
          <div className="flex gap-3 max-w-2xl mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLike}
              className={`flex-1 gap-2 font-semibold h-12 text-base rounded-2xl ${
                liked ? 'bg-red-50 border-2 border-red-400 text-red-600 hover:bg-red-100' : 'border-2 hover:border-gray-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-600' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </Button>
            <button
              data-soft-intro-button
              onClick={() => {
                if (!accessToken) {
                  toast.error('Please log in to send a soft intro');
                  return;
                }
                setShowSoftIntro(true);
              }}
              aria-label={`Send soft intro to ${profile.name}`}
              className="flex-1 gap-2 font-semibold h-12 shadow-lg text-base rounded-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2E7B91]"
              style={{ 
                color: '#ffffff',
                backgroundColor: '#2E7B91',
                background: 'linear-gradient(to right, #2E7B91, #25658A)',
                backgroundImage: 'linear-gradient(to right, #2E7B91, #25658A)',
                border: 'none',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff' }} aria-hidden="true" />
              <span style={{ color: '#ffffff', fontWeight: 600 }}>Soft Intro</span>
            </button>
          </div>
        </div>,
        document.body
      )}

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
