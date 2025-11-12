import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Heart,
  Lock,
  Unlock,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface BlindChatWithLinkProps {
  relationship: any;
  userProfile: any;
  accessToken: string;
  onBack: () => void;
  onRevealRequested: () => void;
}

export function BlindChatWithLink({
  relationship,
  userProfile,
  accessToken,
  onBack,
  onRevealRequested,
}: BlindChatWithLinkProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [relationshipData, setRelationshipData] = useState(relationship);
  const [linkSuggestions, setLinkSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bondScore, setBondScore] = useState(relationship.bondStrength || 0);
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

  // Load Link suggestions periodically
  useEffect(() => {
    if (messages.length > 0 && messages.length % 5 === 0) {
      loadLinkSuggestions();
    }
  }, [messages.length]);

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

      // Update relationship data
      if (data.relationship) {
        setRelationshipData(data.relationship);
        setBondScore(data.relationship.bondStrength || 0);

        // Check if reveal is available
        if (data.relationship.bondStrength >= 75 && !data.relationship.revealed) {
          showRevealPrompt();
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

  const loadLinkSuggestions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/link-suggestions/${relationship.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLinkSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Load Link suggestions error:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || sending) return;

    setSending(true);
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
            content,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Add message optimistically
      setMessages([...messages, data.message]);

      // Update bond score if provided
      if (data.bondStrength !== undefined) {
        setBondScore(data.bondStrength);
        setRelationshipData({ ...relationshipData, bondStrength: data.bondStrength });
      }

      // Check for Link's response
      if (data.linkMessage) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `link-${Date.now()}`,
            senderId: 'link',
            content: data.linkMessage,
            timestamp: new Date().toISOString(),
            isLink: true,
          }]);
        }, 1500);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      setNewMessage(content); // Restore message
    } finally {
      setSending(false);
    }
  };

  const showRevealPrompt = () => {
    toast.custom((t) => (
      <Card className="p-4 max-w-md bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="flex items-start gap-3">
          <Unlock className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Bond Strength Unlocked!</p>
            <p className="text-sm text-gray-600 mb-3">
              You've reached a deep emotional connection. Ready to reveal who you both are?
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
              onClick={() => {
                toast.dismiss(t);
                requestReveal();
              }}
            >
              Request Reveal
            </Button>
          </div>
        </div>
      </Card>
    ), { duration: 10000 });
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
          body: JSON.stringify({ relationshipId: relationship.id }),
        }
      );

      if (!response.ok) throw new Error('Failed to request reveal');

      const data = await response.json();

      if (data.revealed) {
        // Both agreed - reveal!
        toast.success('Both of you are ready! Revealing...');
        setTimeout(() => {
          onRevealRequested();
        }, 2000);
      } else {
        toast.success('Reveal request sent! Waiting for them to agree...');
      }
    } catch (error) {
      console.error('Request reveal error:', error);
      toast.error('Failed to request reveal');
    }
  };

  const getBondLevel = (score: number) => {
    if (score >= 75) return { label: 'Deep Bond', color: 'text-pink-600', bg: 'bg-pink-100' };
    if (score >= 50) return { label: 'Growing Connection', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 25) return { label: 'Building Trust', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { label: 'Getting to Know', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const bondLevel = getBondLevel(bondScore);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {relationshipData.anonymousName || 'Mystery Match'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Identities hidden • Guided by Link
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bondLevel.bg} ${bondLevel.color}`}>
                <Heart className="w-3 h-3" />
                {bondLevel.label}
              </div>
            </div>
          </div>

          {/* Bond Strength Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Bond Strength</span>
              <span className="font-semibold text-purple-600">{bondScore}%</span>
            </div>
            <Progress value={bondScore} className="h-1.5" />
            {bondScore < 75 && (
              <p className="text-xs text-gray-500">
                Reach 75% to unlock reveal
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => {
            const isLink = message.senderId === 'link' || message.isLink;
            const isMe = message.senderId === userProfile.id;

            if (isLink) {
              // Link's AI message
              return (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <Card className="max-w-md p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-1">Link</p>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            }

            // User messages
            return (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${isMe ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-gray-500 mb-1 px-3">
                    {isMe ? 'You' : relationshipData.anonymousName || 'Them'}
                  </p>
                  <div
                    className={`
                      inline-block px-4 py-3 rounded-2xl
                      ${isMe
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'}
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-3">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Link Suggestions */}
      <AnimatePresence>
        {showSuggestions && linkSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 bg-blue-50/80 backdrop-blur-sm border-t border-blue-100"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Link suggests asking:</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="h-6"
                >
                  Dismiss
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {linkSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewMessage(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="text-xs bg-white hover:bg-blue-50 border-blue-200"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-pink-100 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            {!showSuggestions && linkSuggestions.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSuggestions(true)}
                className="flex-shrink-0"
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
            )}

            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(newMessage);
                  }
                }}
                placeholder="Share your thoughts openly..."
                className="pr-12"
                disabled={sending}
              />
            </div>

            <Button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || sending}
              className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          {bondScore >= 75 && !relationshipData.revealed && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={requestReveal}
                className="w-full border-pink-300 hover:bg-pink-50 text-pink-700"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Request to Reveal Identities
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
