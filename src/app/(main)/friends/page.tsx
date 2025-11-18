'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Users, UserPlus, Clock } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');

  return (
    <>
      <TopBar title="Connections" />
      
      <div className="sticky top-16 z-40 bg-white border-b border-[var(--border-light)]">
        <div className="container mx-auto px-4 flex">
          {[
            { id: 'friends' as const, label: 'Friends', icon: Users },
            { id: 'requests' as const, label: 'Requests', icon: Clock },
            { id: 'suggestions' as const, label: 'Suggestions', icon: UserPlus },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-colors font-semibold',
                  activeTab === tab.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-6">
        <Card className="p-6 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {activeTab === 'friends' && 'Your Friends'}
            {activeTab === 'requests' && 'Connection Requests'}
            {activeTab === 'suggestions' && 'People You May Know'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            This feature is coming soon!
          </p>
        </Card>
      </main>
    </>
  );
}

