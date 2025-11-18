import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ScreenHeader } from '../shared/ScreenHeader';
import { ContentHeader } from '../shared/ContentHeader';
import { Button } from '../shared/Button';
import styles from './BasicProfileScreen.module.css';

const YEARS = [
  { value: 'freshman', label: '🎓 Freshman', emoji: '🎓' },
  { value: 'sophomore', label: '📚 Sophomore', emoji: '📚' },
  { value: 'junior', label: '💼 Junior', emoji: '💼' },
  { value: 'senior', label: '🎯 Senior', emoji: '🎯' },
  { value: 'grad', label: '🎓 Graduate Student', emoji: '🎓' },
  { value: 'alumni', label: '👔 Alumni', emoji: '👔' },
];

const MAJORS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Psychology',
  'Biology',
  'English',
  'Mathematics',
  'Chemistry',
  'Physics',
  'Economics',
  'Political Science',
  'Communications',
  'Art',
  'Music',
  'History',
  'Philosophy',
  'Sociology',
  'Nursing',
  'Education',
  'Marketing',
  'Finance',
  'Architecture',
  'Environmental Science',
  'Pre-Med',
  'Pre-Law',
  'Other',
];

interface BasicProfileScreenProps {
  onNext: () => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  profile: {
    fullName: string;
    age: number | null;
    year: string | null;
    major: string;
  };
  onProfileChange: (profile: any) => void;
}

export const BasicProfileScreen: React.FC<BasicProfileScreenProps> = ({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  profile,
  onProfileChange,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          newErrors.fullName = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.fullName = 'Name must be less than 50 characters';
        } else {
          delete newErrors.fullName;
        }
        break;
      
      case 'age':
        const ageNum = parseInt(value);
        if (!value || isNaN(ageNum)) {
          newErrors.age = 'Age is required';
        } else if (ageNum < 18) {
          newErrors.age = 'You must be at least 18 years old';
        } else if (ageNum > 100) {
          newErrors.age = 'Please enter a valid age';
        } else {
          delete newErrors.age;
        }
        break;
      
      case 'year':
        if (!value) {
          newErrors.year = 'Please select your year';
        } else {
          delete newErrors.year;
        }
        break;
      
      case 'major':
        if (!value) {
          newErrors.major = 'Please select your major';
        } else {
          delete newErrors.major;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (field: string, value: any) => {
    onProfileChange({ ...profile, [field]: value });
    validateField(field, value);
  };

  const isFieldValid = (field: string) => {
    return !errors[field] && profile[field as keyof typeof profile];
  };

  const canProceed = 
    profile.fullName.trim().length >= 2 &&
    profile.age && profile.age >= 18 &&
    profile.year &&
    profile.major &&
    Object.keys(errors).length === 0;

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
            stepLabel="ABOUT YOU"
            title="Tell us about yourself"
            description="We'll use this to personalize your experience"
          />

          {/* Full Name */}
          <div className={styles.field}>
            <label className={styles.label}>
              Full Name
              {isFieldValid('fullName') && (
                <Check className={styles.validIcon} size={16} />
              )}
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              placeholder="Enter your full name"
              value={profile.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={(e) => validateField('fullName', e.target.value)}
            />
            {errors.fullName && (
              <span className={styles.errorText}>{errors.fullName}</span>
            )}
          </div>

          {/* Age */}
          <div className={styles.field}>
            <label className={styles.label}>
              Age
              {isFieldValid('age') && (
                <Check className={styles.validIcon} size={16} />
              )}
            </label>
            <input
              type="number"
              className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
              placeholder="Enter your age"
              value={profile.age || ''}
              onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : null)}
              onBlur={(e) => validateField('age', e.target.value)}
              min="18"
              max="100"
            />
            {errors.age && (
              <span className={styles.errorText}>{errors.age}</span>
            )}
          </div>

          {/* Year */}
          <div className={styles.field}>
            <label className={styles.label}>
              Year
              {isFieldValid('year') && (
                <Check className={styles.validIcon} size={16} />
              )}
            </label>
            <div className={styles.chipGrid}>
              {YEARS.map((year, index) => (
                <motion.button
                  key={year.value}
                  className={`${styles.chip} ${profile.year === year.value ? styles.chipSelected : ''}`}
                  onClick={() => handleChange('year', year.value)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{year.label}</span>
                </motion.button>
              ))}
            </div>
            {errors.year && (
              <span className={styles.errorText}>{errors.year}</span>
            )}
          </div>

          {/* Major */}
          <div className={styles.field}>
            <label className={styles.label}>
              Major / Field of Study
              {isFieldValid('major') && (
                <Check className={styles.validIcon} size={16} />
              )}
            </label>
            <select
              className={`${styles.select} ${errors.major ? styles.inputError : ''}`}
              value={profile.major}
              onChange={(e) => handleChange('major', e.target.value)}
              onBlur={(e) => validateField('major', e.target.value)}
            >
              <option value="">Select your major...</option>
              {MAJORS.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
            {errors.major && (
              <span className={styles.errorText}>{errors.major}</span>
            )}
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
            Please fill in all required fields
          </p>
        )}
      </div>
    </div>
  );
};


