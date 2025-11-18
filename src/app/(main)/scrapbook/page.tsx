'use client';

import React from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Heart, Sparkles } from 'lucide-react';

export default function ScrapbookPage() {
  return (
    <>
      <TopBar title="Scrapbook" />
      
      <main className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">💕</div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Welcome to Love Mode
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Connect with people through blind chats, voice messages, and gradual reveals. Find meaningful connections based on personality, not photos.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Button size="lg" fullWidth>
              <Heart className="mr-2 h-5 w-5" />
              Start Matching
            </Button>
            <Button size="lg" variant="secondary" fullWidth>
              <Sparkles className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </Card>
      </main>
    </>
  );
}

