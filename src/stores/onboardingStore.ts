import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingState {
  // Current step (0-5)
  currentStep: number;
  
  // School selection (Step 1)
  school: {
    id: string;
    name: string;
    location: string;
    logo: string;
    studentCount: number;
  } | null;
  
  // Basic profile (Step 2)
  profile: {
    fullName: string;
    age: number | null;
    year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'grad' | 'alumni' | null;
    major: string;
  };
  
  // Photos (Step 3)
  photos: string[]; // Array of base64 or URLs
  
  // Interests & Personality (Step 4) - Combined
  interests: string[];
  personality: string[];
  
  // Goals (Step 5)
  goals: {
    makeConnect: string[]; // What brings you here
    careerGoal: string;
  };
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSchool: (school: OnboardingState['school']) => void;
  setProfile: (profile: Partial<OnboardingState['profile']>) => void;
  addPhoto: (photo: string) => void;
  removePhoto: (index: number) => void;
  reorderPhotos: (photos: string[]) => void;
  toggleInterest: (interest: string) => void;
  togglePersonality: (trait: string) => void;
  setGoals: (goals: Partial<OnboardingState['goals']>) => void;
  resetOnboarding: () => void;
  canProceed: () => boolean;
}

const initialState = {
  currentStep: 0,
  school: null,
  profile: {
    fullName: '',
    age: null,
    year: null,
    major: '',
  },
  photos: [],
  interests: [],
  personality: [],
  goals: {
    makeConnect: [],
    careerGoal: '',
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 6) 
      })),
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 0) 
      })),
      setSchool: (school) => set({ school }),
      setProfile: (profile) => set((state) => ({ 
        profile: { ...state.profile, ...profile } 
      })),
      addPhoto: (photo) => set((state) => ({ 
        photos: [...state.photos, photo].slice(0, 6) 
      })),
      removePhoto: (index) => set((state) => ({ 
        photos: state.photos.filter((_, i) => i !== index) 
      })),
      reorderPhotos: (photos) => set({ photos }),
      toggleInterest: (interest) => set((state) => {
        const interests = state.interests.includes(interest)
          ? state.interests.filter(i => i !== interest)
          : [...state.interests, interest];
        return { interests: interests.slice(0, 10) };
      }),
      togglePersonality: (trait) => set((state) => {
        const personality = state.personality.includes(trait)
          ? state.personality.filter(t => t !== trait)
          : [...state.personality, trait];
        return { personality: personality.slice(0, 8) };
      }),
      setGoals: (goals) => set((state) => ({ 
        goals: { ...state.goals, ...goals } 
      })),
      resetOnboarding: () => set(initialState),
      canProceed: () => {
        const state = get();
        switch (state.currentStep) {
          case 0: // Welcome screen - always can proceed
            return true;
          case 1: // School selection
            return state.school !== null;
          case 2: // Basic profile
            return !!(
              state.profile.fullName.trim() &&
              state.profile.age &&
              state.profile.age >= 18 &&
              state.profile.year &&
              state.profile.major
            );
          case 3: // Photos
            return state.photos.length >= 1;
          case 4: // Interests & Personality
            return state.interests.length >= 3 && state.personality.length >= 3;
          case 5: // Goals
            return state.goals.makeConnect.length >= 1;
          default:
            return false;
        }
      },
    }),
    {
      name: 'bonded-onboarding',
      partialize: (state) => ({
        school: state.school,
        profile: state.profile,
        photos: state.photos,
        interests: state.interests,
        personality: state.personality,
        goals: state.goals,
      }),
    }
  )
);


