import { ReactNode } from 'react';
import { Heart, MessageCircle, User, Star } from 'lucide-react';

interface LoveModeLayoutProps {
  children: ReactNode;
  activeTab: 'discover' | 'matches' | 'profile';
  onTabChange: (tab: 'discover' | 'matches' | 'profile') => void;
}

export function LoveModeLayout({ children, activeTab, onTabChange }: LoveModeLayoutProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => onTabChange('discover')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'discover'
                  ? 'text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className={`w-6 h-6 ${activeTab === 'discover' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Discover</span>
            </button>

            <button
              onClick={() => onTabChange('matches')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'matches'
                  ? 'text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className={`w-6 h-6 ${activeTab === 'matches' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Matches</span>
            </button>

            <button
              onClick={() => onTabChange('profile')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
