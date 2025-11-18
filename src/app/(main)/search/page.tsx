'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Input } from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';
import { Search, TrendingUp, Hash, X } from 'lucide-react';
import { Button } from '@/components/shared/Button';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'students' | 'posts'>('all');
  
  const trendingSearches = [
    '#campus',
    '#events',
    '#studygroup',
    'Computer Science',
    'Psychology',
  ];
  
  const recentSearches = [
    'Sarah Chen',
    '#party',
    'Study buddies',
  ];

  return (
    <>
      <TopBar showBack={true} showSearch={false} showNotifications={false} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search students, posts, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-xl border-2 border-[var(--border-light)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-base transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5 text-[var(--text-tertiary)]" />
            </button>
          )}
        </div>
        
        {/* Search Type Toggle */}
        <div className="flex gap-2 mb-6">
          {['all', 'students', 'posts'].map((type) => (
            <Button
              key={type}
              variant={searchType === type ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSearchType(type as any)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        
        {!searchQuery && (
          <>
            {/* Trending */}
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Trending
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
                  >
                    {search.startsWith('#') ? (
                      <Hash className="inline h-3 w-3 mr-1" />
                    ) : null}
                    {search}
                  </button>
                ))}
              </div>
            </Card>
            
            {/* Recent */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Recent Searches
                </h3>
                <Button variant="ghost" size="sm">
                  Clear
                </Button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(search)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                  >
                    <span className="text-[var(--text-primary)] font-medium">
                      {search}
                    </span>
                    <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}
        
        {searchQuery && (
          <Card className="p-8 text-center">
            <Search className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Search Results
            </h3>
            <p className="text-[var(--text-secondary)]">
              Search functionality coming soon!
            </p>
          </Card>
        )}
      </main>
    </>
  );
}

