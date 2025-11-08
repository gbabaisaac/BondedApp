import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  GraduationCap,
  MapPin,
  Mail,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Users,
  Volume2,
  Instagram,
  Twitter,
  Settings,
  Edit3,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Camera,
  ArrowLeft,
} from 'lucide-react';
import { ProfileSetup } from './ProfileSetup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface MyProfileProps {
  userProfile: any;
  accessToken: string;
  onLogout: () => void;
}

type View = 'profile' | 'edit' | 'settings';

export function MyProfile({ userProfile, accessToken, onLogout }: MyProfileProps) {
  const [currentView, setCurrentView] = useState<View>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settings, setSettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowMessages: true,
    notifications: true,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSleepIcon = () => {
    if (userProfile.livingHabits?.sleepSchedule === 'early') return <Sun className="w-4 h-4" />;
    if (userProfile.livingHabits?.sleepSchedule === 'night') return <Moon className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const handleEditComplete = (profile: any) => {
    setCurrentView('profile');
    window.location.reload(); // Refresh to get updated profile
  };

  // Edit Profile View
  if (currentView === 'edit') {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl">Edit Profile</h2>
        </div>
        <ProfileSetup
          accessToken={accessToken}
          onComplete={handleEditComplete}
          existingProfile={userProfile}
        />
      </div>
    );
  }

  // Settings View
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl">Settings</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Account Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium mb-1">Account</h3>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
              </div>
              
              <Separator />
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setCurrentView('edit')}
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-medium">Privacy</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="profile-visible" className="text-sm font-medium">
                    Profile Visible
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Allow others to see your profile
                  </p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={settings.profileVisible}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, profileVisible: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="online-status" className="text-sm font-medium">
                    Show Online Status
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Let others see when you're active
                  </p>
                </div>
                <Switch
                  id="online-status"
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showOnlineStatus: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="allow-messages" className="text-sm font-medium">
                    Allow Direct Messages
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Anyone can send you messages
                  </p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowMessages: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="font-medium">Notifications</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Get notified about new messages and requests
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardContent className="pt-6 space-y-3">
              <div>
                <h3 className="font-medium text-red-600 mb-1">Danger Zone</h3>
                <p className="text-sm text-gray-600">
                  Irreversible actions that affect your account
                </p>
              </div>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profile View (Default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <h2 className="text-xl">My Profile</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCurrentView('settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-4">
        {/* Profile Header Card */}
        <Card>
          <div className="relative">
            <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-t-lg" />
            <div className="px-4 pb-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white -mt-12 mb-3">
                  <AvatarImage src={userProfile.profilePicture} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                    {getInitials(userProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute left-16 -mt-8 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl mb-1">{userProfile.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{userProfile.year || 'Student'}</span>
                    {userProfile.major && <span>• {userProfile.major}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.school}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{userProfile.email}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentView('edit')}
                  className="gap-2"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Bond Print */}
        {userProfile.bondPrint && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium">Your Bond Print</h3>
              </div>
              {userProfile.bondPrint.personality && (
                <div className="mb-3">
                  <Badge className="bg-purple-600 text-white mb-2">
                    {userProfile.bondPrint.personality.primaryType}
                  </Badge>
                  <p className="text-sm text-gray-700">
                    {userProfile.bondPrint.personality.description}
                  </p>
                </div>
              )}
              {userProfile.bondPrint.summary && (
                <p className="text-sm text-gray-600 mb-3">
                  {userProfile.bondPrint.summary}
                </p>
              )}
              {userProfile.bondPrint.values && userProfile.bondPrint.values.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Core Values:</p>
                  <div className="flex flex-wrap gap-1">
                    {userProfile.bondPrint.values.map((value: string) => (
                      <Badge key={value} variant="outline" className="text-xs border-purple-300">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        {userProfile.bio && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm text-gray-500 mb-2">About</h3>
              <p className="text-gray-700">{userProfile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Looking For */}
        {userProfile.lookingFor && userProfile.lookingFor.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm text-gray-500 mb-3">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.lookingFor.map((item: string) => (
                  <Badge key={item} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interests */}
        {userProfile.interests && userProfile.interests.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm text-gray-500 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest: string) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality */}
        {userProfile.personality && userProfile.personality.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm text-gray-500 mb-3">Personality</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.personality.map((trait: string) => (
                  <Badge key={trait} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Living Habits */}
        {userProfile.livingHabits && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm text-gray-500 mb-4">Living Habits</h3>
              <div className="grid grid-cols-2 gap-4">
                {userProfile.livingHabits.sleepSchedule && (
                  <div className="flex items-center gap-2">
                    {getSleepIcon()}
                    <div>
                      <p className="text-xs text-gray-500">Sleep</p>
                      <p className="text-sm capitalize">{userProfile.livingHabits.sleepSchedule}</p>
                    </div>
                  </div>
                )}
                {userProfile.livingHabits.cleanliness && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-gray-500">Cleanliness</p>
                      <p className="text-sm capitalize">{userProfile.livingHabits.cleanliness}</p>
                    </div>
                  </div>
                )}
                {userProfile.livingHabits.guests && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="text-sm capitalize">{userProfile.livingHabits.guests}</p>
                    </div>
                  </div>
                )}
                {userProfile.livingHabits.noise && (
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-gray-500">Noise</p>
                      <p className="text-sm capitalize">{userProfile.livingHabits.noise}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media */}
        {userProfile.socials && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm text-gray-500 mb-3">Social Media</h3>
              <div className="space-y-2">
                {userProfile.socials.instagram && (
                  <a
                    href={`https://instagram.com/${userProfile.socials.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                  >
                    <Instagram className="w-4 h-4" />
                    {userProfile.socials.instagram}
                  </a>
                )}
                {userProfile.socials.twitter && (
                  <a
                    href={`https://x.com/${userProfile.socials.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                  >
                    <Twitter className="w-4 h-4" />
                    {userProfile.socials.twitter}
                  </a>
                )}
                {userProfile.socials.snapchat && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Snapchat:</span>
                    <span>{userProfile.socials.snapchat}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setCurrentView('settings')}
            >
              <Settings className="w-4 h-4" />
              Settings & Privacy
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout?</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout();
              }}
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
