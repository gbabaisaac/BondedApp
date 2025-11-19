'use client';

import React from 'react';
// Navigation handled by MobileLayout
import { motion } from 'framer-motion';
import { Home, MessageCircle, Users, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    id: 'yearbook',
    icon: Home, 
    label: 'Yearbook', 
    href: '/yearbook',
    activePattern: /^\/yearbook/
  },
  { 
    id: 'forum',
    icon: MessageCircle, 
    label: 'Forum', 
    href: '/forum',
    activePattern: /^\/forum/
  },
  { 
    id: 'friends',
    icon: Users, 
    label: 'Friends', 
    href: '/friends',
    activePattern: /^\/friends/
  },
  { 
    id: 'scrapbook',
    icon: Heart, 
    label: 'Scrapbook', 
    href: '/scrapbook',
    activePattern: /^\/scrapbook/
  },
  { 
    id: 'profile',
    icon: User, 
    label: 'Profile', 
    href: '/profile',
    activePattern: /^\/profile/
  },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-border shadow-lg safe-area-bottom" style={{ position: 'fixed', zIndex: 9999 }}>
      <div className="container mx-auto px-2 h-20 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activePattern.test(pathname);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground group-hover:text-primary'
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full gradient-bg"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-semibold mt-1 transition-colors',
                  isActive 
                    ? 'gradient-text' 
                    : 'text-muted-foreground group-hover:text-primary'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
