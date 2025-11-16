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
import { EditProfile } from './EditProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { apiPost } from '../utils/api-client';
import { ProfileCompleteness } from './ProfileCompleteness';
import { SocialConnections } from './SocialConnections';

import { useUserProfile, useAccessToken, useAppStore } from '../store/useAppStore';

type View = 'profile' | 'edit' | 'settings';

export function MyProfile() {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const handleLogout = useAppStore((state) => state.handleLogout);
  const [currentView, setCurrentView] = useState<View>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settings, setSettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowMessages: true,
    notifications: true,
    readReceipts: userProfile?.settings?.readReceipts !== undefined ? userProfile.settings.readReceipts : true,
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
      <EditProfile
        userProfile={userProfile}
        accessToken={accessToken}
        onComplete={handleEditComplete}
        onCancel={() => setCurrentView('profile')}
      />
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

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="read-receipts" className="text-sm font-medium">
                    Read Receipts
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Let others know when you've read their messages
                  </p>
                </div>
                <Switch
                  id="read-receipts"
                  checked={settings.readReceipts}
                  onCheckedChange={async (checked) => {
                    setSettings({ ...settings, readReceipts: checked });
                    // Save to backend
                    try {
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify({
                            ...userProfile,
                            settings: {
                              ...userProfile?.settings,
                              readReceipts: checked,
                            },
                          }),
                        }
                      );
                      if (!response.ok) throw new Error('Failed to save settings');
                    } catch (error) {
                      console.error('Save settings error:', error);
                      toast.error('Failed to save settings');
                    }
                  }}
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

  // Profile View (Default) - Tinder-like Design
  const profilePhotos = userProfile.photos && userProfile.photos.length > 0 
    ? userProfile.photos 
    : userProfile.profilePicture 
      ? [userProfile.profilePicture] 
      : [];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header - Minimal */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-soft-cream">My Profile</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentView('edit')}
            className="text-soft-cream/80 hover:text-soft-cream"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentView('settings')}
            className="text-soft-cream/80 hover:text-soft-cream"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Content - Tinder Style */}
      <div className="flex-1 overflow-y-auto">
        {/* Large Photo Section */}
        <div className="relative w-full" style={{ aspectRatio: '3/4', maxHeight: '70vh' }}>
          {profilePhotos.length > 0 ? (
            <img
              src={profilePhotos[0]}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-blue to-ocean-blue flex items-center justify-center">
              <Avatar className="w-32 h-32 border-4 border-white/20">
                <AvatarFallback className="text-4xl bg-white/10 text-white">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />
          
          {/* Name and Age Overlay */}
          <div className="absolute bottom-6 left-4 right-4">
            <h1 className="text-3xl font-bold text-white mb-1">
              {userProfile.name}
              {userProfile.age && <span className="font-normal text-2xl ml-2">{userProfile.age}</span>}
            </h1>
            <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
              {userProfile.year && (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>{userProfile.year}</span>
                </>
              )}
              {userProfile.major && (
                <>
                  <span>•</span>
                  <span>{userProfile.major}</span>
                </>
              )}
            </div>
            {userProfile.school && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{userProfile.school}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-4 py-6 space-y-4">
          {userProfile.bio && (
            <div>
              <h3 className="text-lg font-semibold text-soft-cream mb-2">About</h3>
              <p className="text-soft-cream/80 leading-relaxed">{userProfile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {userProfile.interests && userProfile.interests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-soft-cream mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest, idx) => (
                  <Badge
                    key={idx}
                    className="bg-gray-800/50 text-soft-cream border border-gray-700/50 px-3 py-1.5 text-sm"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {userProfile.lookingFor && userProfile.lookingFor.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-soft-cream mb-3">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.lookingFor.map((item, idx) => (
                  <Badge
                    key={idx}
                    className="bg-teal-blue/20 text-teal-blue border border-teal-blue/30 px-3 py-1.5 text-sm"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bond Print */}
          {userProfile.bondPrint && (
            <div className="bg-gradient-to-br from-teal-blue/10 to-ocean-blue/10 rounded-2xl p-4 border border-teal-blue/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-teal-blue" />
                <h3 className="font-semibold text-soft-cream">Bond Print</h3>
              </div>
              {userProfile.bondPrint.personality && (
                <div>
                  <Badge className="bg-teal-blue text-white mb-2">
                    {userProfile.bondPrint.personality.primaryType}
                  </Badge>
                  <p className="text-sm text-soft-cream/80">
                    {userProfile.bondPrint.personality.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="sticky bottom-0 bg-black/80 backdrop-blur-xl border-t border-gray-800/50 px-4 py-4 flex items-center justify-center gap-4">
        <Button
          onClick={() => setCurrentView('edit')}
          className="flex-1 bg-gray-800/50 text-soft-cream hover:bg-gray-700/50 border border-gray-700/50"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
        <Button
          onClick={() => setCurrentView('settings')}
          variant="outline"
          className="border-gray-700/50 text-soft-cream"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
