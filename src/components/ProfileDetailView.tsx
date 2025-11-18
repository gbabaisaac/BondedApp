import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Heart, Sparkles, Instagram, Send, Share2, MoreVertical, Users, Camera, CheckCircle2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
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
      onClick={onClose}
    >
      {/* Profile Card - UNIFIED LIGHT DESIGN */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden"
        style={{
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close Button - UNIFIED */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--shadow-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Swipe Indicator - UNIFIED */}
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p 
            className="text-xs font-medium"
            style={{
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Swipe to see more profiles
          </p>
        </div>

        {/* Upper Section - Profile Image */}
        <div 
          className="relative w-full h-80 overflow-hidden"
          style={{ background: 'var(--gradient-accent)' }}
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
          
          {/* Navigation Arrows - UNIFIED */}
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-md)',
                color: 'var(--color-text-primary)',
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-md)',
                color: 'var(--color-text-primary)',
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Lower Section - UNIFIED WHITE BACKGROUND */}
        <div 
          className="bg-white p-5 space-y-4"
          style={{ padding: 'var(--space-6)' }}
        >
          {/* Name with Verified Badge */}
          <div className="flex items-center gap-2">
            <h2 
              className="text-xl font-bold"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {profile.name}, {profile.age}
            </h2>
            {compatibility && compatibility.score >= 70 && (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-success)' }}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p 
              className="text-sm leading-relaxed line-clamp-3"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {profile.bio}
            </p>
          )}
          {!profile.bio && (
            <p 
              className="text-sm"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-caption)',
              }}
            >
              {profile.major} {profile.year && `• ${profile.year}`}
            </p>
          )}

          {/* Interests Pills */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.interests.slice(0, 4).map((interest, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    background: 'var(--color-primary-bg)',
                    color: 'var(--color-primary)',
                    borderRadius: 'var(--pill-radius)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Connect Button - UNIFIED */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!accessToken) {
                toast.error('Please log in to connect');
                return;
              }
              setShowSoftIntro(true);
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-full text-sm font-medium transition-all"
            style={{
              background: 'var(--gradient-accent)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-bold)',
              height: 'var(--button-height-sm)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Plus className="w-4 h-4" />
            Connect
          </button>
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
