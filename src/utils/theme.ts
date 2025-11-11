/**
 * Bonded Design System
 * Centralized theme constants for consistent styling across the app
 */

export const theme = {
  // Brand Colors - Bonded Design System
  colors: {
    // Primary Palette
    primary: {
      main: '#2E7B91', // Teal Blue - Primary brand color
      light: '#25658A', // Ocean Blue
      dark: '#1E4F74', // Royal Navy
      darkest: '#132E54', // Midnight Indigo
      gradient: 'linear-gradient(120deg, #2E7B91, #25658A, #1E4F74, #132E54)',
      gradientTailwind: 'from-[#2E7B91] via-[#25658A] to-[#1E4F74]',
    },
    // Accent Colors
    accent: {
      lavender: '#B69CFF', // Lavender Mist
      peach: '#FFB3C6', // Peach Glow
    },
    // Neutrals
    neutral: {
      cream: '#F9F6F3', // Soft Cream
      cloud: '#EAEAEA', // Cloud Gray
      navy: '#0E0E1A', // Deep Navy (dark mode)
    },
    // Legacy support (mapped to new colors)
    secondary: {
      main: '#25658A', // Ocean Blue
      light: '#2E7B91',
      dark: '#1E4F74',
    },
    love: {
      gradient: 'from-[#FFB3C6] to-[#B69CFF]', // Peach to Lavender
      gradientAlt: 'from-[#FFB3C650] via-[#B69CFF50] to-[#2E7B9150]',
    },
    friend: {
      gradient: 'from-[#2E7B91] to-[#25658A]', // Teal to Ocean
      gradientAlt: 'from-[#2E7B9150] to-[#25658A50]',
    },
    background: {
      main: 'from-[#F9F6F3] to-[#EAEAEA]', // Cream to Cloud
      love: 'from-[#FFB3C650] via-[#B69CFF50] to-[#2E7B9150]',
      friend: 'from-[#2E7B9150] to-[#25658A50]',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
      light: 'text-gray-400',
    },
    border: {
      default: 'border-gray-200',
      light: 'border-gray-100',
      medium: 'border-gray-300',
    },
  },

  // Spacing
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    gap: {
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },

  // Typography - Satoshi font family (Inter/Helvetica Neue fallback)
  typography: {
    fontFamily: 'Satoshi, Inter, "Helvetica Neue", sans-serif',
    logo: 'font-bold lowercase tracking-wide', // Lowercase for brand text
    h1: 'text-3xl font-bold lowercase tracking-wide',
    h2: 'text-2xl font-semibold lowercase tracking-wide',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base font-normal',
    small: 'text-sm font-normal',
    tiny: 'text-xs font-normal',
  },

  // Components
  components: {
    button: {
      primary: 'bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] text-white rounded-2xl shadow-md',
      love: 'bg-gradient-to-r from-[#FFB3C6] to-[#B69CFF] hover:from-[#FFB3C6] hover:to-[#B69CFF] text-white rounded-2xl shadow-md',
      secondary: 'bg-white border-2 border-[#EAEAEA] hover:border-[#2E7B91] text-[#1E4F74] rounded-2xl',
      ghost: 'hover:bg-[#F9F6F3] text-[#1E4F74] rounded-2xl',
    },
    card: {
      default: 'bg-white rounded-2xl border border-[#EAEAEA] shadow-sm',
      elevated: 'bg-white rounded-2xl shadow-lg border-0',
      interactive: 'bg-white rounded-2xl border-2 border-[#EAEAEA] hover:border-[#2E7B91] transition-all cursor-pointer',
    },
    input: {
      default: 'w-full px-4 py-3 border border-[#EAEAEA] rounded-2xl focus:ring-2 focus:ring-[#2E7B91] focus:border-[#2E7B91] bg-[#F9F6F3]',
    },
    navigation: {
      header: 'bg-white border-b border-[#EAEAEA]',
      bottom: 'fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAEAEA] z-50',
      tab: {
        active: 'text-[#2E7B91]',
        inactive: 'text-[#64748b] hover:text-[#1E4F74]',
      },
    },
    avatar: {
      default: 'bg-gradient-to-br from-[#2E7B91] to-[#25658A] text-white',
    },
  },

  // Layout
  layout: {
    maxWidth: 'max-w-2xl',
    container: 'max-w-7xl mx-auto px-4',
  },

  // Shadows - Subtle and soft
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    glow: 'shadow-[0_0_20px_rgba(46,123,145,0.15)]', // Subtle teal glow for AI elements
  },

  // Transitions
  transition: {
    default: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },
} as const;

// Helper function to get button classes
export const getButtonClass = (variant: 'primary' | 'love' | 'secondary' | 'ghost' = 'primary') => {
  return `${theme.components.button[variant]} ${theme.transition.default} px-6 py-3 font-medium`;
};

// Helper function to get card classes
export const getCardClass = (variant: 'default' | 'elevated' | 'interactive' = 'default') => {
  return theme.components.card[variant];
};
