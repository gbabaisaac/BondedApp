// Design System for Bonded App
// Consistent styling for college-age students

import {
  Heart,
  MessageCircle,
  Sparkles,
  Mic,
  Eye,
  Calendar,
  Users,
  Home,
  BookOpen,
  Lightbulb,
  Handshake,
  PartyPopper,
  Dumbbell,
  UtensilsCrossed,
  Palette,
  Book,
  Gamepad2,
  Music,
  Plane,
  Activity,
  ChefHat,
  Camera,
  Film,
  Dribbble,
  Drama,
  Code,
  Sprout,
  PersonStanding,
  Tickets,
  PenTool,
  Guitar,
  Trees,
  Sparkle,
  Pizza,
  Dog,
  Mic2,
  Waves,
  Bike,
  Mountain,
  Tv,
  Dice5,
  Coffee,
  Wine,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  Shield,
  Lock,
  MapPin,
  Send,
  X,
  ArrowRight,
  ArrowLeft,
  LucideIcon
} from 'lucide-react';

// Brand Colors
export const colors = {
  // Primary brand color (indigo)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // Love Mode (pink)
  love: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Main
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  
  // Friend Mode (indigo - same as primary)
  friend: {
    500: '#6366f1',
  },
  
  // Success (green)
  success: {
    500: '#10b981',
    600: '#059669',
  },
  
  // Warning (amber)
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Error (red)
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Neutral grays
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Icon mapping for interests (replaces emojis)
export const interestIcons: Record<string, LucideIcon> = {
  'Art': Palette,
  'Reading': Book,
  'Gaming': Gamepad2,
  'Music': Music,
  'Travel': Plane,
  'Fitness': Activity,
  'Cooking': ChefHat,
  'Photography': Camera,
  'Movies': Film,
  'Sports': Dribbble,
  'Theater': Drama,
  'Tech': Code,
  'Sustainability': Sprout,
  'Yoga': PersonStanding,
  'Events': Tickets,
  'Writing': PenTool,
  'Playing Music': Guitar,
  'Outdoors': Trees,
  'Crafts': Sparkle,
  'Food': Pizza,
  'Pets': Dog,
  'Karaoke': Mic2,
  'Swimming': Waves,
  'Cycling': Bike,
  'Climbing': Mountain,
  'TV Shows': Tv,
  'Board Games': Dice5,
  'Coffee': Coffee,
  'Wine': Wine,
  'Trying New Foods': Utensils,
};

// Connection reason icons (replaces emojis)
export const connectionIcons: Record<string, LucideIcon> = {
  'friends': Users,
  'roommate': Home,
  'study': BookOpen,
  'collaborate': Lightbulb,
  'network': Handshake,
  'event': PartyPopper,
  'workout': Dumbbell,
  'dining': UtensilsCrossed,
};

// Love Mode stage icons
export const loveStageIcons = {
  1: { icon: MessageCircle, label: 'Anonymous Chat' },
  2: { icon: Mic, label: 'Voice Exchange' },
  3: { icon: Eye, label: 'Reveal Stage' },
  4: { icon: Heart, label: 'Bonded Date' },
};

// Status icons
export const statusIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

// Common gradients
export const gradients = {
  primary: 'from-indigo-600 to-indigo-700',
  love: 'from-pink-600 to-rose-600',
  success: 'from-emerald-600 to-green-600',
  warning: 'from-amber-500 to-orange-500',
  
  // Soft backgrounds
  primarySoft: 'from-indigo-50 to-purple-50',
  loveSoft: 'from-pink-50 to-rose-50',
};

// Shadow styles
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

// Border radius
export const radius = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

// Common component styles
export const componentStyles = {
  card: 'bg-white rounded-xl shadow-sm border border-gray-200',
  cardHover: 'hover:shadow-md transition-shadow duration-200',
  button: 'inline-flex items-center justify-center gap-2 transition-all duration-200',
  input: 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  badge: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
};

// Toast messages (no emojis)
export const toastMessages = {
  connectionAccepted: 'Connection accepted! You can now chat.',
  lovePrintComplete: 'Love Print completed! You\'ll get better AI matches.',
  ratingSubmitted: 'Rating submitted',
  profileCreated: 'Profile created successfully',
  introSent: 'Intro sent',
  bondPrintReady: 'Your Bond Print is ready',
  loveModeActivated: 'Welcome to Love Mode',
  messageSent: 'Message sent',
};

// Helper function to get interest icon
export function getInterestIcon(interest: string): LucideIcon {
  // Remove emoji if present and get clean text
  const cleanInterest = interest.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  
  // Find matching icon
  for (const [key, icon] of Object.entries(interestIcons)) {
    if (cleanInterest.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  // Default to star
  return Star;
}

// Helper function to get connection icon
export function getConnectionIcon(type: string): LucideIcon {
  return connectionIcons[type] || Users;
}
