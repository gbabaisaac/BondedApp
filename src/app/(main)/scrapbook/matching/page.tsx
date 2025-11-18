'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Heart, X, Star, Info, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Mock profiles for scrapbook
const mockProfiles = [
  {
    id: 1,
    age: 21,
    year_level: 'Junior',
    major: 'Psychology',
    interests: ['Art', 'Music', 'Travel'],
    bio_snippet: 'Love exploring new coffee shops ☕',
    compatibility: 87,
    reveal_level: 1, // 1 = blurred, 2 = partial, 3 = full
  },
  {
    id: 2,
    age: 20,
    year_level: 'Sophomore',
    major: 'Engineering',
    interests: ['Hiking', 'Photography', 'Cooking'],
    bio_snippet: 'Weekend warrior 🏔️',
    compatibility: 92,
    reveal_level: 1,
  },
];

export default function ScrapbookMatchingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentProfile = mockProfiles[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockProfiles.length);
      setDirection(null);
    }, 300);
  };

  if (!currentProfile) {
    return (
      <>
        <TopBar title="Scrapbook" showBack={true} />
        <main className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              No More Profiles
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Check back later for new matches!
            </p>
            <Button size="lg" onClick={() => window.location.href = '/scrapbook'}>
              Back to Scrapbook
            </Button>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Love Mode 💕" showBack={true} showSearch={false} showNotifications={false} />

      <main className="container max-w-md mx-auto px-4 py-6">
        {/* Compatibility Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="h-5 w-5 text-[var(--accent)]" />
          <span className="text-lg font-bold gradient-text">
            {currentProfile.compatibility}% Match
          </span>
        </div>

        {/* Profile Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
              rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              {/* Blurred Photo */}
              <div className="relative h-96 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentProfile.id}`}
                  alt="Profile"
                  fill
                  className="object-cover blur-3xl opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <div className="text-8xl mb-4">👤</div>
                    <p className="text-lg font-semibold">Photo Hidden</p>
                    <p className="text-sm opacity-90">Match to reveal gradually</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Basic Info */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {currentProfile.year_level}, {currentProfile.age}
                  </h2>
                  <p className="text-[var(--text-secondary)] font-medium">
                    {currentProfile.major}
                  </p>
                </div>

                {/* Bio Snippet */}
                <div className="mb-4 p-3 bg-[var(--primary)]/5 rounded-xl">
                  <p className="text-[var(--text-primary)] italic">
                    "{currentProfile.bio_snippet}"
                  </p>
                </div>

                {/* Interests */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                    Shared Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border-2 border-[var(--primary)] text-[var(--primary)] text-sm font-semibold rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Info Notice */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Photos reveal gradually as you chat. Focus on personality first! 💫
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white border-4 border-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <X className="w-8 h-8 text-red-500" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          >
            <Star className="w-10 h-10 text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-white border-4 border-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart className="w-8 h-8 text-green-500" />
          </motion.button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center text-sm">
          <div>
            <X className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <span className="text-[var(--text-secondary)]">Pass</span>
          </div>
          <div>
            <Star className="w-5 h-5 text-[var(--accent)] mx-auto mb-1" />
            <span className="text-[var(--text-secondary)]">Super Like</span>
          </div>
          <div>
            <Heart className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <span className="text-[var(--text-secondary)]">Like</span>
          </div>
        </div>
      </main>
    </>
  );
}

