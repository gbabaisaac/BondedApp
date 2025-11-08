import { ArrowLeft, Heart } from 'lucide-react';

interface LoveModeHeaderProps {
  onBack: () => void;
}

export function LoveModeHeader({ onBack }: LoveModeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-3 border-b border-pink-600">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Friend Mode</span>
        </button>
        
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-medium">Love Mode</span>
        </div>
      </div>
    </div>
  );
}
