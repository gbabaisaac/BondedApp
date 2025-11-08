/**
 * Bonded Design System
 * Centralized theme constants for consistent styling across the app
 */

export const theme = {
  // Brand Colors
  colors: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      gradient: 'from-indigo-600 to-purple-600',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#db2777',
    },
    love: {
      gradient: 'from-pink-500 to-red-500',
      gradientAlt: 'from-pink-50 via-purple-50 to-red-50',
    },
    friend: {
      gradient: 'from-purple-600 to-pink-600',
      gradientAlt: 'from-purple-50 to-pink-50',
    },
    background: {
      main: 'from-blue-50 to-purple-50',
      love: 'from-pink-50 via-purple-50 to-red-50',
      friend: 'from-purple-50 to-pink-50',
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

  // Typography
  typography: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base',
    small: 'text-sm',
    tiny: 'text-xs',
  },

  // Components
  components: {
    button: {
      primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
      love: 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white',
      secondary: 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700',
      ghost: 'hover:bg-gray-100 text-gray-700',
    },
    card: {
      default: 'bg-white rounded-xl border border-gray-200 shadow-sm',
      elevated: 'bg-white rounded-xl shadow-lg border-0',
      interactive: 'bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-all cursor-pointer',
    },
    input: {
      default: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
    },
    navigation: {
      header: 'bg-white border-b border-gray-200',
      bottom: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50',
      tab: {
        active: 'text-indigo-600',
        inactive: 'text-gray-400 hover:text-gray-600',
      },
    },
    avatar: {
      default: 'bg-gradient-to-br from-indigo-400 to-purple-400 text-white',
    },
  },

  // Layout
  layout: {
    maxWidth: 'max-w-2xl',
    container: 'max-w-7xl mx-auto px-4',
  },

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },

  // Transitions
  transition: {
    default: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },
} as const;

// Helper function to get button classes
export const getButtonClass = (variant: 'primary' | 'love' | 'secondary' | 'ghost' = 'primary') => {
  return `${theme.components.button[variant]} ${theme.transition.default} px-6 py-3 rounded-lg font-medium`;
};

// Helper function to get card classes
export const getCardClass = (variant: 'default' | 'elevated' | 'interactive' = 'default') => {
  return theme.components.card[variant];
};
