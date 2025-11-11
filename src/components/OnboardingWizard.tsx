import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingWizardProps {
  userEmail: string;
  userName: string;
  userSchool: string;
  accessToken: string;
  onComplete: (profile: any) => void;
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

export function OnboardingWizard({ userEmail, userName, userSchool, accessToken, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  // Step 1: School Selection
  const [school, setSchool] = useState(userSchool === 'Pending' ? '' : userSchool);
  
  // Step 2: Basic Info
  const [name, setName] = useState(userName || '');
  const [age, setAge] = useState('');
  const [major, setMajor] = useState('');
  const [customMajor, setCustomMajor] = useState('');
  const [year, setYear] = useState('');
  
  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Step 4: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Step 5: Personality
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  
  // Step 6: Living Habits
  const [sleepSchedule, setSleepSchedule] = useState('');
  const [cleanliness, setCleanliness] = useState('');
  const [guests, setGuests] = useState('');
  const [noise, setNoise] = useState('');
  
  // Step 7: Bio
  const [bio, setBio] = useState('');
  
  // Step 8: Looking For
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  
  // Step 9: Future Goals (Optional)
  const [academicGoals, setAcademicGoals] = useState<string[]>([]);
  const [leisureGoals, setLeisureGoals] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [personalGoal, setPersonalGoal] = useState('');
  const [customAcademicGoal, setCustomAcademicGoal] = useState('');
  const [customLeisureGoal, setCustomLeisureGoal] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    // Validation
    if (step === 1 && !school) {
      toast.error('Please select your school');
      return;
    }
    if (step === 2 && (!name || !age || !major || !year)) {
      toast.error('Please fill in all fields');
      return;
    }
    if (step === 3 && photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }
    if (step === 4 && selectedInterests.length < 3) {
      toast.error('Please select at least 3 interests');
      return;
    }
    if (step === 5 && selectedTraits.length < 3) {
      toast.error('Please select at least 3 personality traits');
      return;
    }
    if (step === 6 && (!sleepSchedule || !cleanliness || !guests || !noise)) {
      toast.error('Please answer all living habit questions');
      return;
    }
    if (step === 7 && bio.length < 20) {
      toast.error('Please write a bio (at least 20 characters)');
      return;
    }
    if (step === 8 && lookingFor.length === 0) {
      toast.error('Please select what you\'re looking for');
      return;
    }
    // Step 9 is optional, no validation needed

    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleComplete();
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

      const profileData = {
        name,
        school,
        age: parseInt(age),
        major: major === 'Other' ? customMajor : major,
        year,
        bio,
        interests: selectedInterests,
        personality: selectedTraits,
        lookingFor: lookingFor.map(item => {
          // Extract the text without emoji
          return item.replace(/^[^\s]+\s/, '').toLowerCase().replace(/ /g, '-');
        }),
        photos,
        profilePicture: photos[0] || '',
        sleepSchedule,
        cleanliness,
        guests,
        noise,
        goals: {
          academic: processedAcademicGoals,
          leisure: processedLeisureGoals,
          career: careerGoal.trim() || undefined,
          personal: personalGoal.trim() || undefined,
        },
        additionalInfo: additionalInfo.trim() || undefined,
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
        throw new Error('Failed to save profile');
      }

      const profile = await response.json();
      toast.success('Profile created! 🎉');
      onComplete(profile);
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile');
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
      className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col"
      style={{
        height: '100vh',
        height: '100dvh',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
      }}
    >
      {/* Header with Progress */}
      <div className="bg-white border-b px-4 py-4 flex-shrink-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl">Create Your Profile</h2>
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="max-w-2xl mx-auto">
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
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">Let's start with the basics</h3>
                      <p className="text-sm text-gray-600">Tell us about yourself</p>
                    </div>

                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter your age"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="major">Major</Label>
                      <select
                        id="major"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select your major</option>
                        {MAJORS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {major === 'Other' && (
                        <Input
                          className="mt-2"
                          value={customMajor}
                          onChange={(e) => setCustomMajor(e.target.value)}
                          placeholder="Enter your major"
                        />
                      )}
                    </div>

                    <div>
                      <Label htmlFor="year">Year</Label>
                      <select
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select your year</option>
                        {YEARS.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 text-sm text-gray-700">
                      📍 School: <span className="font-medium">{school}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Photos */}
              {step === 3 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Camera className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">Add your photos</h3>
                      <p className="text-sm text-gray-600">Upload 1-6 photos (first photo will be your profile picture)</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square">
                          <img 
                            src={photo} 
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                              Profile
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {photos.length < 6 && (
                        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Upload</span>
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

                    {uploading && (
                      <p className="text-center text-sm text-purple-600">Uploading...</p>
                    )}

                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
                      💡 Tip: Choose clear photos that show your personality!
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Interests */}
              {step === 4 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Heart className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">What are you into?</h3>
                      <p className="text-sm text-gray-600">Select 3-10 interests</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(interest => (
                        <Badge
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`cursor-pointer transition-all ${
                            selectedInterests.includes(interest)
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {interest}
                          {selectedInterests.includes(interest) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-center text-gray-500">
                      {selectedInterests.length} selected
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Personality */}
              {step === 5 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">Describe your personality</h3>
                      <p className="text-sm text-gray-600">Select 3-8 traits that fit you</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {PERSONALITY_TRAITS.map(trait => (
                        <Badge
                          key={trait}
                          onClick={() => toggleTrait(trait)}
                          className={`cursor-pointer transition-all ${
                            selectedTraits.includes(trait)
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {trait}
                          {selectedTraits.includes(trait) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-center text-gray-500">
                      {selectedTraits.length} selected
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Step 6: Living Habits */}
              {step === 6 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Moon className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">Living preferences</h3>
                      <p className="text-sm text-gray-600">Help potential roommates know your style</p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        {sleepSchedule === 'early' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        Sleep Schedule
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={sleepSchedule === 'early' ? 'default' : 'outline'}
                          onClick={() => setSleepSchedule('early')}
                          className="gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          Early Bird
                        </Button>
                        <Button
                          type="button"
                          variant={sleepSchedule === 'night' ? 'default' : 'outline'}
                          onClick={() => setSleepSchedule('night')}
                          className="gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          Night Owl
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        Cleanliness Level
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['neat', 'moderate', 'relaxed'].map(level => (
                          <Button
                            key={level}
                            type="button"
                            variant={cleanliness === level ? 'default' : 'outline'}
                            onClick={() => setCleanliness(level)}
                            className="capitalize"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Guests Policy
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['often', 'sometimes', 'rarely'].map(freq => (
                          <Button
                            key={freq}
                            type="button"
                            variant={guests === freq ? 'default' : 'outline'}
                            onClick={() => setGuests(freq)}
                            className="capitalize"
                          >
                            {freq}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4" />
                        Noise Tolerance
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['quiet', 'moderate', 'lively'].map(level => (
                          <Button
                            key={level}
                            type="button"
                            variant={noise === level ? 'default' : 'outline'}
                            onClick={() => setNoise(level)}
                            className="capitalize"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 7: Bio */}
              {step === 7 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">Tell your story</h3>
                      <p className="text-sm text-gray-600">Write a short bio about yourself</p>
                    </div>

                    <div>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Hi! I'm a [major] student who loves [interests]. Looking to connect with people who are into [activities]. Fun fact about me: [something unique]..."
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {bio.length} / 500 characters
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 text-sm text-gray-700">
                      💡 Tip: Be authentic and show your personality!
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 8: Looking For */}
              {step === 8 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center mb-4">
                      <Users className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">What brings you here?</h3>
                      <p className="text-sm text-gray-600">Select all that apply</p>
                    </div>

                    <div className="space-y-2">
                      {LOOKING_FOR_OPTIONS.map(option => (
                        <button
                          key={option}
                          onClick={() => toggleLookingFor(option)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            lookingFor.includes(option)
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option}</span>
                            {lookingFor.includes(option) && (
                              <Check className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 9: Future Goals (Optional) */}
              {step === 9 && (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center mb-4">
                      <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-xl mb-1">What are your goals?</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Help us connect you with like-minded people on campus
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Optional - You can skip this step
                      </Badge>
                    </div>

                    {/* Academic Goals */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Academic Goals
                      </Label>
                      <div className="space-y-2">
                        {ACADEMIC_GOALS.map(goal => (
                          <button
                            key={goal}
                            onClick={() => toggleAcademicGoal(goal)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              academicGoals.includes(goal)
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{goal}</span>
                              {academicGoals.includes(goal) && (
                                <Check className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {academicGoals.includes('Other') && (
                        <Input
                          placeholder="Describe your academic goal..."
                          value={customAcademicGoal}
                          onChange={(e) => setCustomAcademicGoal(e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* Leisure Goals */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Leisure Goals
                      </Label>
                      <div className="space-y-2">
                        {LEISURE_GOALS.map(goal => (
                          <button
                            key={goal}
                            onClick={() => toggleLeisureGoal(goal)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              leisureGoals.includes(goal)
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{goal}</span>
                              {leisureGoals.includes(goal) && (
                                <Check className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {leisureGoals.includes('Other') && (
                        <Input
                          placeholder="Describe your leisure goal..."
                          value={customLeisureGoal}
                          onChange={(e) => setCustomLeisureGoal(e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* Career Goal */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        Career Goal (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., Software Engineer at Google, Medical School, Start my own business"
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                      />
                    </div>

                    {/* Personal Goal */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        Personal Goal (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., Get fit, Learn Spanish, Read more books"
                        value={personalGoal}
                        onChange={(e) => setPersonalGoal(e.target.value)}
                      />
                    </div>

                    {/* Additional Info */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        Anything else we should know? (Optional)
                      </Label>
                      <Textarea
                        placeholder="Tell us anything else that would help our AI match you with the right people... (e.g., hobbies, values, what you're looking for in connections, etc.)"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 This helps our AI understand you better and make more personalized connection suggestions
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                      💡 <strong>Note:</strong> Class schedule matching for study partners will be available soon!
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div
        className="bg-white border-t px-4 flex-shrink-0 z-10"
        style={{
          paddingTop: '1rem',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {step === totalSteps ? 'Complete' : step === 9 ? 'Skip or Complete' : 'Next'}
            {step < totalSteps && <ArrowRight className="w-4 h-4" />}
            {step === totalSteps && <Check className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
