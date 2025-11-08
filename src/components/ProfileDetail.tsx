import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  MessageCircle,
  GraduationCap,
  MapPin,
  Heart,
  Moon,
  Sun,
  Sparkles,
  Users,
  Volume2,
  Instagram,
  Twitter,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileDetailProps {
  profile: any;
  userProfile: any;
  accessToken: string;
  onClose: () => void;
}

export function ProfileDetail({
  profile,
  userProfile,
  accessToken,
  onClose,
}: ProfileDetailProps) {
  const [isStartingChat, setIsStartingChat] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStartChat = async () => {
    setIsStartingChat(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            otherUserId: profile.id,
          }),
        }
      );

      if (response.ok) {
        alert('Chat started! Go to Messages to continue the conversation.');
        onClose();
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const getSleepIcon = () => {
    if (profile.livingHabits?.sleepSchedule === 'early') return <Sun className="w-4 h-4" />;
    if (profile.livingHabits?.sleepSchedule === 'night') return <Moon className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6 pr-6">
            {/* Header */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg -mx-6 -mt-6" />
              <Avatar className="w-24 h-24 border-4 border-white absolute -bottom-12 left-4">
                <AvatarImage src={profile.profilePicture} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="pt-14">
              <h2 className="text-2xl mb-2">{profile.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{profile.year || 'Student'}</span>
                </div>
                {profile.major && <span>• {profile.major}</span>}
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.school}</span>
                </div>
              </div>

              <Button onClick={handleStartChat} disabled={isStartingChat} className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                {isStartingChat ? 'Starting Chat...' : 'Start Chat'}
              </Button>
            </div>

            <Separator />

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-lg mb-2">About</h3>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {profile.lookingFor && profile.lookingFor.length > 0 && (
              <div>
                <h3 className="text-lg mb-2">Looking For</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((item: string) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-lg mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Personality */}
            {profile.personality && profile.personality.length > 0 && (
              <div>
                <h3 className="text-lg mb-2">Personality</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.personality.map((trait: string) => (
                    <Badge key={trait}>{trait}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Living Habits */}
            {profile.livingHabits && (
              <div>
                <h3 className="text-lg mb-3">Living Habits</h3>
                <div className="grid grid-cols-2 gap-4">
                  {profile.livingHabits.sleepSchedule && (
                    <div className="flex items-center gap-2 text-sm">
                      {getSleepIcon()}
                      <div>
                        <p className="text-gray-500">Sleep</p>
                        <p className="capitalize">{profile.livingHabits.sleepSchedule}</p>
                      </div>
                    </div>
                  )}
                  {profile.livingHabits.cleanliness && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <div>
                        <p className="text-gray-500">Cleanliness</p>
                        <p className="capitalize">{profile.livingHabits.cleanliness}</p>
                      </div>
                    </div>
                  )}
                  {profile.livingHabits.guests && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      <div>
                        <p className="text-gray-500">Guests</p>
                        <p className="capitalize">{profile.livingHabits.guests}</p>
                      </div>
                    </div>
                  )}
                  {profile.livingHabits.noise && (
                    <div className="flex items-center gap-2 text-sm">
                      <Volume2 className="w-4 h-4" />
                      <div>
                        <p className="text-gray-500">Noise</p>
                        <p className="capitalize">{profile.livingHabits.noise}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Religion */}
            {profile.religion && (
              <div>
                <h3 className="text-lg mb-2">Religion</h3>
                <p className="text-gray-700">{profile.religion}</p>
              </div>
            )}

            {/* Social Media */}
            {profile.socials && (
              <div>
                <h3 className="text-lg mb-3">Social Media</h3>
                <div className="space-y-2">
                  {profile.socials.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      {profile.socials.instagram}
                    </a>
                  )}
                  {profile.socials.twitter && (
                    <a
                      href={`https://x.com/${profile.socials.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Twitter className="w-4 h-4" />
                      {profile.socials.twitter}
                    </a>
                  )}
                  {profile.socials.snapchat && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Snapchat:</span>
                      <span>{profile.socials.snapchat}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
