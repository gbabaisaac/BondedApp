'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/TopBar';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Chip } from '@/components/shared/Chip';
import { 
  GraduationCap, MapPin, UserPlus, MessageCircle, 
  ChevronRight, Check, UserCheck, Clock 
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Mock data - TODO: Fetch real profile
  const profile = {
    id: params.id,
    name: 'Sarah Chen',
    age: 20,
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah2',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah3',
    ],
    year_level: 'Junior',
    major: 'Psychology',
    school: { short_name: 'University of Illinois' },
    connection_count: 312,
    mutual_friends_count: 15,
    group_count: 8,
    connection_status: null,
    compatibility: 87,
    interests: [
      { interest: 'Photography', emoji: '📷' },
      { interest: 'Travel', emoji: '✈️' },
      { interest: 'Art', emoji: '🎨' },
      { interest: 'Yoga', emoji: '🧘' },
    ],
    looking_for: ['friends', 'study_partners'],
    bond_print: {
      archetype: 'creative',
      archetype_name: 'The Creative',
    },
  };

  return (
    <>
      <TopBar showBack={true} showSearch={false} showNotifications={false} showMenu={true} />
      
      {/* Photo Gallery */}
      <div className="relative h-96 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] overflow-hidden">
        <Image
          src={profile.photos[currentPhotoIndex]}
          alt={`Photo ${currentPhotoIndex + 1}`}
          fill
          className="object-cover"
        />
        
        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {profile.photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPhotoIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentPhotoIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              )}
            />
          ))}
        </div>
        
        {/* Swipe Areas */}
        <div className="absolute inset-0 grid grid-cols-2">
          <button 
            onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
            className="hover:bg-black/10 transition-colors"
          />
          <button 
            onClick={() => setCurrentPhotoIndex(Math.min(profile.photos.length - 1, currentPhotoIndex + 1))}
            className="hover:bg-black/10 transition-colors"
          />
        </div>
      </div>
      
      {/* Profile Header */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          {/* Name & Verification */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {profile.name}, {profile.age}
            </h1>
            <div className="w-6 h-6 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {/* Quick Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)] mb-4">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {profile.year_level} • {profile.major}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile.school.short_name}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mb-6 pt-4 border-t border-[var(--border-light)]">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {profile.connection_count}
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">
                Connections
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {profile.mutual_friends_count}
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">
                Mutual
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {profile.group_count}
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">
                Groups
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button size="lg">
              {profile.connection_status === 'connected' ? (
                <>
                  <UserCheck className="mr-2 h-5 w-5" />
                  Connected
                </>
              ) : profile.connection_status === 'pending' ? (
                <>
                  <Clock className="mr-2 h-5 w-5" />
                  Pending
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Connect
                </>
              )}
            </Button>
            
            <Button size="lg" variant="secondary">
              <MessageCircle className="mr-2 h-5 w-5" />
              Message
            </Button>
          </div>
          
          {/* Bond Print Badge */}
          {profile.bond_print && profile.compatibility && (
            <Card className="border-2 border-[var(--primary)]/20 hover:border-[var(--primary)] transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🎨</div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {profile.bond_print.archetype_name}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        View Bond Print
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold gradient-text">
                      {profile.compatibility}%
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-medium">
                      Compatible
                    </div>
                  </div>
                  
                  <ChevronRight className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Profile Sections */}
      <div className="container mx-auto px-6 py-6 space-y-6 mb-20">
        {/* Interests */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <Chip key={i} variant="interest">
                  {interest.emoji} {interest.interest}
                </Chip>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Looking For */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Looking For
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.looking_for.map((item) => (
                <Chip key={item} variant="primary">
                  {item === 'friends' && '👥 Friends'}
                  {item === 'study_partners' && '📚 Study Partners'}
                </Chip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

