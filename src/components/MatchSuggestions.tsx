import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  UserCheck, 
  UserX, 
  Users, 
  Send, 
  Clock, 
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { ProfileDetailView } from './ProfileDetailView';
import { ConnectionCardSkeleton } from './LoadingSkeletons';
import { EmptyState } from './EmptyStates';
import { useUserProfile, useAccessToken } from '../store/useAppStore';

type Tab = 'friends' | 'requests' | 'suggestions';

export function MatchSuggestions() {
  const userProfile = useUserProfile();
  const accessToken = useAccessToken();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [pendingIntros, setPendingIntros] = useState<any[]>([]);
  const [sentIntros, setSentIntros] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        await loadConnections();
      } else if (activeTab === 'requests') {
        await loadPendingIntros();
      } else {
        await loadSuggestions();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      // Use AI assistant to get suggestions
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            query: 'Find people I might connect with',
            criteria: {}
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.matches || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Load suggestions error:', error);
      setSuggestions([]);
    }
  };

  const loadPendingIntros = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intros/incoming`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load pending intros');

      const intros = await response.json();
      setPendingIntros(intros.filter((i: any) => i.status === 'pending'));
    } catch (error) {
      console.error('Load pending intros error:', error);
      toast.error('Failed to load requests');
    }
  };

  const loadSentIntros = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intros/outgoing`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load sent intros');

      const intros = await response.json();
      setSentIntros(intros);
    } catch (error) {
      console.error('Load sent intros error:', error);
      toast.error('Failed to load sent requests');
    }
  };

  const loadConnections = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/connections`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load connections:', response.status, errorText);
        throw new Error(`Failed to load connections: ${response.status}`);
      }

      const data = await response.json();
      // Ensure data is an array
      const connectionsArray = Array.isArray(data) ? data : (data.connections || data.data || []);
      setConnections(connectionsArray);
    } catch (error) {
      console.error('Load connections error:', error);
      toast.error('Failed to load connections');
      // Set empty array on error to prevent crashes
      setConnections([]);
    }
  };

  const handleAccept = async (introId: string) => {
    setProcessing(introId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intro/${introId}/accept`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to accept intro');

      toast.success('Connection accepted! You can now chat.');
      loadPendingIntros();
    } catch (error) {
      console.error('Accept intro error:', error);
      toast.error('Failed to accept connection');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (introId: string) => {
    setProcessing(introId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/soft-intro/${introId}/deny`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to deny intro');

      toast.success('Request declined');
      loadPendingIntros();
    } catch (error) {
      console.error('Deny intro error:', error);
      toast.error('Failed to decline request');
    } finally {
      setProcessing(null);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    setProcessing(targetUserId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/soft-intro`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            targetUserId,
            reason: 'I think we could be a great connection!',
            context: 'Sent from Friends suggestions'
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send request');

      toast.success('Connection request sent!');
      loadSuggestions();
    } catch (error) {
      console.error('Send request error:', error);
      toast.error('Failed to send connection request');
    } finally {
      setProcessing(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (selectedProfile) {
    return (
      <ProfileDetailView
        profile={selectedProfile}
        accessToken={accessToken}
        onClose={() => setSelectedProfile(null)}
        onNext={() => {}} // Not used in connections view
        onPrev={() => {}} // Not used in connections view
        hasNext={false}
        hasPrev={false}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Bonded Design */}
      <div className="glass-card mx-4 mt-4 mb-2 px-4 py-4">
        <h1 className="text-2xl font-bold text-gradient mb-4">Friends</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <Button
            variant={activeTab === 'friends' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('friends')}
            className={activeTab === 'friends' ? 'btn-primary' : 'btn-secondary'}
          >
            <Users className="w-4 h-4 mr-2" />
            My Friends
            {connections.length > 0 && (
              <Badge className="ml-2 bg-teal-blue text-soft-cream">{connections.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('requests')}
            className={activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Requests
            {pendingIntros.length > 0 && (
              <Badge className="ml-2 bg-peach-glow text-midnight-indigo">{pendingIntros.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'suggestions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('suggestions')}
            className={activeTab === 'suggestions' ? 'btn-primary' : 'btn-secondary'}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Suggestions
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="p-4">
            <ConnectionCardSkeleton />
          </div>
        ) : (
          <div className="space-y-3">
            {/* My Friends */}
            {activeTab === 'friends' && (
              <>
                {connections.length === 0 ? (
                  <EmptyState
                    type="no-connections"
                    description="Accept connection requests to start building your network!"
                    actionLabel="Check Requests"
                    onAction={() => setActiveTab('requests')}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {connections.map((connection) => {
                      if (!connection || !connection.id) {
                        console.warn('Invalid connection data:', connection);
                        return null;
                      }
                      
                      return (
                        <Card 
                          key={connection.id} 
                          className="glass-card glass-card-hover overflow-hidden"
                          onClick={() => {
                            if (connection.name) {
                              setSelectedProfile(connection);
                            }
                          }}
                        >
                          <CardContent className="p-0">
                            <div className="h-32 bg-gradient-to-br from-teal-blue to-ocean-blue relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Avatar className="w-20 h-20 border-4 border-soft-cream/20">
                                  <AvatarImage src={connection.profilePicture || connection.imageUrl} />
                                  <AvatarFallback className="text-xl bg-soft-cream text-teal-blue">
                                    {getInitials(connection.name || 'U')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                            <div className="p-3 text-center bg-midnight-indigo/50">
                              <h3 className="font-medium text-sm mb-1 text-soft-cream">{connection.name || 'Unknown'}</h3>
                              <p className="text-xs text-soft-cream/60">{connection.major || ''}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Requests */}
            {activeTab === 'requests' && (
              <>
                {pendingIntros.length === 0 ? (
                  <EmptyState
                    type="no-connections"
                    description="When someone sends you a connection request, it will appear here."
                  />
                ) : (
                  pendingIntros.map((intro) => (
                    <Card key={intro.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar 
                            className="w-16 h-16 cursor-pointer"
                            onClick={() => setSelectedProfile(intro.senderProfile)}
                          >
                            <AvatarImage src={intro.senderProfile?.profilePicture} />
                            <AvatarFallback className="bg-gradient-to-br from-[#2E7B91] to-[#25658A] text-white">
                              {getInitials(intro.senderProfile?.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-medium mb-1 cursor-pointer hover:text-[#2E7B91]"
                              onClick={() => setSelectedProfile(intro.senderProfile)}
                            >
                              {intro.senderProfile?.name}
                            </h3>
                            <p className="text-xs text-[#475569] mb-2">
                              {intro.senderProfile?.school} • {intro.senderProfile?.major}
                            </p>
                            
                            {intro.analysis && (
                              <div className="bg-teal-blue/15 rounded-2xl p-3 mb-3 border border-teal-blue/20">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-teal-blue flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-soft-cream leading-relaxed">
                                    {typeof intro.analysis === 'string' 
                                      ? intro.analysis 
                                      : intro.analysis?.analysis || intro.analysis?.recommendation || 'You have a great match!'}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(intro.id)}
                                disabled={processing === intro.id}
                                className="flex-1 btn-primary"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeny(intro.id)}
                                disabled={processing === intro.id}
                                className="flex-1 btn-secondary"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}

            {/* Suggestions */}
            {activeTab === 'suggestions' && (
              <>
                {suggestions.length === 0 ? (
                  <EmptyState
                    type="no-matches"
                    description="AI will suggest people you might want to connect with based on your profile and interests."
                    actionLabel="Refresh Suggestions"
                    onAction={() => loadSuggestions()}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {suggestions.map((suggestion) => (
                      <Card 
                        key={suggestion.id} 
                        className="glass-card glass-card-hover overflow-hidden"
                        onClick={() => setSelectedProfile(suggestion)}
                      >
                        <CardContent className="p-0">
                          <div className="h-32 bg-gradient-to-br from-lavender-mist to-peach-glow relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Avatar className="w-20 h-20 border-4 border-soft-cream/20">
                                <AvatarImage src={suggestion.profilePicture || suggestion.imageUrl} />
                                <AvatarFallback className="text-xl bg-soft-cream text-lavender-mist">
                                  {getInitials(suggestion.name || 'U')}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                          <div className="p-3 text-center bg-midnight-indigo/50">
                            <h3 className="font-medium text-sm mb-1 text-soft-cream">{suggestion.name || 'Unknown'}</h3>
                            <p className="text-xs text-soft-cream/60 mb-2">{suggestion.major || ''}</p>
                            <Button
                              size="sm"
                              className="w-full btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Send friend request
                                handleSendRequest(suggestion.id);
                              }}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Connect
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
