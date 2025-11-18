import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ScreenHeader } from '../shared/ScreenHeader';
import { ContentHeader } from '../shared/ContentHeader';
import { Button } from '../shared/Button';
import styles from './GoalsScreen.module.css';

interface GoalsScreenProps {
  onNext: () => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  goals: string[];
  careerGoal: string;
  onGoalToggle: (goal: string) => void;
  onCareerGoalChange: (goal: string) => void;
}

const GOAL_OPTIONS = [
  { id: 'friends', emoji: '🎉', title: 'Make friends & hang out', description: 'Meet new people and build friendships' },
  { id: 'roommate', emoji: '🏠', title: 'Find roommates', description: 'Discover compatible living partners' },
  { id: 'study', emoji: '📚', title: 'Study buddies & collabs', description: 'Form study groups and work together' },
  { id: 'dating', emoji: '❤️', title: 'Maybe something more', description: 'Open to dating and relationships' },
  { id: 'network', emoji: '🌐', title: 'Network professionally', description: 'Connect with future colleagues' },
  { id: 'gaming', emoji: '🎮', title: 'Find gaming partners', description: 'Team up for multiplayer games' },
  { id: 'events', emoji: '🎵', title: 'Discover event buddies', description: 'Attend concerts, parties, and events' },
];

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  goals,
  careerGoal,
  onGoalToggle,
  onCareerGoalChange,
}) => {
  const canProceed = goals.length >= 1;

  // Debug logging
  React.useEffect(() => {
    console.log('🎯 Goals Screen Debug:');
    console.log('  - Selected goals:', goals);
    console.log('  - Goals count:', goals.length);
    console.log('  - Can proceed:', canProceed);
  }, [goals, canProceed]);

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
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ContentHeader
            stepLabel="YOUR GOALS"
            title="What brings you here?"
            description="Select at least one goal to help us match you with the right people"
          />

          <div className={styles.goalGrid}>
            {GOAL_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                className={`${styles.goalCard} ${goals.includes(option.id) ? styles.goalCardSelected : ''}`}
                onClick={() => onGoalToggle(option.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.goalCardHeader}>
                  <span className={styles.goalEmoji}>{option.emoji}</span>
                  {goals.includes(option.id) && (
                    <div className={styles.checkBadge}>
                      <Check size={16} />
                    </div>
                  )}
                </div>
                <h3 className={styles.goalTitle}>{option.title}</h3>
                <p className={styles.goalDescription}>{option.description}</p>
              </motion.button>
            ))}
          </div>

          {/* Optional Career Goal */}
          <motion.div
            className={styles.careerSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={styles.careerLabel}>
              Career Goal <span className={styles.optional}>(Optional)</span>
            </h3>
            <input
              type="text"
              className={styles.careerInput}
              placeholder="e.g., Software Engineer at Google, Medical School"
              value={careerGoal}
              onChange={(e) => onCareerGoalChange(e.target.value)}
              maxLength={100}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={() => {
            console.log('🔘 Continue button clicked!');
            console.log('  - Can proceed:', canProceed);
            console.log('  - Calling onNext()');
            onNext();
          }}
          disabled={!canProceed}
        >
          Continue
        </Button>
        {!canProceed && (
          <p className={styles.helperText}>
            Select at least one goal to continue
          </p>
        )}
      </div>
    </div>
  );
};


