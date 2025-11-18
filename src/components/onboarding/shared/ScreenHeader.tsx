import React from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from './ProgressIndicator';
import styles from './ScreenHeader.module.css';

interface ScreenHeaderProps {
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onBack,
  currentStep,
  totalSteps,
  showProgress = true,
}) => {
  return (
    <motion.div 
      className={styles.header}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {onBack && (
        <button className={styles.backButton} onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      
      {showProgress && (
        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
      )}
    </motion.div>
  );
};


