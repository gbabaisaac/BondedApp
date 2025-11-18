/**
 * Modern Onboarding Flow
 * 
 * This is the new modernized onboarding experience with:
 * - Light, vibrant design system
 * - Smooth animations
 * - 6 streamlined steps
 * - Mobile-first approach
 * 
 * To use: Import and replace OnboardingWizard in your app
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SchoolSelectionScreen } from './screens/SchoolSelectionScreen';
import { BasicProfileScreen } from './screens/BasicProfileScreen';
import { PhotoUploadScreen } from './screens/PhotoUploadScreen';
import { InterestsPersonalityScreen } from './screens/InterestsPersonalityScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import '../../styles/onboarding-global.css';

interface OnboardingFlowModernProps {
  userEmail?: string;
  userName?: string;
  userSchool?: string;
  onComplete: (profile: any) => void;
}

export const OnboardingFlowModern: React.FC<OnboardingFlowModernProps> = ({
  userName,
  onComplete,
}) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    school,
    profile,
    photos,
    interests,
    personality,
    goals,
    setSchool,
    setProfile,
    addPhoto,
    removePhoto,
    reorderPhotos,
    toggleInterest,
    togglePersonality,
    setGoals,
    canProceed,
    resetOnboarding,
  } = useOnboardingStore();

  // Track step changes
  useEffect(() => {
    console.log('📍 Current Step Changed:', currentStep);
  }, [currentStep]);

  // Prevent accidental navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 0 && currentStep < 6) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep]);

  const handleNext = () => {
    console.log('🚀 handleNext called, currentStep:', currentStep);
    if (canProceed() || currentStep === 0) {
      console.log('✅ Proceeding to next step');
      nextStep();
    } else {
      console.log('❌ Cannot proceed, validation failed');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const handleComplete = () => {
    console.log('🎊 handleComplete called - Creating profile and logging in...');
    // Compile profile data
    const completeProfile = {
      school,
      ...profile,
      photos,
      interests,
      personality,
      goals,
    };
    
    console.log('📦 Complete profile data:', completeProfile);
    onComplete(completeProfile);
    resetOnboarding();
  };

  const renderScreen = () => {
    const totalSteps = 6;
    
    console.log('🎬 Rendering screen for step:', currentStep);

    switch (currentStep) {
      case 0:
        console.log('✅ Rendering WelcomeScreen');
        return <WelcomeScreen onNext={handleNext} />;
      
      case 1:
        console.log('✅ Rendering SchoolSelectionScreen');
        return (
          <SchoolSelectionScreen
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
            selectedSchool={school}
            onSchoolSelect={setSchool}
          />
        );
      
      case 2:
        console.log('✅ Rendering BasicProfileScreen');
        return (
          <BasicProfileScreen
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
            profile={profile}
            onProfileChange={setProfile}
          />
        );
      
      case 3:
        console.log('✅ Rendering PhotoUploadScreen');
        return (
          <PhotoUploadScreen
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
            photos={photos}
            onPhotosChange={reorderPhotos}
          />
        );
      
      case 4:
        console.log('✅ Rendering InterestsPersonalityScreen');
        return (
          <InterestsPersonalityScreen
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
            interests={interests}
            personality={personality}
            onInterestToggle={toggleInterest}
            onPersonalityToggle={togglePersonality}
          />
        );
      
      case 5:
        console.log('✅ Rendering GoalsScreen');
        return (
          <GoalsScreen
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
            goals={goals.makeConnect}
            careerGoal={goals.careerGoal}
            onGoalToggle={(goal) => {
              const newGoals = goals.makeConnect.includes(goal)
                ? goals.makeConnect.filter(g => g !== goal)
                : [...goals.makeConnect, goal];
              setGoals({ makeConnect: newGoals });
            }}
            onCareerGoalChange={(goal) => setGoals({ careerGoal: goal })}
          />
        );
      
      case 6:
        console.log('✅ Rendering SuccessScreen');
        return (
          <SuccessScreen 
            onComplete={handleComplete}
            userName={userName || profile.fullName}
          />
        );
      
      default:
        console.log('⚠️ Unknown step, rendering WelcomeScreen');
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <div 
      className="onboarding-container" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="onboarding-screen-wrapper"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

