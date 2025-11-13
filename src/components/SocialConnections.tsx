import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Linkedin,
  Music,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { useUserProfile, useAccessToken, useAppStore } from '../store/useAppStore';

interface SocialConnectionsProps {
  onUpdate?: () => void;
}

interface SocialConnection {
  platform: 'linkedin' | 'spotify';
  connected: boolean;
  username?: string;
  profileUrl?: string;
}

export function SocialConnections({ onUpdate }: SocialConnectionsProps) {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const refreshUserProfile = useAppStore((state) => state.refreshUserProfile);
  const [connecting, setConnecting] = useState<string | null>(null);
  
  // Update connections when userProfile changes
  const connections: SocialConnection[] = [
    {
      platform: 'linkedin',
      connected: !!userProfile?.socialConnections?.linkedin,
      username: userProfile?.socialConnections?.linkedin?.username,
      profileUrl: userProfile?.socialConnections?.linkedin?.profileUrl,
    },
    {
      platform: 'spotify',
      connected: !!userProfile?.socialConnections?.spotify,
      username: userProfile?.socialConnections?.spotify?.username,
      profileUrl: userProfile?.socialConnections?.spotify?.profileUrl,
    },
  ];

  const platformConfig = {
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      connectText: 'Connect LinkedIn',
      description: 'Import your profile info',
    },
    spotify: {
      name: 'Spotify',
      icon: Music,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      connectText: 'Connect Spotify',
      description: 'Share your music taste',
    },
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      // For now, we'll use OAuth-like flow
      // In production, this would redirect to OAuth providers
      
      if (platform === 'linkedin') {
        // LinkedIn OAuth flow
        // Store access token for callback handler
        localStorage.setItem('supabase_auth_token', accessToken);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/social/linkedin/connect`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.authUrl) {
            // Redirect to LinkedIn OAuth
            window.location.href = data.authUrl;
          } else {
            toast.success('LinkedIn connected!');
            await refreshUserProfile();
            onUpdate?.();
          }
        } else {
          const errorData = await response.json();
          toast.error(`Failed to connect: ${errorData.error || 'Unknown error'}`);
        }
      } else if (platform === 'spotify') {
        // Spotify OAuth flow
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your-spotify-client-id';
        const redirectUri = `${window.location.origin}/auth/spotify/callback`;
        const scopes = 'user-read-private user-read-email user-top-read';
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
        
        // Store state for verification
        localStorage.setItem('spotify_connect_state', 'connecting');
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error(`Connect ${platform} error:`, error);
      toast.error(`Failed to connect ${platform}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/social/${platform}/disconnect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success(`${platformConfig[platform as keyof typeof platformConfig].name} disconnected`);
        await refreshUserProfile();
        onUpdate?.();
      }
    } catch (error) {
      console.error(`Disconnect ${platform} error:`, error);
      toast.error('Failed to disconnect');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 text-[#1E4F74]">Social Connections</h3>
        <div className="space-y-3">
          {connections.map((connection) => {
            const config = platformConfig[connection.platform];
            const Icon = config.icon;
            
            return (
              <div
                key={connection.platform}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  connection.connected ? 'bg-green-50 border-green-200' : config.bgColor
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{config.name}</p>
                    {connection.connected && connection.username ? (
                      <p className="text-xs text-gray-600">@{connection.username}</p>
                    ) : (
                      <p className="text-xs text-gray-500">{config.description}</p>
                    )}
                  </div>
                </div>
                
                {connection.connected ? (
                  <div className="flex items-center gap-2">
                    {connection.profileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(connection.profileUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection.platform)}
                      className="h-8"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(connection.platform)}
                    disabled={connecting === connection.platform}
                    className="h-8 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {connecting === connection.platform ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

