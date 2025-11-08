import { Users, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { theme } from '../utils/theme';

interface ModeToggleProps {
  mode: 'friend' | 'love';
  onChange: (mode: 'friend' | 'love') => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className={`${theme.components.navigation.header} px-4 py-4`}>
      <div className={`${theme.layout.maxWidth} mx-auto`}>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onChange('friend')}
            className={`flex-1 relative py-2.5 px-4 rounded-full ${theme.transition.default}`}
          >
            {mode === 'friend' && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 bg-white rounded-full shadow-md"
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Users className={`w-4 h-4 ${mode === 'friend' ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${mode === 'friend' ? 'text-indigo-600' : 'text-gray-500'}`}>
                Friend Mode
              </span>
            </div>
          </button>

          <button
            onClick={() => onChange('love')}
            className={`flex-1 relative py-2.5 px-4 rounded-full ${theme.transition.default}`}
          >
            {mode === 'love' && (
              <motion.div
                layoutId="mode-indicator"
                className={`absolute inset-0 bg-gradient-to-r ${theme.colors.love.gradient} rounded-full shadow-md`}
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Heart className={`w-4 h-4 ${mode === 'love' ? 'text-white' : 'text-gray-500'}`} />
              <span className={`font-medium ${mode === 'love' ? 'text-white' : 'text-gray-500'}`}>
                Love Mode
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
