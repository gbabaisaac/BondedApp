import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../shared/Button';
import styles from './SuccessScreen.module.css';

interface SuccessScreenProps {
  onComplete: () => void;
  userName?: string;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onComplete,
  userName = 'there',
}) => {
  React.useEffect(() => {
    console.log('✅ SuccessScreen mounted');
    console.log('✅ onComplete function:', typeof onComplete);
    console.log('✅ userName:', userName);
  }, [onComplete, userName]);

  const handleClick = () => {
    console.log('🚀 Start Exploring button clicked!');
    console.log('🚀 Calling onComplete()...');
    try {
      onComplete();
      console.log('✅ onComplete() called successfully');
    } catch (error) {
      console.error('❌ Error calling onComplete:', error);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {/* Success Animation */}
        <motion.div
          className={styles.celebrationContainer}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className={styles.confettiEmoji}>🎉</div>
          <div className={styles.confettiEmoji}>✨</div>
          <div className={styles.confettiEmoji}>🎊</div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className={styles.textContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className={styles.title}>You're all set!</h1>
          <p className={styles.description}>
            Welcome to the community, {userName}. Your profile is ready and you're about to discover amazing people on campus.
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div
          className={styles.featuresList}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.featureItem}>
            <span className={styles.featureEmoji}>💙</span>
            <p className={styles.featureText}>Connect with students who share your interests</p>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureEmoji}>🎯</span>
            <p className={styles.featureText}>Get personalized matches based on your goals</p>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureEmoji}>✨</span>
            <p className={styles.featureText}>Build meaningful friendships that last</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className={styles.bottomCta}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={handleClick}
          style={{
            pointerEvents: 'auto',
            touchAction: 'auto',
          }}
        >
          Start Exploring
        </Button>
      </motion.div>
    </div>
  );
};


