import React from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ].filter(Boolean).join(' ');

  const { onAnimationStart, onDragStart, onDrag, onDragEnd, ...restProps } = props;
  
  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...restProps}
    >
      {loading && (
        <span className={styles.spinner}>
          <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
            <circle 
              className={styles.spinnerCircle}
              cx="12" 
              cy="12" 
              r="10" 
              fill="none" 
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </motion.button>
  );
};


