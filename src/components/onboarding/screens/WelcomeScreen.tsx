import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../shared/Button';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNext,
  onSkip,
}) => {
  // Mock data - replace with actual data
  const studentCount = '2.8k';
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  ];

  return (
    <div className={styles.container}>
      {onSkip && (
        <motion.button 
          className={styles.skipButton}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSkip}
        >
          Skip
        </motion.button>
      )}

      <div className={styles.content}>
        {/* Illustration Container */}
        <div className={styles.illustrationContainer}>
          <motion.div 
            className={styles.accentBlob1}
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 3, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div 
            className={styles.accentBlob2}
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{ 
              duration: 3,
              delay: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Placeholder illustration - replace with actual SVG */}
          <motion.div 
            className={styles.illustration}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              type: 'spring',
              stiffness: 100,
            }}
          >
            <div className={styles.illustrationPlaceholder}>
              <span className={styles.emoji}>🎓</span>
              <span className={styles.emoji}>💙</span>
              <span className={styles.emoji}>✨</span>
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div 
          className={styles.textContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className={styles.title}>
            Find Your People at Campus
          </h1>
          <p className={styles.subtitle}>
            Connect with students, make friends, and discover your college community
          </p>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          className={styles.socialProof}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.avatarStack}>
            {avatars.map((avatar, index) => (
              <motion.img
                key={index}
                src={avatar}
                alt=""
                className={styles.avatar}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              />
            ))}
            <span className={styles.avatarCount}>+{studentCount}</span>
          </div>
          <p className={styles.socialProofText}>students already connected</p>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div 
        className={styles.bottomCta}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          Get Started
        </Button>
        <p className={styles.termsText}>
          By continuing, you agree to our{' '}
          <a href="/terms" target="_blank">Terms</a> &{' '}
          <a href="/privacy" target="_blank">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
};


