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

interface MatchSuggestionsProps {
  userProfile: any;
  accessToken: string;
}

type Tab = 'pending' | 'sent' | 'connections';

export function MatchSuggestions({ userProfile, accessToken }: MatchSuggestionsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [pendingIntros, setPendingIntros] = useState<any[]>([]);
  const [sentIntros, setSentIntros] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        await loadPendingIntros();
      } else if (activeTab === 'sent') {
        await loadSentIntros();
      } else {
        await loadConnections();
      }
    } finally {
      setLoading(false);
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

      if (!response.ok) throw new Error('Failed to load connections');

      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Load connections error:', error);
      toast.error('Failed to load connections');
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
        userProfile={userProfile}
        accessToken={accessToken}
        onClose={() => setSelectedProfile(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">Connections</h1>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pending')}
            className={activeTab === 'pending' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Pending
            {pendingIntros.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{pendingIntros.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('sent')}
            className={activeTab === 'sent' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <Send className="w-4 h-4 mr-2" />
            Sent
          </Button>
          <Button
            variant={activeTab === 'connections' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('connections')}
            className={activeTab === 'connections' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Friends
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <ConnectionCardSkeleton />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Pending Requests */}
            {activeTab === 'pending' && (
              <>
                {pendingIntros.length === 0 ? (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-8 text-center">
                      <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                      <p className="text-sm text-gray-600">
                        When someone sends you a connection request, it will appear here.
                      </p>
                    </CardContent>
                  </Card>
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
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                              {getInitials(intro.senderProfile?.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-medium mb-1 cursor-pointer hover:text-indigo-600"
                              onClick={() => setSelectedProfile(intro.senderProfile)}
                            >
                              {intro.senderProfile?.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">
                              {intro.senderProfile?.school} • {intro.senderProfile?.major}
                            </p>
                            
                            {intro.analysis && (
                              <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-purple-900 leading-relaxed">
                                    {intro.analysis}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(intro.id)}
                                disabled={processing === intro.id}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeny(intro.id)}
                                disabled={processing === intro.id}
                                className="flex-1"
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

            {/* Sent Requests */}
            {activeTab === 'sent' && (
              <>
                {sentIntros.length === 0 ? (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-8 text-center">
                      <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No sent requests</h3>
                      <p className="text-sm text-gray-600">
                        Find people on the Discover tab and send them connection requests!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  sentIntros.map((intro) => (
                    <Card key={intro.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar 
                            className="w-16 h-16 cursor-pointer"
                            onClick={() => setSelectedProfile(intro.receiverProfile)}
                          >
                            <AvatarImage src={intro.receiverProfile?.profilePicture} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                              {getInitials(intro.receiverProfile?.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 
                                className="font-medium cursor-pointer hover:text-indigo-600"
                                onClick={() => setSelectedProfile(intro.receiverProfile)}
                              >
                                {intro.receiverProfile?.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(intro.status)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {intro.receiverProfile?.school} • {intro.receiverProfile?.major}
                            </p>
                            
                            <Badge 
                              variant="secondary"
                              className={
                                intro.status === 'accepted' 
                                  ? 'bg-green-100 text-green-700' 
                                  : intro.status === 'denied'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }
                            >
                              {intro.status === 'pending' ? 'Waiting for response' : intro.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}

            {/* Connections */}
            {activeTab === 'connections' && (
              <>
                {connections.length === 0 ? (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-8 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Accept connection requests to start building your network!
                      </p>
                      <Button 
                        onClick={() => setActiveTab('pending')}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Check Pending Requests
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {connections.map((connection) => (
                      <Card 
                        key={connection.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedProfile(connection)}
                      >
                        <CardContent className="p-0">
                          <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-500 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Avatar className="w-20 h-20 border-4 border-white">
                                <AvatarImage src={connection.profilePicture} />
                                <AvatarFallback className="text-xl bg-white text-indigo-600">
                                  {getInitials(connection.name)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                          <div className="p-3 text-center">
                            <h3 className="font-medium text-sm mb-1">{connection.name}</h3>
                            <p className="text-xs text-gray-600">{connection.major}</p>
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
