import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Eye, 
  Heart, 
  CheckCircle,
  Sparkles,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface LoveModeChatProps {
  relationship: any;
  userProfile: any;
  accessToken: string;
  onBack: () => void;
}

export function LoveModeChat({ relationship, userProfile, accessToken, onBack }: LoveModeChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [relationshipData, setRelationshipData] = useState(relationship);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [relationship.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/messages/${relationship.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data.messages || []);
      
      // Update relationship data if it changed
      if (data.relationship) {
        setRelationshipData(data.relationship);
        
        // Check if stage just advanced
        if (data.relationship.stage > relationship.stage) {
          showStageAdvanceMessage(data.relationship.stage);
        }
      }
    } catch (error) {
      console.error('Load messages error:', error);
      if (!silent) {
        toast.error('Failed to load messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const showStageAdvanceMessage = (newStage: number) => {
    const messages = {
      2: "🎤 Voice Exchange unlocked! You can now send voice memos to deepen your connection.",
      3: "✨ Reveal Stage unlocked! You both can now see each other's profiles.",
      4: "❤️ Bonded Date! You're ready to plan your first meetup."
    };
    
    const message = messages[newStage as keyof typeof messages];
    if (message) {
      setLinkMessage(message);
      setTimeout(() => setLinkMessage(null), 5000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            relationshipId: relationship.id,
            content: messageText,
            type: 'text'
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Check for Link coaching
      if (data.linkCoaching) {
        setLinkMessage(data.linkCoaching);
        setTimeout(() => setLinkMessage(null), 7000);
      }

      // Reload messages to show the new one
      loadMessages(true);
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const requestReveal = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/request-reveal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            relationshipId: relationship.id,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to request reveal');

      const data = await response.json();
      toast.success(data.message);
      loadMessages(true);
    } catch (error) {
      console.error('Request reveal error:', error);
      toast.error('Failed to request reveal');
    }
  };

  const getStageInfo = (stage: number) => {
    const stages = [
      { 
        name: 'Anonymous Chat', 
        description: 'Get to know each other through text',
        Icon: MessageCircle,
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
      },
      { 
        name: 'Voice Exchange', 
        description: 'Share voice memos and deepen connection',
        Icon: Mic,
        color: 'bg-purple-100 text-purple-700 border-purple-200'
      },
      { 
        name: 'Reveal Stage', 
        description: 'See each other\'s profiles',
        Icon: Eye,
        color: 'bg-pink-100 text-pink-700 border-pink-200'
      },
      { 
        name: 'Bonded Date', 
        description: 'Ready for a real-world connection',
        Icon: Heart,
        color: 'bg-rose-100 text-rose-700 border-rose-200'
      },
    ];
    return stages[stage - 1] || stages[0];
  };

  const stageInfo = getStageInfo(relationshipData.stage);
  const isRevealed = relationshipData.stage >= 3;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Heart className="w-12 h-12 text-pink-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isRevealed ? (
                <>
                  {relationshipData.otherUser?.profilePicture ? (
                    <img 
                      src={relationshipData.otherUser.profilePicture} 
                      alt={relationshipData.otherUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                      {relationshipData.otherUser?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{relationshipData.otherUser?.name || 'Anonymous'}</h3>
                    <Badge className={`text-xs ${stageInfo.color} border`}>
                      {stageInfo.icon} {stageInfo.name}
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{relationshipData.theirAlias}</h3>
                    <Badge className={`text-xs ${stageInfo.color} border`}>
                      {stageInfo.icon} {stageInfo.name}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>

          {relationshipData.stage === 2 && !relationshipData.revealRequestedBy && (
            <Button
              size="sm"
              variant="outline"
              onClick={requestReveal}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Request Reveal
            </Button>
          )}
        </div>
      </div>

      {/* Link Message */}
      <AnimatePresence>
        {linkMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">Link says:</p>
                <p className="text-sm text-purple-800">{linkMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Your journey begins here
            </h3>
            <p className="text-sm text-gray-600">
              Send your first message to {relationshipData.theirAlias}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === userProfile.id;
            const isSystemMessage = msg.type === 'system';

            if (isSystemMessage) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-white border rounded-full px-4 py-2 text-sm text-gray-600 max-w-sm text-center">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Stage Progress Indicator */}
      {relationshipData.bondScore && (
        <div className="bg-white border-t px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Connection Strength</span>
            <span>{relationshipData.bondScore}/100</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${relationshipData.bondScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center gap-2">
          {relationshipData.stage >= 2 && (
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Message ${isRevealed ? relationshipData.otherUser?.name : relationshipData.theirAlias}...`}
            className="flex-1"
            disabled={sending}
          />
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-full hover:from-pink-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
