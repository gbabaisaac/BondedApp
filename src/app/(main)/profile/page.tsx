'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/TopBar';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Chip } from '@/components/shared/Chip';
import { 
  Settings, Share2, GraduationCap, MapPin, 
  Users, MessageCircle, ChevronRight 
} from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();

  // Mock user data - TODO: Get from auth
  const user = {
    name: 'Alex Johnson',
    age: 21,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    cover_photo_url: null,
    year_level: 'Junior',
    major: 'Computer Science',
    school: { short_name: 'University of Illinois' },
    connection_count: 234,
    mutual_friends: 45,
    group_count: 12,
    interests: [
      { interest: 'Coding', emoji: '💻' },
      { interest: 'Music', emoji: '🎵' },
      { interest: 'Travel', emoji: '✈️' },
      { interest: 'Photography', emoji: '📷' },
    ],
  };

  return (
    <>
      <TopBar
        title="Profile"
        showBack={false}
        showSearch={false}
        rightAction={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        }
      />
      
      <main className="container mx-auto">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
          {user.cover_photo_url && (
            <Image
              src={user.cover_photo_url}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>
        
        {/* Profile Header */}
        <div className="bg-white rounded-t-3xl -mt-6 relative z-10 shadow-lg">
          <div className="px-6 pt-6 pb-4">
            {/* Avatar */}
            <div className="flex items-end gap-4 -mt-16 mb-4">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-xl">
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button className="mb-2">
                Edit Profile
              </Button>
            </div>
            
            {/* Name & Info */}
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {user.name}, {user.age}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)] mb-4">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {user.year_level} • {user.major}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.school.short_name}
              </span>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 py-4 border-y border-[var(--border-light)]">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  {user.connection_count}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  Connections
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  {user.mutual_friends}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  Mutual
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  {user.group_count}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  Groups
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Sections */}
        <div className="px-6 py-6 space-y-6">
          {/* Interests */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, i) => (
                  <Chip key={i} variant="interest">
                    {interest.emoji} {interest.interest}
                  </Chip>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[var(--primary)]" />
                  <span className="font-semibold text-[var(--text-primary)]">
                    My Connections
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
              
              <div className="border-t border-[var(--border-light)]" />
              
              <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
                  <span className="font-semibold text-[var(--text-primary)]">
                    Messages
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

