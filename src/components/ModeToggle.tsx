import { Users, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ModeToggleProps {
  mode: 'friend' | 'love';
  onChange: (mode: 'friend' | 'love') => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onChange('friend')}
            className="flex-1 relative py-2 px-4 rounded-full transition-colors"
          >
            {mode === 'friend' && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Users className={`w-4 h-4 ${mode === 'friend' ? 'text-purple-600' : 'text-gray-500'}`} />
              <span className={mode === 'friend' ? 'text-purple-600' : 'text-gray-500'}>
                Friend Mode
              </span>
            </div>
          </button>
          
          <button
            onClick={() => onChange('love')}
            className="flex-1 relative py-2 px-4 rounded-full transition-colors"
          >
            {mode === 'love' && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-sm"
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Heart className={`w-4 h-4 ${mode === 'love' ? 'text-white' : 'text-gray-500'}`} />
              <span className={mode === 'love' ? 'text-white' : 'text-gray-500'}>
                Love Mode
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
