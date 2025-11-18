import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ScreenHeader } from '../shared/ScreenHeader';
import { ContentHeader } from '../shared/ContentHeader';
import { Button } from '../shared/Button';
import styles from './InterestsPersonalityScreen.module.css';

interface InterestsPersonalityScreenProps {
  onNext: () => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  interests: string[];
  personality: string[];
  onInterestToggle: (interest: string) => void;
  onPersonalityToggle: (trait: string) => void;
}

const INTERESTS = [
  '🎨 Art', '📚 Reading', '🎮 Gaming', '🎵 Music', '✈️ Travel', 
  '💪 Fitness', '🍳 Cooking', '📸 Photography', '🎬 Movies', '⚽ Sports',
  '🎭 Theater', '💻 Tech', '🌱 Sustainability', '🧘 Yoga', '🎉 Events',
  '✍️ Writing', '🎸 Playing Music', '🏕️ Outdoors', '🎨 Crafts', '🍕 Food',
  '🐕 Pets', '🎤 Karaoke', '🏊 Swimming', '🚴 Cycling', '🧗 Climbing',
  '📺 TV Shows', '🎲 Board Games', '☕ Coffee', '🍷 Wine', '🍜 Trying New Foods'
];

const PERSONALITY_TRAITS = [
  '😊 Outgoing', '🤔 Introverted', '🎨 Creative', '🧠 Analytical', '❤️ Empathetic',
  '🚀 Ambitious', '😌 Chill', '📋 Organized', '🎲 Spontaneous', '🏔️ Adventurous',
  '💭 Thoughtful', '😄 Humorous', '🔥 Driven', '🌊 Laid-back', '🔍 Curious',
  '🤗 Compassionate', '💪 Independent', '🤝 Team Player', '👑 Leader', '🫂 Supportive'
];

export const InterestsPersonalityScreen: React.FC<InterestsPersonalityScreenProps> = ({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  interests,
  personality,
  onInterestToggle,
  onPersonalityToggle,
}) => {
  const canProceed = interests.length >= 3 && personality.length >= 3;
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Debug scroll
  React.useEffect(() => {
    const el = contentRef.current;
    if (el) {
      console.log('🔍 Content scroll height:', el.scrollHeight);
      console.log('🔍 Content client height:', el.clientHeight);
      console.log('🔍 Can scroll:', el.scrollHeight > el.clientHeight);
      console.log('🔍 Overflow Y style:', window.getComputedStyle(el).overflowY);
    }
  }, []);

  return (
    <div 
      className={styles.container} 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ScreenHeader 
        onBack={onBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <div 
        ref={contentRef}
        className={styles.content}
        style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          bottom: '120px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          padding: '24px 20px',
        }}
        onTouchStart={(e) => {
          console.log('👆 Touch started');
          e.stopPropagation();
        }}
        onScroll={(e) => console.log('📜 Scrolling:', e.currentTarget.scrollTop)}
      >
        {/* Interests Section */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ContentHeader
            stepLabel="INTERESTS"
            title="What do you love?"
            description="Select at least 3 interests (up to 10)"
          />
          
          <div className={styles.counter}>
            <span className={styles.counterText}>
              {interests.length} / 10 selected
            </span>
          </div>

          <div className={styles.chipGrid}>
            {INTERESTS.map((interest, index) => (
              <motion.button
                key={interest}
                className={`${styles.chip} ${interests.includes(interest) ? styles.chipSelected : ''}`}
                onClick={() => onInterestToggle(interest)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{interest}</span>
                {interests.includes(interest) && (
                  <Check className={styles.checkIcon} size={16} />
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Scroll indicator */}
          {personality.length < 3 && (
            <div className={styles.scrollIndicator}>
              ⬇️ Scroll down for Personality section
            </div>
          )}
        </motion.div>

        {/* Personality Section */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ContentHeader
            stepLabel="PERSONALITY"
            title="How would you describe yourself?"
            description="Select at least 3 traits (up to 8)"
          />

          <div className={styles.counter}>
            <span className={styles.counterText}>
              {personality.length} / 8 selected
            </span>
          </div>

          <div className={styles.chipGrid}>
            {PERSONALITY_TRAITS.map((trait, index) => (
              <motion.button
                key={trait}
                className={`${styles.chip} ${personality.includes(trait) ? styles.chipSelected : ''}`}
                onClick={() => onPersonalityToggle(trait)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{trait}</span>
                {personality.includes(trait) && (
                  <Check className={styles.checkIcon} size={16} />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={onNext}
          disabled={!canProceed}
        >
          Continue
        </Button>
        {!canProceed && (
          <p className={styles.helperText}>
            Select at least 3 from each category to continue
          </p>
        )}
      </div>
    </div>
  );
};

