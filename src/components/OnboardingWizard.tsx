import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SchoolSelector } from './SchoolSelector';
import { 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X, 
  Check,
  Camera,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Users,
  Volume2,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';
import { BondPrintQuiz } from './BondPrintQuiz';

import { useAccessToken } from '../store/useAppStore';

interface OnboardingWizardProps {
  userEmail: string;
  userName: string;
  userSchool: string;
  onComplete: (profile: any) => void;
  existingProfile?: any; // For editing existing profile
}

const INTERESTS = [
  'Art', 'Reading', 'Gaming', 'Music', 'Travel', 
  'Fitness', 'Cooking', 'Photography', 'Movies', 'Sports',
  'Theater', 'Tech', 'Sustainability', 'Yoga', 'Events',
  'Writing', 'Playing Music', 'Outdoors', 'Crafts', 'Food',
  'Pets', 'Karaoke', 'Swimming', 'Cycling', 'Climbing',
  'TV Shows', 'Board Games', 'Coffee', 'Wine', 'Trying New Foods'
];

const PERSONALITY_TRAITS = [
  'Outgoing', 'Introverted', 'Creative', 'Analytical', 'Empathetic',
  'Ambitious', 'Chill', 'Organized', 'Spontaneous', 'Adventurous',
  'Thoughtful', 'Humorous', 'Driven', 'Laid-back', 'Curious',
  'Compassionate', 'Independent', 'Team Player', 'Leader', 'Supportive'
];

const LOOKING_FOR_OPTIONS = [
  'Make Friends',
  'Find a Roommate',
  'Study Partner',
  'Collaborate on Projects',
  'Network',
  'Event Buddy',
  'Workout Partner',
  'Dining Companion'
];

const ACADEMIC_GOALS = [
  'Maintain high GPA (3.5+)',
  'Get into grad school',
  'Land internships',
  'Build portfolio/projects',
  'Join research labs',
  'Study abroad',
  'Change major',
  'Just graduate',
  'Other'
];

const LEISURE_GOALS = [
  'Join clubs/orgs',
  'Play sports',
  'Go to parties',
  'Explore the city',
  'Try new restaurants',
  'Attend concerts/events',
  'Outdoor activities',
  'Gaming',
  'Travel',
  'Other'
];

const MAJORS = [
  'Computer Science', 'Engineering', 'Business', 'Psychology', 'Biology',
  'English', 'Mathematics', 'Chemistry', 'Physics', 'Economics',
  'Political Science', 'Communications', 'Art', 'Music', 'History',
  'Philosophy', 'Sociology', 'Nursing', 'Education', 'Marketing',
  'Finance', 'Architecture', 'Environmental Science', 'Pre-Med', 'Pre-Law',
  'Other'
];

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

export function OnboardingWizard({ userEmail, userName, userSchool, onComplete, existingProfile }: OnboardingWizardProps) {
  const accessToken = useAccessToken();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  // Step 1: School Selection
  const [school, setSchool] = useState(
    existingProfile?.school || (userSchool === 'Pending' ? '' : userSchool)
  );
  
  // Step 2: Basic Info
  const [name, setName] = useState(existingProfile?.name || userName || '');
  const [age, setAge] = useState(existingProfile?.age?.toString() || '');
  const [major, setMajor] = useState(existingProfile?.major || '');
  const [customMajor, setCustomMajor] = useState(existingProfile?.major && !MAJORS.includes(existingProfile.major) ? existingProfile.major : '');
  const [year, setYear] = useState(existingProfile?.year || '');
  
  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>(() => {
    if (existingProfile?.photos && Array.isArray(existingProfile.photos)) {
      return existingProfile.photos;
    }
    if (existingProfile?.imageUrl) {
      return [existingProfile.imageUrl];
    }
    if (existingProfile?.profilePicture) {
      return [existingProfile.profilePicture];
    }
    return [];
  });
  const [uploading, setUploading] = useState(false);
  
  // Step 4: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    existingProfile?.interests || []
  );
  
  // Step 5: Personality
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    existingProfile?.personality || []
  );
  
  // Step 6: Living Habits
  const [sleepSchedule, setSleepSchedule] = useState(
    existingProfile?.sleepSchedule || existingProfile?.livingHabits?.sleepSchedule || ''
  );
  const [cleanliness, setCleanliness] = useState(
    existingProfile?.cleanliness || existingProfile?.livingHabits?.cleanliness || ''
  );
  const [guests, setGuests] = useState(
    existingProfile?.livingHabits?.guests || ''
  );
  const [noise, setNoise] = useState(
    existingProfile?.livingHabits?.noise || ''
  );
  
  // Step 7: Bio
  const [bio, setBio] = useState(existingProfile?.bio || '');
  
  // Step 8: Looking For
  // Convert normalized lookingFor back to display format
  const normalizeLookingForItem = (item: string) => item.toLowerCase().replace(/ /g, '-');
  const lookingForOptionsNormalized = LOOKING_FOR_OPTIONS.map(opt => normalizeLookingForItem(opt));
  
  const initialLookingFor = existingProfile?.lookingFor || [];
  const lookingForDisplay = initialLookingFor.map((item: string) => {
    const normalized = normalizeLookingForItem(item);
    const index = lookingForOptionsNormalized.indexOf(normalized);
    return index >= 0 ? LOOKING_FOR_OPTIONS[index] : item;
  }).filter(Boolean);
  
  const [lookingFor, setLookingFor] = useState<string[]>(lookingForDisplay);
  
  // Step 9: Future Goals (Optional)
  // Initialize academic goals - normalize and match with predefined list
  const normalizeGoal = (goal: string) => goal.toLowerCase().replace(/ /g, '-');
  const normalizeGoalList = (goals: string[]) => goals.map(normalizeGoal);
  
  const initialAcademicGoals = existingProfile?.goals?.academic || [];
  const normalizedAcademicList = normalizeGoalList(ACADEMIC_GOALS);
  const initialCustomAcademic = initialAcademicGoals.find((g: string) => 
    !normalizedAcademicList.includes(normalizeGoal(g))
  );
  
  // Convert normalized goals back to display format, or keep as-is if custom
  const academicGoalsDisplay = initialAcademicGoals.map((g: string) => {
    const normalized = normalizeGoal(g);
    const index = normalizedAcademicList.indexOf(normalized);
    return index >= 0 ? ACADEMIC_GOALS[index] : g;
  }).filter(Boolean);
  
  const [academicGoals, setAcademicGoals] = useState<string[]>(
    initialCustomAcademic 
      ? [...academicGoalsDisplay.filter((g: string) => normalizeGoal(g) !== normalizeGoal(initialCustomAcademic)), 'Other']
      : academicGoalsDisplay
  );
  
  // Initialize leisure goals
  const initialLeisureGoals = existingProfile?.goals?.leisure || [];
  const normalizedLeisureList = normalizeGoalList(LEISURE_GOALS);
  const initialCustomLeisure = initialLeisureGoals.find((g: string) => 
    !normalizedLeisureList.includes(normalizeGoal(g))
  );
  
  const leisureGoalsDisplay = initialLeisureGoals.map((g: string) => {
    const normalized = normalizeGoal(g);
    const index = normalizedLeisureList.indexOf(normalized);
    return index >= 0 ? LEISURE_GOALS[index] : g;
  }).filter(Boolean);
  
  const [leisureGoals, setLeisureGoals] = useState<string[]>(
    initialCustomLeisure 
      ? [...leisureGoalsDisplay.filter((g: string) => normalizeGoal(g) !== normalizeGoal(initialCustomLeisure)), 'Other']
      : leisureGoalsDisplay
  );
  
  const [careerGoal, setCareerGoal] = useState(
    existingProfile?.goals?.career || ''
  );
  const [personalGoal, setPersonalGoal] = useState(
    existingProfile?.goals?.personal || ''
  );
  const [customAcademicGoal, setCustomAcademicGoal] = useState(
    initialCustomAcademic || ''
  );
  const [customLeisureGoal, setCustomLeisureGoal] = useState(
    initialCustomLeisure || ''
  );
  const [additionalInfo, setAdditionalInfo] = useState(
    existingProfile?.additionalInfo || ''
  );

  const [bondPrintCompleted, setBondPrintCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const totalSteps = 10; // Added Bond Print quiz as step 10
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    // Only validate essential steps - rest are optional
    if (step === 1 && !school) {
      toast.error('Please select your school');
      return;
    }
    if (step === 2 && (!name || !age || !major || !year)) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Step 3 (Photos) - make optional but show warning
    if (step === 3 && photos.length === 0) {
      toast.info('You can add photos later in your profile settings', {
        duration: 3000,
      });
    }
    // Steps 4-9 are all optional - no validation needed
    // Step 10 (Bond Print) is optional - can skip

    if (step < totalSteps) {
      // If moving to step 10, show quiz instead
      if (step === 9) {
        setShowQuiz(true);
        return;
      }
      setDirection(1);
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    // Allow skipping optional steps (4-10)
    if (step >= 4 && step < totalSteps) {
      if (step === 9) {
        // Skip Bond Print quiz
        handleComplete();
      } else {
        setDirection(1);
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 6) {
      toast.error('Maximum 6 photos allowed');
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (5MB max)
      if (file.size > 5242880) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      try {
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;

          // Upload to server
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/upload-photo`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                image: base64,
                fileName: file.name,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();
          setPhotos(prev => [...prev, data.url]);
          toast.success('Photo uploaded!');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Photo upload error:', error);
        toast.error('Failed to upload photo');
      }
    }

    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 10) {
        toast.error('Maximum 10 interests');
        return;
      }
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(prev => prev.filter(t => t !== trait));
    } else {
      if (selectedTraits.length >= 8) {
        toast.error('Maximum 8 traits');
        return;
      }
      setSelectedTraits(prev => [...prev, trait]);
    }
  };

  const toggleLookingFor = (item: string) => {
    if (lookingFor.includes(item)) {
      setLookingFor(prev => prev.filter(i => i !== item));
    } else {
      setLookingFor(prev => [...prev, item]);
    }
  };

  const toggleAcademicGoal = (goal: string) => {
    if (goal === 'Other') {
      // Handle custom input
      return;
    }
    if (academicGoals.includes(goal)) {
      setAcademicGoals(prev => prev.filter(g => g !== goal));
    } else {
      setAcademicGoals(prev => [...prev, goal]);
    }
  };

  const toggleLeisureGoal = (goal: string) => {
    if (goal === 'Other') {
      // Handle custom input
      return;
    }
    if (leisureGoals.includes(goal)) {
      setLeisureGoals(prev => prev.filter(g => g !== goal));
    } else {
      setLeisureGoals(prev => [...prev, goal]);
    }
  };

  const handleComplete = async () => {
    try {
      if (!accessToken) {
        toast.error('Please log in to create your profile');
        console.error('❌ No access token available. User may not be authenticated.');
        return;
      }

      // Log for debugging in dev
      if (import.meta.env.DEV) {
        console.log('✅ Access token available:', accessToken.substring(0, 20) + '...');
        console.log('📝 Profile data:', { name, school, major, year });
      }

      // Process academic goals (include custom if "Other" selected)
      const processedAcademicGoals = academicGoals.map(g => {
        if (g === 'Other' && customAcademicGoal) {
          return customAcademicGoal;
        }
        return g.toLowerCase().replace(/ /g, '-');
      });

      // Process leisure goals (include custom if "Other" selected)
      const processedLeisureGoals = leisureGoals.map(g => {
        if (g === 'Other' && customLeisureGoal) {
          return customLeisureGoal;
        }
        return g.toLowerCase().replace(/ /g, '-');
      });

      // Validate required fields
      if (!name || !name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (!school || !school.trim()) {
        toast.error('Please select your school');
        return;
      }
      if (!age || isNaN(parseInt(age)) || parseInt(age) < 18) {
        toast.error('Please enter a valid age (18+)');
        return;
      }

      const profileData = {
        name: name.trim(),
        school: school.trim(),
        age: parseInt(age),
        major: major === 'Other' ? (customMajor?.trim() || '') : (major || ''),
        year: year || '',
        bio: bio?.trim() || '',
        interests: selectedInterests || [],
        personality: selectedTraits || [],
        lookingFor: lookingFor.map(item => {
          // Extract the text without emoji
          return item.replace(/^[^\s]+\s/, '').toLowerCase().replace(/ /g, '-');
        }),
        photos: photos || [],
        profilePicture: photos[0] || '',
        sleepSchedule: sleepSchedule || 'moderate',
        cleanliness: cleanliness || 'moderate',
        guests: guests || 'sometimes',
        noise: noise || 'moderate',
        goals: {
          academic: processedAcademicGoals || [],
          leisure: processedLeisureGoals || [],
          career: careerGoal?.trim() || undefined,
          personal: personalGoal?.trim() || undefined,
        },
        additionalInfo: additionalInfo?.trim() || undefined,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to save profile';
        
        // Better error logging for debugging
        if (import.meta.env.DEV) {
          console.error('❌ Profile creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            errorData,
            endpoint: `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile`
          });
        }
        
        throw new Error(errorMessage);
      }

      const profile = await response.json();
      if (existingProfile) {
        toast.success('Profile updated! 🎉');
      } else {
        toast.success('Profile created! 🎉');
      }
      // If this is new profile creation and Bond Print not completed, show quiz
      if (!existingProfile && !bondPrintCompleted) {
        setShowQuiz(true);
        return; // Don't complete yet, wait for quiz
      }
      
      onComplete(profile);
    } catch (error: any) {
      console.error('Profile save error:', error);
      const errorMessage = error?.message || (existingProfile ? 'Failed to update profile' : 'Failed to create profile');
      
      // More helpful error message for common issues
      let userMessage = errorMessage;
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        userMessage = 'Please log in again. Your session may have expired.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (import.meta.env.DEV && errorMessage.includes('Failed to save profile')) {
        userMessage = 'Profile creation failed. Check console for details. Make sure you have a .env file with VITE_SUPABASE_ANON_KEY set.';
      }
      
      toast.error(userMessage);
    }
  };

  const handleBondPrintComplete = async (bondPrint: any) => {
    setBondPrintCompleted(true);
    setShowQuiz(false);
    
    // Update profile with Bond Print
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            bondPrint,
            hasCompletedBondPrint: true,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save Bond Print');
      
      const updatedProfile = await response.json();
      toast.success('Bond Print completed! 🎉');
      onComplete(updatedProfile);
    } catch (error) {
      console.error('Bond Print save error:', error);
      toast.error('Failed to save Bond Print');
      // Still complete onboarding even if Bond Print save fails
      handleComplete();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundColor: '#05070B',
        height: '100vh',
        height: '100dvh',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
      }}
    >
      {/* Header with Progress */}
      <div 
        className="px-4 pt-4 pb-3 flex-shrink-0 z-10"
        style={{
          backgroundColor: '#05070B',
          paddingTop: 'max(16px, env(safe-area-inset-top))'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-sm font-medium"
            style={{ color: '#757A89' }}
          >
            Step {step} of {totalSteps}
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-1 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            '--progress-background': '#0A84FF'
          } as React.CSSProperties}
        />
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingTop: '24px',
          paddingBottom: '100px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="w-full" style={{ maxWidth: '100%' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: School Selection */}
              {step === 1 && (
                <SchoolSelector value={school} onChange={setSchool} />
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    Let's start with the basics
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: '#A7AABB' }}
                  >
                    Tell us about yourself
                  </p>
                  
                  {school && (
                    <p 
                      className="text-sm font-medium mb-5"
                      style={{ color: '#0A84FF' }}
                    >
                      Connected to: {school}
                    </p>
                  )}
                  
                  {!school && <div className="mb-5" />}

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label 
                        htmlFor="name" 
                        className="text-[14px] font-medium block"
                        style={{ color: '#F9FAFF' }}
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full h-[48px] rounded-[12px] border px-4"
                        style={{
                          backgroundColor: '#171B24',
                          color: '#F9FAFF',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '15px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0A84FF';
                          e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Age & Year Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label 
                          htmlFor="age" 
                          className="text-[14px] font-medium block"
                          style={{ color: '#F9FAFF' }}
                        >
                          Age
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Age"
                          min="18"
                          max="100"
                          className="w-full h-[48px] rounded-[12px] border px-4"
                          style={{
                            backgroundColor: '#171B24',
                            color: '#F9FAFF',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '15px'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#0A84FF';
                            e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label 
                          htmlFor="year" 
                          className="text-[14px] font-medium block"
                          style={{ color: '#F9FAFF' }}
                        >
                          Year
                        </Label>
                        <Select value={year} onValueChange={setYear}>
                          <SelectTrigger 
                            className="w-full h-[48px] rounded-[12px] border px-4"
                            style={{
                              backgroundColor: '#171B24',
                              color: '#F9FAFF',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                              fontSize: '15px'
                            }}
                          >
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent 
                            className="rounded-[12px] border z-[9999]"
                            style={{
                              backgroundColor: '#11141C',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                              maxHeight: '300px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            {YEARS.map(y => (
                              <SelectItem 
                                key={y}
                                value={y}
                                className="rounded-lg"
                                style={{
                                  color: '#F9FAFF',
                                  fontSize: '15px'
                                }}
                              >
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Major */}
                    <div className="space-y-2">
                      <Label 
                        htmlFor="major" 
                        className="text-[14px] font-medium block"
                        style={{ color: '#F9FAFF' }}
                      >
                        Major
                      </Label>
                      <Select value={major} onValueChange={setMajor}>
                        <SelectTrigger 
                          className="w-full h-[48px] rounded-[12px] border px-4"
                          style={{
                            backgroundColor: '#171B24',
                            color: '#F9FAFF',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '15px'
                          }}
                        >
                          <SelectValue placeholder="Select your major" />
                        </SelectTrigger>
                        <SelectContent 
                          className="rounded-[12px] border z-[9999]"
                          style={{
                            backgroundColor: '#11141C',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            maxHeight: '300px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                          }}
                        >
                          {MAJORS.map(m => (
                            <SelectItem 
                              key={m} 
                              value={m}
                              className="rounded-lg"
                              style={{
                                color: '#F9FAFF',
                                fontSize: '15px'
                              }}
                            >
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {major === 'Other' && (
                        <Input
                          className="mt-2 w-full h-[48px] rounded-[12px] border px-4"
                          value={customMajor}
                          onChange={(e) => setCustomMajor(e.target.value)}
                          placeholder="Enter your major"
                          style={{
                            backgroundColor: '#171B24',
                            color: '#F9FAFF',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '15px'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Photos */}
              {step === 3 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    Add your photos
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: '#A7AABB' }}
                  >
                    Upload 1-6 photos
                  </p>
                  
                  <p 
                    className="text-sm mb-5"
                    style={{ color: '#757A89' }}
                  >
                    Your first photo will be your profile photo.
                  </p>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const photo = photos[index];
                      return (
                        <div key={index} className="relative aspect-[4/5] rounded-[12px] overflow-hidden border" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                          {photo ? (
                            <>
                              <img 
                                src={photo} 
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
                                style={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                  backdropFilter: 'blur(4px)'
                                }}
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                              {index === 0 && (
                                <div 
                                  className="absolute bottom-2 left-2 px-2 py-1 rounded-[6px] text-xs font-medium"
                                  style={{
                                    backgroundColor: '#0A84FF',
                                    color: '#FFFFFF'
                                  }}
                                >
                                  Profile
                                </div>
                              )}
                            </>
                          ) : (
                            <label 
                              className="w-full h-full border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                              style={{
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                                backgroundColor: '#171B24'
                              }}
                            >
                              <Upload 
                                className="w-6 h-6 mb-2" 
                                style={{ color: '#757A89' }}
                              />
                              <span 
                                className="text-xs font-medium"
                                style={{ color: '#A7AABB' }}
                              >
                                {index === 0 ? 'Profile' : 'Add'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {uploading && (
                    <p 
                      className="text-center text-sm font-medium mb-2"
                      style={{ color: '#0A84FF' }}
                    >
                      Uploading...
                    </p>
                  )}

                  <p 
                    className="text-sm text-center"
                    style={{ color: '#757A89' }}
                  >
                    You can change or rearrange these later.
                  </p>
                </div>
              )}

              {/* Step 4: Interests */}
              {step === 4 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    What are you into?
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: '#A7AABB' }}
                  >
                    Select 3-10 interests
                  </p>
                  
                  <p 
                    className="text-sm font-medium mb-5"
                    style={{ color: '#0A84FF' }}
                  >
                    {selectedInterests.length} / 10 selected
                  </p>

                  {/* Interest Chips */}
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className="px-4 h-[36px] rounded-full text-sm font-medium transition-all active:scale-[0.97] border"
                          style={{
                            backgroundColor: isSelected ? '#0A84FF' : '#171B24',
                            color: isSelected ? '#FFFFFF' : '#F9FAFF',
                            borderColor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 mr-1.5 inline" />
                          )}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Personality */}
              {step === 5 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    Describe your personality
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: '#A7AABB' }}
                  >
                    Select 3-8 traits that fit you
                  </p>
                  
                  <p 
                    className="text-sm font-medium mb-5"
                    style={{ color: '#0A84FF' }}
                  >
                    {selectedTraits.length} / 8 selected
                  </p>

                  {/* Personality Chips */}
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TRAITS.map(trait => {
                      const isSelected = selectedTraits.includes(trait);
                      return (
                        <button
                          key={trait}
                          onClick={() => toggleTrait(trait)}
                          className="px-4 h-[36px] rounded-full text-sm font-medium transition-all active:scale-[0.97] border"
                          style={{
                            backgroundColor: isSelected ? '#0A84FF' : '#171B24',
                            color: isSelected ? '#FFFFFF' : '#F9FAFF',
                            borderColor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 mr-1.5 inline" />
                          )}
                          {trait}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 6: Living Habits */}
              {step === 6 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    Living preferences
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-5"
                    style={{ color: '#A7AABB' }}
                  >
                    Help potential roommates know your style
                  </p>

                  <div className="space-y-6">
                    {/* Sleep Schedule */}
                    <div>
                      <Label 
                        className="flex items-center gap-2 mb-3 text-[15px] font-semibold block"
                        style={{ color: '#F9FAFF' }}
                      >
                        {sleepSchedule === 'early' ? (
                          <Sun className="w-5 h-5" style={{ color: '#0A84FF' }} />
                        ) : (
                          <Moon className="w-5 h-5" style={{ color: '#0A84FF' }} />
                        )}
                        Sleep Schedule
                      </Label>
                      <div 
                        className="flex gap-2 p-1 rounded-[12px] border"
                        style={{
                          backgroundColor: '#11141C',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {[
                          { value: 'early', label: 'Early Bird', icon: Sun },
                          { value: 'night', label: 'Night Owl', icon: Moon }
                        ].map(({ value, label, icon: Icon }) => {
                          const isSelected = sleepSchedule === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setSleepSchedule(value)}
                              className="flex-1 h-[44px] rounded-[10px] text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                              style={{
                                backgroundColor: isSelected ? '#0A84FF' : 'transparent',
                                color: isSelected ? '#FFFFFF' : '#A7AABB'
                              }}
                            >
                              <Icon className="w-5 h-5" />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cleanliness */}
                    <div>
                      <Label 
                        className="flex items-center gap-2 mb-3 text-[15px] font-semibold block"
                        style={{ color: '#F9FAFF' }}
                      >
                        <Sparkles className="w-5 h-5" style={{ color: '#0A84FF' }} />
                        Cleanliness Level
                      </Label>
                      <div 
                        className="flex gap-2 p-1 rounded-[12px] border"
                        style={{
                          backgroundColor: '#11141C',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {['neat', 'moderate', 'relaxed'].map(level => {
                          const isSelected = cleanliness === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setCleanliness(level)}
                              className="flex-1 h-[44px] rounded-[10px] text-sm font-medium capitalize transition-all active:scale-[0.98]"
                              style={{
                                backgroundColor: isSelected ? '#0A84FF' : 'transparent',
                                color: isSelected ? '#FFFFFF' : '#A7AABB'
                              }}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <Label 
                        className="flex items-center gap-2 mb-3 text-[15px] font-semibold block"
                        style={{ color: '#F9FAFF' }}
                      >
                        <Users className="w-5 h-5" style={{ color: '#0A84FF' }} />
                        Guests Policy
                      </Label>
                      <div 
                        className="flex gap-2 p-1 rounded-[12px] border"
                        style={{
                          backgroundColor: '#11141C',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {['often', 'sometimes', 'rarely'].map(freq => {
                          const isSelected = guests === freq;
                          return (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setGuests(freq)}
                              className="flex-1 h-[44px] rounded-[10px] text-sm font-medium capitalize transition-all active:scale-[0.98]"
                              style={{
                                backgroundColor: isSelected ? '#0A84FF' : 'transparent',
                                color: isSelected ? '#FFFFFF' : '#A7AABB'
                              }}
                            >
                              {freq}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Noise */}
                    <div>
                      <Label 
                        className="flex items-center gap-2 mb-3 text-[15px] font-semibold block"
                        style={{ color: '#F9FAFF' }}
                      >
                        <Volume2 className="w-5 h-5" style={{ color: '#0A84FF' }} />
                        Noise Tolerance
                      </Label>
                      <div 
                        className="flex gap-2 p-1 rounded-[12px] border"
                        style={{
                          backgroundColor: '#11141C',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {['quiet', 'moderate', 'lively'].map(level => {
                          const isSelected = noise === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setNoise(level)}
                              className="flex-1 h-[44px] rounded-[10px] text-sm font-medium capitalize transition-all active:scale-[0.98]"
                              style={{
                                backgroundColor: isSelected ? '#0A84FF' : 'transparent',
                                color: isSelected ? '#FFFFFF' : '#A7AABB'
                              }}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Bio */}
              {step === 7 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    Tell your story
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-5"
                    style={{ color: '#A7AABB' }}
                  >
                    Write a short intro about yourself
                  </p>

                  <div>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a short intro about yourself…"
                      rows={8}
                      className="w-full resize-none rounded-[12px] border px-4 py-3"
                      style={{
                        backgroundColor: '#171B24',
                        color: '#F9FAFF',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        minHeight: '180px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0A84FF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.target.style.boxShadow = 'none';
                      }}
                      maxLength={500}
                    />
                    <p 
                      className="text-sm font-medium mt-2 text-right"
                      style={{ 
                        color: bio.length > 450 ? '#0A84FF' : '#757A89' 
                      }}
                    >
                      {bio.length} / 500
                    </p>
                  </div>
                </div>
              )}

              {/* Step 8: Looking For */}
              {step === 8 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    What brings you here?
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: '#A7AABB' }}
                  >
                    Select all that apply
                  </p>
                  
                  <p 
                    className="text-sm mb-5"
                    style={{ color: '#757A89' }}
                  >
                    We'll match you with people who share your goals.
                  </p>

                  {/* Options List - iOS Style */}
                  <div 
                    className="rounded-[12px] overflow-hidden border"
                    style={{
                      backgroundColor: '#11141C',
                      borderColor: 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {LOOKING_FOR_OPTIONS.map((option, index) => {
                      const isSelected = lookingFor.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleLookingFor(option)}
                          className="w-full h-[52px] px-4 flex items-center justify-between border-b last:border-b-0 transition-all active:opacity-70"
                          style={{
                            backgroundColor: isSelected ? 'rgba(10, 132, 255, 0.1)' : 'transparent',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            color: isSelected ? '#0A84FF' : '#F9FAFF',
                            fontSize: '15px'
                          }}
                        >
                          <span className="font-medium">{option}</span>
                          {isSelected && (
                            <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#0A84FF' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 9: Future Goals (Optional) */}
              {step === 9 && (
                <div className="w-full">
                  {/* Title */}
                  <h2 
                    className="text-[26px] font-semibold mb-1"
                    style={{ color: '#F9FAFF' }}
                  >
                    What are your goals?
                  </h2>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: '#A7AABB' }}
                  >
                    Help us connect you with like-minded people on campus
                  </p>
                  
                  <p 
                    className="text-xs mb-5"
                    style={{ color: '#757A89' }}
                  >
                    Optional - You can skip this step
                  </p>

                  <div className="space-y-6">
                    {/* Academic Goals */}
                    <div>
                      <Label 
                        className="text-[15px] font-semibold mb-3 block"
                        style={{ color: '#757A89' }}
                      >
                        Academic Goals
                      </Label>
                      <div 
                        className="rounded-[12px] overflow-hidden border"
                        style={{
                          backgroundColor: '#11141C',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {ACADEMIC_GOALS.map((goal, index) => {
                          const isSelected = academicGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              onClick={() => toggleAcademicGoal(goal)}
                              className="w-full h-[52px] px-4 flex items-center justify-between border-b last:border-b-0 transition-all active:opacity-70"
                              style={{
                                backgroundColor: isSelected ? 'rgba(10, 132, 255, 0.1)' : 'transparent',
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                                color: isSelected ? '#0A84FF' : '#F9FAFF',
                                fontSize: '15px'
                              }}
                            >
                              <span className="font-medium">{goal}</span>
                              {isSelected && (
                                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#0A84FF' }} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {academicGoals.includes('Other') && (
                        <Input
                          placeholder="Describe your academic goal..."
                          value={customAcademicGoal}
                          onChange={(e) => setCustomAcademicGoal(e.target.value)}
                          className="mt-3 w-full h-[48px] rounded-[12px] border px-4"
                          style={{
                            backgroundColor: '#171B24',
                            color: '#F9FAFF',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '15px'
                          }}
                        />
                      )}
                    </div>

                    {/* Leisure Goals */}
                    <div>
                      <Label 
                        className="text-[15px] font-semibold mb-3 block"
                        style={{ color: '#757A89' }}
                      >
                        Leisure Goals
                      </Label>
                      <div 
                        className="rounded-[12px] overflow-hidden border"
                        style={{
                          backgroundColor: '#11141C',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {LEISURE_GOALS.map((goal, index) => {
                          const isSelected = leisureGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              onClick={() => toggleLeisureGoal(goal)}
                              className="w-full h-[52px] px-4 flex items-center justify-between border-b last:border-b-0 transition-all active:opacity-70"
                              style={{
                                backgroundColor: isSelected ? 'rgba(10, 132, 255, 0.1)' : 'transparent',
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                                color: isSelected ? '#0A84FF' : '#F9FAFF',
                                fontSize: '15px'
                              }}
                            >
                              <span className="font-medium">{goal}</span>
                              {isSelected && (
                                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#0A84FF' }} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {leisureGoals.includes('Other') && (
                        <Input
                          placeholder="Describe your leisure goal..."
                          value={customLeisureGoal}
                          onChange={(e) => setCustomLeisureGoal(e.target.value)}
                          className="mt-3 w-full h-[48px] rounded-[12px] border px-4"
                          style={{
                            backgroundColor: '#171B24',
                            color: '#F9FAFF',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '15px'
                          }}
                        />
                      )}
                    </div>

                    {/* Career Goal */}
                    <div>
                      <Label 
                        className="text-[15px] font-semibold mb-2 block"
                        style={{ color: '#757A89' }}
                      >
                        Career Goal (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., Software Engineer at Google, Medical School, Start my own business"
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        className="w-full h-[48px] rounded-[12px] border px-4"
                        style={{
                          backgroundColor: '#171B24',
                          color: '#F9FAFF',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Personal Goal */}
                    <div>
                      <Label 
                        className="text-[15px] font-semibold mb-2 block"
                        style={{ color: '#757A89' }}
                      >
                        Personal Goal (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., Get fit, Learn Spanish, Read more books"
                        value={personalGoal}
                        onChange={(e) => setPersonalGoal(e.target.value)}
                        className="w-full h-[48px] rounded-[12px] border px-4"
                        style={{
                          backgroundColor: '#171B24',
                          color: '#F9FAFF',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '15px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Bottom Action Bar - iOS Style */}
      <div
        className="fixed bottom-0 left-0 right-0 flex-shrink-0 z-20 border-t"
        style={{
          backgroundColor: '#090C13',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          paddingTop: '12px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          paddingLeft: '16px',
          paddingRight: '16px',
          boxShadow: '0 -1px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="w-full flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2.5 text-base font-medium"
              style={{
                color: '#A7AABB',
                backgroundColor: 'transparent'
              }}
            >
              Back
            </button>
          )}
          {step >= 4 && step < totalSteps && (
            <button
              onClick={handleSkip}
              className="text-sm font-medium px-3 py-2.5"
              style={{
                color: '#757A89'
              }}
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 h-[52px] rounded-[14px] text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: '#0A84FF',
              color: '#FFFFFF'
            }}
          >
            {step === totalSteps ? 'Complete' : step === 9 ? 'Complete' : 'Next'}
            {step < totalSteps && step !== 9 && <ArrowRight className="w-4 h-4" />}
            {step === totalSteps && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Bond Print Quiz Modal/Overlay */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <BondPrintQuiz
              userProfile={{
                name,
                school,
                major: major === 'Other' ? customMajor : major,
                year,
                interests: selectedInterests,
                personality: selectedTraits,
                goals: {
                  academic: academicGoals,
                  leisure: leisureGoals,
                  career: careerGoal,
                  personal: personalGoal,
                },
                additionalInfo,
              }}
              onComplete={handleBondPrintComplete}
              onSkip={() => {
                setShowQuiz(false);
                handleComplete();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
