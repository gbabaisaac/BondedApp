'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '@/components/navigation/TopBar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Users, Wifi, BookOpen, Sparkles, Grid3x3, List, Search, SlidersHorizontal, Bell, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

// Mock data - TODO: Replace with real API
const mockStudents = Array.from({ length: 30 }, (_, i) => {
  const emojis = ['🎓', '👤', '🌟', '💫', '✨', '⭐', '🔥', '💯', '🎨', '🎵'];
  const interests = ['Coding', 'Design', 'Music', 'Sports', 'Art', 'Gaming', 'Photography', 'Travel'];
  const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'];
  const majors = ['Computer Science', 'Engineering', 'Business', 'Psychology', 'Biology', 'Art'];
  
  return {
    id: `user-${i}`,
    name: `Student ${i + 1}`,
    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    emoji: emojis[i % emojis.length],
    major: majors[i % majors.length],
    year: years[i % years.length],
    interests: interests.slice(0, Math.floor(Math.random() * 3) + 1),
    is_online: Math.random() > 0.7,
    is_verified: Math.random() > 0.8,
    mutual_friends: Math.floor(Math.random() * 10),
    compatibility: Math.random() > 0.5 ? Math.floor(Math.random() * 30 + 70) : null,
  };
});

const YearFilter = ({ activeFilter, onChange }: { activeFilter: string; onChange: (id: string) => void }) => {
  const filters = [
    { id: 'all', label: '🎓 All Years', count: 2847 },
    { id: 'freshman', label: 'Freshman', count: 742 },
    { id: 'sophomore', label: 'Sophomore', count: 698 },
    { id: 'junior', label: 'Junior', count: 721 },
    { id: 'senior', label: 'Senior', count: 586 },
    { id: 'grad', label: 'Grad', count: 100 },
  ];
  
  return (
    <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            variant="filter"
            selected={activeFilter === filter.id}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
            <span className="ml-1.5 opacity-70">({filter.count})</span>
          </Chip>
        ))}
      </div>
    </div>
  );
};

const StatsBar = () => {
  const stats = [
    { label: 'Students', value: 2847, icon: Users },
    { label: 'Online', value: 247, icon: Wifi },
    { label: 'Majors', value: 47, icon: BookOpen },
    { label: 'Clubs', value: 89, icon: Sparkles },
  ];
  
  return (
    <div className="gradient-bg text-white">
      <div className="container mx-auto px-4 py-4">
        <motion.div 
          className="grid grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="h-4 w-4" />
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                </div>
                <div className="text-xs opacity-90 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};


export default function YearbookPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const { school } = useTheme();
  const router = useRouter();
  
  const navigateToProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };
  
  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar - Fixed */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">Yearbook</h1>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 gradient-bg text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Year Filter - Sticky */}
      <YearFilter activeFilter={activeFilter} onChange={setActiveFilter} />
      
      {/* Stats Bar */}
      <StatsBar />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            2,847 Students
          </h2>
          <div className="flex gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Student Grid */}
        <div className="px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Class of 2025</h2>
            <div className="flex gap-2">
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setView('grid')}
                className={view === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : ''}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mockStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => navigateToProfile(student.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm h-[240px] flex flex-col"
                >
                  {/* Image/Gradient Section - ALWAYS 128px */}
                  <div className="h-32 shrink-0 bg-gradient-to-br from-pink-400 to-purple-500 relative">
                    {student.profileImage ? (
                      <img 
                        src={student.profileImage} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {student.emoji || '🎓'}
                      </div>
                    )}
                    
                    {/* Mutual Friends Badge */}
                    {student.mutual_friends > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-gray-800 text-xs font-bold shadow-lg">
                        {student.mutual_friends} mutual
                      </div>
                    )}
                    
                    {/* Online Indicator */}
                    {student.is_online && (
                      <div className="absolute top-2 left-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
                    )}
                  </div>

                  {/* Info Section - White background */}
                  <div className="p-3 flex-1 flex flex-col items-start text-left bg-white">
                    <h3 className="font-bold text-sm mb-1 truncate w-full">{student.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate w-full">
                      {student.year} • {student.major}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {student.interests?.slice(0, 2).map((interest, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-xs font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                      {student.interests && student.interests.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          +{student.interests.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
            ))}
          </div>
        </div>
        
        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="secondary" size="lg">
            Load More Students
          </Button>
        </div>
      </main>
    </div>
  );
}
