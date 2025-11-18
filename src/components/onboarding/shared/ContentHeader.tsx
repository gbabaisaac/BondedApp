import React from 'react';
import { motion } from 'framer-motion';
import styles from './ContentHeader.module.css';

interface ContentHeaderProps {
  stepLabel?: string;
  title: string;
  description?: string;
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  stepLabel,
  title,
  description,
}) => {
  return (
    <motion.div 
      className={styles.header}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {stepLabel && (
        <span className={styles.stepLabel}>{stepLabel}</span>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
    </motion.div>
  );
};


