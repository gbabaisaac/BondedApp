import { ArrowLeft, Heart } from 'lucide-react';
import { theme } from '../utils/theme';

interface LoveModeHeaderProps {
  onBack: () => void;
}

export function LoveModeHeader({ onBack }: LoveModeHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${theme.colors.love.gradient} text-white px-4 py-4 border-b border-pink-600 flex-shrink-0`}>
      <div className={`${theme.layout.maxWidth} mx-auto flex items-center justify-between`}>
        <button
          onClick={onBack}
          className={`flex items-center ${theme.spacing.gap.sm} hover:bg-white/10 rounded-lg px-3 py-2 ${theme.transition.default}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Friend Mode</span>
        </button>

        <div className={`flex items-center ${theme.spacing.gap.sm}`}>
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-semibold">Love Mode</span>
        </div>
      </div>
    </div>
  );
}
