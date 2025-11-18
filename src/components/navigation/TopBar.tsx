'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Bell, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/shared/Button';

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
  const router = useRouter();
  const [unreadCount] = React.useState(3); // TODO: Connect to real notifications

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[var(--border-light)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/search')}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              {showFilters && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {/* TODO: Open filters */}}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              )}
              {showNotifications && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/notifications')}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--error)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              )}
              {showMenu && (
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

