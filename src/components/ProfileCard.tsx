import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { GraduationCap, MapPin } from 'lucide-react';

interface ProfileCardProps {
  profile: any;
  onClick: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
      onClick={onClick}
    >
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-4 left-4 right-4">
          <Avatar className="w-20 h-20 border-4 border-white">
            <AvatarImage src={profile.profilePicture} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-6 space-y-3">
        <div>
          <h3 className="text-lg mb-1">{profile.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="w-4 h-4" />
            <span>{profile.year || 'Student'}</span>
            {profile.major && <span>• {profile.major}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{profile.school}</span>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
        )}

        {profile.lookingFor && profile.lookingFor.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.lookingFor.slice(0, 3).map((item: string) => (
              <Badge key={item} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 3).map((interest: string) => (
              <Badge key={interest} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.interests.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
