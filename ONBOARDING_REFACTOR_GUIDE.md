# Onboarding Refactor Implementation Guide

## 🎨 Overview

This guide explains the new modern onboarding system that's been created for the Bonded app. The refactor introduces:

- **Modern Design System**: Light, vibrant color palette with gradients
- **Smooth Animations**: Framer Motion animations throughout
- **Streamlined Flow**: 6 steps instead of 10
- **Mobile-First**: Optimized for mobile with PWA support
- **State Management**: Zustand for lightweight, performant state
- **Modular Components**: Reusable UI components

## 📁 File Structure

```
src/
├── styles/
│   ├── tokens.css                     # Design tokens (colors, spacing, etc.)
│   ├── animations.css                 # Animation keyframes and utilities
│   └── onboarding-global.css          # Onboarding-specific global styles
├── stores/
│   └── onboardingStore.ts             # Zustand store for onboarding state
└── components/
    └── onboarding/
        ├── OnboardingFlowModern.tsx   # Main container component
        ├── shared/
        │   ├── Button.tsx             # Primary button component
        │   ├── ProgressIndicator.tsx  # Step progress bar
        │   ├── ScreenHeader.tsx       # Header with back button & progress
        │   └── ContentHeader.tsx      # Title, subtitle, label
        └── screens/
            ├── WelcomeScreen.tsx      # Step 0: Welcome
            ├── InterestsPersonalityScreen.tsx  # Step 4: Interests & Personality
            ├── GoalsScreen.tsx        # Step 5: Goals
            └── SuccessScreen.tsx      # Step 6: Completion
```

## 🚀 Quick Start

### Option 1: Use the New Onboarding Flow (Recommended)

Replace your existing onboarding with the new modern version:

```tsx
// In your main app component (e.g., MainApp.tsx or AuthFlow.tsx)

import { OnboardingFlowModern } from './components/onboarding/OnboardingFlowModern';

function App() {
  const handleOnboardingComplete = (profile) => {
    console.log('Profile completed:', profile);
    // Save to database, navigate to main app, etc.
  };

  return (
    <OnboardingFlowModern
      userName="John Doe"
      onComplete={handleOnboardingComplete}
    />
  );
}
```

### Option 2: Gradual Migration

Keep both onboarding flows and switch based on a feature flag:

```tsx
const useModernOnboarding = true; // Or from feature flag service

{useModernOnboarding ? (
  <OnboardingFlowModern onComplete={handleComplete} />
) : (
  <OnboardingWizard onComplete={handleComplete} />
)}
```

## 🎨 Design System Usage

### Using Design Tokens in Your Components

The design tokens are available as CSS variables:

```css
.myComponent {
  /* Colors */
  background: var(--primary-coral);
  color: var(--text-primary);
  
  /* Spacing */
  padding: var(--space-4);
  gap: var(--space-2);
  
  /* Typography */
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  
  /* Borders */
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  
  /* Shadows */
  box-shadow: var(--shadow-md);
  
  /* Transitions */
  transition: all var(--transition-base);
}
```

### Using Shared Components

```tsx
import { Button } from './components/onboarding/shared/Button';
import { ContentHeader } from './components/onboarding/shared/ContentHeader';

function MyScreen() {
  return (
    <>
      <ContentHeader
        stepLabel="STEP 1"
        title="Welcome!"
        description="Let's get started"
      />
      
      <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
        Continue
      </Button>
    </>
  );
}
```

## 📝 Creating New Screens

To add a new screen to the onboarding flow:

1. Create screen component in `src/components/onboarding/screens/`
2. Create corresponding CSS module
3. Add to `OnboardingFlowModern.tsx` switch statement

Example:

```tsx
// NewScreen.tsx
import { ScreenHeader } from '../shared/ScreenHeader';
import { ContentHeader } from '../shared/ContentHeader';
import { Button } from '../shared/Button';
import styles from './NewScreen.module.css';

export const NewScreen = ({ onNext, onBack, currentStep, totalSteps }) => {
  return (
    <div className={styles.container}>
      <ScreenHeader 
        onBack={onBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      
      <ContentHeader
        stepLabel="YOUR LABEL"
        title="Screen Title"
        description="Screen description"
      />
      
      {/* Your content here */}
      
      <Button variant="primary" fullWidth onClick={onNext}>
        Continue
      </Button>
    </div>
  );
};
```

## 🔧 Zustand Store Usage

The onboarding store provides centralized state management:

```tsx
import { useOnboardingStore } from '../stores/onboardingStore';

function MyComponent() {
  const {
    // State
    currentStep,
    interests,
    personality,
    
    // Actions
    nextStep,
    prevStep,
    toggleInterest,
    canProceed,
  } = useOnboardingStore();
  
  return (
    <button 
      onClick={() => toggleInterest('Gaming')}
      disabled={!canProceed()}
    >
      {interests.includes('Gaming') ? 'Selected' : 'Select'}
    </button>
  );
}
```

## 🎯 Next Steps to Complete

The following screens still need to be implemented:

### Step 1: School Selection
- Search functionality with debouncing
- Alphabetically grouped list
- School logo display
- Student count

### Step 2: Basic Profile
- Form validation with React Hook Form
- Name, age, year, major fields
- Real-time validation feedback

### Step 3: Photo Upload
- Drag-and-drop with react-dropzone
- Image compression
- Photo reordering with @dnd-kit
- 1-6 photo slots

## 📱 Mobile Optimization

The new design is mobile-first with:

- Safe area insets for iOS
- Touch-friendly tap targets (44px minimum)
- Smooth 60fps animations
- Prevents iOS input zoom
- Backdrop blur effects

## 🎨 Color Palette

### Primary Colors
- **Coral**: `#FF6B6B` (primary CTA, highlights)
- **Blue**: `#4ECDC4` (secondary actions)

### Accent Colors
- **Purple**: `#A78BFA`
- **Yellow**: `#FFE66D`
- **Green**: `#6EE7B7`
- **Pink**: `#FB7185`

### Neutrals
- **Background**: `#FAFAFF` → `#F3F4FF` (gradient)
- **Text Primary**: `#2D2D2D`
- **Text Secondary**: `#6B6B6B`
- **Text Tertiary**: `#9B9B9B`

## 🔄 Migration Checklist

- [ ] Install new dependencies (zustand, etc.)
- [ ] Import CSS files in main app
- [ ] Test Welcome Screen
- [ ] Test Interests & Personality Screen
- [ ] Test Goals Screen
- [ ] Test Success Screen
- [ ] Implement School Selection Screen
- [ ] Implement Basic Profile Screen
- [ ] Implement Photo Upload Screen
- [ ] Connect to existing API
- [ ] Test complete flow end-to-end
- [ ] A/B test with existing onboarding
- [ ] Monitor completion rates
- [ ] Collect user feedback

## 🐛 Troubleshooting

### Styles not applying
Make sure CSS files are imported in order:
```tsx
import '../styles/tokens.css';
import '../styles/animations.css';
import '../styles/onboarding-global.css';
```

### Zustand persist not working
Check that you're not in incognito/private mode and localStorage is available.

### Animations janky on low-end devices
The CSS includes `prefers-reduced-motion` support. Users with this setting will see simplified animations.

## 📚 Additional Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

## 🤝 Contributing

When adding new screens:
1. Follow the established patterns
2. Use design tokens (no hard-coded colors/spacing)
3. Include animations for delight
4. Test on mobile devices
5. Ensure accessibility (keyboard navigation, screen readers)

---

**Note**: This is a living document. Update as the onboarding flow evolves.


