import React from 'react';
import { Search, SlidersHorizontal, Bell, ArrowLeft, MoreVertical } from 'lucide-react';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'Bonded',
  showBack = false,
  showSearch = true,
  showFilters = false,
  showNotifications = true,
  showMenu = false,
  onBack,
  rightAction,
}) => {
  const [unreadCount] = React.useState(3); // TODO: Connect to real notifications

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[var(--border-light)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-xl font-bold gradient-text">
                {title}
              </h1>
            </>
          )}
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {rightAction || (
            <>
              {showSearch && (
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => {/* TODO: Navigate to search */}}
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
              {showFilters && (
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => {/* TODO: Open filters */}}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              )}
              {showNotifications && (
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                  onClick={() => {/* TODO: Navigate to notifications */}}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--error)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              {showMenu && (
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

