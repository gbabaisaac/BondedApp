import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MessageCircle, 
  ArrowLeft, 
  Send,
  RefreshCw,
  Smile,
  Check,
  CheckCheck,
  Sparkles,
  Bot,
  UserPlus,
  X
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { ChatListSkeleton, MessagesSkeleton } from './LoadingSkeletons';
import { ProfileDetailView } from './ProfileDetailView';
import './ChatView.css';
import { isFeatureEnabled } from '../config/features';

interface ChatViewProps {
  userProfile: any;
  accessToken: string;
}

export function ChatView({ userProfile, accessToken }: ChatViewProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  
  // AI Assistant state
  const [isAIChat, setIsAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [pendingIntroRequest, setPendingIntroRequest] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Load AI chat when AI chat is selected (only if feature is enabled)
  useEffect(() => {
    if (isAIChat && isFeatureEnabled('AI_ASSISTANT_ENABLED')) {
      loadAIChat();
    } else if (isAIChat && !isFeatureEnabled('AI_ASSISTANT_ENABLED')) {
      // Redirect to chat list if feature is disabled
      setIsAIChat(false);
    }
  }, [isAIChat]);

  useEffect(() => {
    if (selectedChat) {
      // Clear typing indicator when switching chats
      setIsTyping(false);
      
      loadMessages();
      checkTypingStatus();
      markMessagesAsRead(); // Mark messages as read when opening chat
      const messageInterval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      const typingInterval = setInterval(checkTypingStatus, 1000); // Check typing every second
      return () => {
        clearInterval(messageInterval);
        clearInterval(typingInterval);
        // Clear typing when leaving chat
        setIsTyping(false);
      };
    } else {
      // Clear typing when no chat is selected
      setIsTyping(false);
    }
  }, [selectedChat]);

  // Load user settings for read receipts
  useEffect(() => {
    if (userProfile?.settings?.readReceipts !== undefined) {
      setReadReceiptsEnabled(userProfile.settings.readReceipts);
    }
  }, [userProfile]);

  const loadChats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chats`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load chats');

      const data = await response.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load chats error:', error);
      toast.error('Failed to load chats');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat?.chatId) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load messages error:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat?.chatId) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      
      // Trigger navigation badge refresh immediately
      if ((window as any).__refreshNavCounts) {
        (window as any).__refreshNavCounts();
      }
      
      // Also reload chats to update unread counts in the chat list
      await loadChats();
    } catch (error) {
      // Silently fail - not critical
    }
  };

  const checkTypingStatus = async () => {
    if (!selectedChat?.chatId) {
      setIsTyping(false);
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/typing`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setIsTyping(data.typing === true); // Explicitly check for true
      } else {
        // If request fails, assume not typing
        setIsTyping(false);
      }
    } catch (error) {
      // On error, clear typing indicator
      setIsTyping(false);
    }
  };

  const handleTyping = () => {
    if (!selectedChat?.chatId) return;
    
    // Send typing start
    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/typing/start`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    ).catch(() => {}); // Silently fail
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set timeout to stop typing after 3 seconds of inactivity (matches backend TTL)
    const timeout = setTimeout(() => {
      if (selectedChat?.chatId) {
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/typing/stop`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        ).catch(() => {}); // Silently fail
      }
    }, 3000); // Match backend TTL of 3 seconds
    
    setTypingTimeout(timeout);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending || !selectedChat?.chatId) return;

    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    if (selectedChat?.chatId) {
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/typing/stop`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      ).catch(() => {}); // Silently fail
    }

    setSending(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: messageText,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      setMessageText('');
      await loadMessages();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const loadAIChat = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/chat`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        setAiMessages(messages);
        
        // Extract suggested profiles from message history
        const profilesFromHistory: any[] = [];
        messages.forEach((msg: any) => {
          if (msg.metadata?.type === 'profile-suggestions' && msg.metadata?.profiles) {
            // Add profiles from this message (avoid duplicates)
            msg.metadata.profiles.forEach((profile: any) => {
              if (!profilesFromHistory.find(p => p.id === profile.id)) {
                profilesFromHistory.push(profile);
              }
            });
          }
        });
        
        if (profilesFromHistory.length > 0) {
          setSuggestedProfiles(profilesFromHistory);
        }
      }
    } catch (error) {
      console.error('Load AI chat error:', error);
    }
  };

  const sendAIMessage = async () => {
    if (!messageText.trim() || aiLoading) return;

    setAiLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ message: messageText }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Add user message
      const userMsg = {
        id: `ai-msg-${Date.now()}`,
        senderId: userProfile.id,
        content: messageText,
        timestamp: new Date().toISOString(),
        type: 'user',
      };
      
      // Add AI response
      const aiMsg = {
        id: `ai-msg-${Date.now() + 1}`,
        senderId: 'ai-assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };

      setAiMessages(prev => [...prev, userMsg, aiMsg]);
      setMessageText('');
      setAiSuggestions(data.suggestions || []);

      // If AI suggests searching, trigger search automatically
      if (data.shouldSearch) {
        // Use the original message or combine with context
        const searchQuery = messageText;
        await searchProfiles(searchQuery);
      }
      
      // Also check if the AI response mentions searching - trigger search even if shouldSearch wasn't set
      if (data.response && (
        data.response.toLowerCase().includes('search') || 
        data.response.toLowerCase().includes('let me find') ||
        data.response.toLowerCase().includes('i\'ll search')
      )) {
        await searchProfiles(messageText);
      }
    } catch (error) {
      console.error('Send AI message error:', error);
      toast.error('Failed to send message');
    } finally {
      setAiLoading(false);
    }
  };

  const searchProfiles = async (query: string) => {
    try {
      console.log('[SEARCH] Searching for:', query);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SEARCH] Search failed:', response.status, errorText);
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SEARCH] Search results:', data);
      
      // Update suggested profiles (merge with existing to avoid duplicates)
      setSuggestedProfiles(prev => {
        const newProfiles = data.matches || [];
        const combined = [...prev];
        newProfiles.forEach((profile: any) => {
          if (!combined.find(p => p.id === profile.id)) {
            combined.push(profile);
          }
        });
        return combined;
      });
      
      // Reload AI chat to get the message with profiles from backend
      await loadAIChat();
      
      if (data.matches && data.matches.length === 0) {
        // No matches found
        const noMatchMsg = {
          id: `ai-msg-${Date.now()}`,
          senderId: 'ai-assistant',
          content: `I couldn't find any matches for that right now. Try being more specific or check back later as more people join!`,
          timestamp: new Date().toISOString(),
          type: 'ai',
        };
        setAiMessages(prev => [...prev, noMatchMsg]);
      }
    } catch (error) {
      console.error('[SEARCH] Search profiles error:', error);
      const errorMsg = {
        id: `ai-msg-${Date.now()}`,
        senderId: 'ai-assistant',
        content: `I had trouble searching right now. Please try again in a moment!`,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };
      setAiMessages(prev => [...prev, errorMsg]);
    }
  };

  const requestSoftIntro = async (targetUserId: string, reason: string) => {
    try {
      // Build context from recent conversation history
      const recentMessages = aiMessages
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.senderId === userProfile.id ? 'User' : 'Link'}: ${msg.content}`)
        .join('\n');
      
      const fullContext = messageText 
        ? `Current message: ${messageText}\n\nRecent conversation:\n${recentMessages}`
        : `Recent conversation:\n${recentMessages}`;
      
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
            reason,
            context: fullContext,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to request soft intro');

      const data = await response.json();
      setPendingIntroRequest({ targetUserId, reason, introRequestId: data.introRequestId });
      
      // Add confirmation message
      const confirmMsg = {
        id: `ai-msg-${Date.now()}`,
        senderId: 'ai-assistant',
        content: `Great! I've sent a message to them explaining the situation. I'll let you know when they respond!`,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };
      setAiMessages(prev => [...prev, confirmMsg]);
      toast.success('Soft intro request sent!');
    } catch (error) {
      console.error('Request soft intro error:', error);
      toast.error('Failed to send soft intro request');
    }
  };

  const handleIntroResponse = async (introRequestId: string, accepted: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/ai-assistant/soft-intro/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ introRequestId, accepted }),
        }
      );

      if (!response.ok) throw new Error('Failed to respond');

      const data = await response.json();
      
      if (accepted && data.chatId) {
        toast.success('You\'re now connected! Check your messages.');
        // Reload chats to show new connection
        loadChats();
      }
      
      // Remove from messages
      setAiMessages(prev => prev.filter(msg => 
        !(msg.metadata?.introRequestId === introRequestId)
      ));
    } catch (error) {
      console.error('Handle intro response error:', error);
      toast.error('Failed to process response');
    }
  };

  // Chat List View
  if (!selectedChat && !isAIChat) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="bg-white border-b px-4 py-4">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <ChatListSkeleton />
          ) : (
            <div className="divide-y">
              {/* AI Assistant Option - Only show if feature is enabled */}
              {isFeatureEnabled('AI_ASSISTANT_ENABLED') && (
                <div
                  onClick={() => setIsAIChat(true)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b-2 border-[#2E7B91]/20"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2E7B91] to-[#25658A] rounded-full flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-medium">Link - AI Assistant</h3>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      Find co-founders, study partners, and connections
                    </p>
                  </div>
                </div>
              )}

              {/* Regular Chats */}
              {chats.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-gray-500 text-center">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                chats.map((chat) => {
                  if (!chat?.chatId || !chat?.otherUser) {
                    console.warn('Invalid chat data:', chat);
                    return null;
                  }

                  return (
                    <div
                      key={chat.chatId}
                      onClick={() => setSelectedChat(chat)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={chat.otherUser?.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                          {getInitials(chat.otherUser?.name || 'User')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="font-medium">{chat.otherUser?.name || 'Unknown'}</h3>
                          <div className="flex items-center gap-2">
                            {chat.unreadCount > 0 && (
                              <span className="bg-indigo-600 text-white text-xs font-medium rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                {chat.unreadCount}
                              </span>
                            )}
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessageTimestamp || new Date().toISOString())}
                              </span>
                            )}
                          </div>
                        </div>
                        {chat.lastMessage ? (
                          <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            {chat.lastMessage}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Start a conversation
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Chat View - Only accessible if feature is enabled
  if (isAIChat && isFeatureEnabled('AI_ASSISTANT_ENABLED')) {
    // If profile is selected, show ProfileDetailView instead
    if (selectedProfile) {
      // Find all profiles from all suggestion messages
      const allProfiles: any[] = [];
      aiMessages.forEach((msg: any) => {
        if (msg.metadata?.type === 'profile-suggestions' && msg.metadata?.profiles) {
          msg.metadata.profiles.forEach((p: any) => {
            if (!allProfiles.find(prof => prof.id === p.id)) {
              allProfiles.push(p);
            }
          });
        }
      });
      
      const currentIndex = allProfiles.findIndex(p => p.id === selectedProfile.id);
      
      // Map profile data to match ProfileDetailView interface
      const mappedProfile = {
        ...selectedProfile,
        age: selectedProfile.age || 20, // Default age if not provided
        school: selectedProfile.school || userProfile?.school || 'University',
        imageUrl: selectedProfile.profilePicture || selectedProfile.imageUrl || selectedProfile.photos?.[0] || '',
        photos: selectedProfile.photos || [selectedProfile.profilePicture].filter(Boolean),
        bio: selectedProfile.bio || '',
        interests: selectedProfile.interests || [],
        lookingFor: selectedProfile.lookingFor || [],
        personality: selectedProfile.personality || [],
      };
      
      return (
        <ProfileDetailView
          profile={mappedProfile}
          onClose={() => setSelectedProfile(null)}
          onNext={() => {
            if (currentIndex < allProfiles.length - 1) {
              setSelectedProfile(allProfiles[currentIndex + 1]);
            }
          }}
          onPrev={() => {
            if (currentIndex > 0) {
              setSelectedProfile(allProfiles[currentIndex - 1]);
            }
          }}
          hasNext={currentIndex < allProfiles.length - 1}
          hasPrev={currentIndex > 0}
          accessToken={accessToken}
        />
      );
    }
    
    return (
      <div className="h-full flex flex-col bg-white">
        {/* AI Chat Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => {
              setIsAIChat(false);
              setSuggestedProfiles([]);
              setPendingIntroRequest(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 bg-gradient-to-br from-[#2E7B91] to-[#25658A] rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-medium">Link - AI Assistant</h2>
            <p className="text-xs text-gray-600">Finding connections for you</p>
          </div>
        </div>

        {/* AI Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {aiMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2E7B91] to-[#25658A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">Hi! I'm Link</h3>
                <p className="text-sm text-gray-600 mb-4">
                  I can help you find co-founders, study partners, roommates, and friends on campus. Just tell me what you're looking for!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Find a co-founder', 'Find a study partner', 'Find a roommate'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setMessageText(suggestion);
                        setTimeout(() => sendAIMessage(), 100);
                      }}
                      className="px-3 py-1.5 bg-[#2E7B9115] text-[#2E7B91] rounded-full text-sm hover:bg-[#2E7B9120] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {aiMessages.map((message, index) => {
                const isUser = message.senderId === userProfile.id;
                const isIntroRequest = message.metadata?.type === 'soft-intro-request';

                return (
                  <div key={message.id || index}>
                    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isUser && (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#2E7B91] to-[#25658A] rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isUser
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Intro Request UI - Clean card design */}
                    {isIntroRequest && message.metadata?.introRequestId && (
                      <div className="mt-3 ml-10 max-w-md">
                        <Card className="border-2 border-[#2E7B91]/20 bg-gradient-to-br from-white to-[#F9F6F3] shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <Avatar className="w-12 h-12 ring-2 ring-[#2E7B91]/30">
                                <AvatarImage src={message.metadata.fromUserPhoto} />
                                <AvatarFallback className="bg-gradient-to-br from-[#2E7B91] to-[#25658A] text-white font-semibold">
                                  {getInitials(message.metadata.fromUserName || 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base text-[#1E4F74] mb-0.5">
                                  {message.metadata.fromUserName || 'Someone'} wants to connect
                                </h4>
                                {message.metadata.fromUserMajor && (
                                  <p className="text-xs text-[#64748b]">
                                    {message.metadata.fromUserMajor} • {message.metadata.fromUserYear || 'Student'}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleIntroResponse(message.metadata.introRequestId, true)}
                                className="flex-1 bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] font-medium shadow-sm min-w-[100px] rounded-md px-4 py-2 flex items-center justify-center gap-1.5 text-sm transition-colors"
                                style={{ 
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                data-accept-button
                              >
                                <UserPlus className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleIntroResponse(message.metadata.introRequestId, false)}
                                className="flex-1 border-2 border-[#EAEAEA] hover:border-[#2E7B91]/30 hover:bg-[#F9F6F3] font-medium min-w-[100px]"
                              >
                                <X className="w-4 h-4 mr-1.5" />
                                Decline
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Profile Suggestions - Show after suggestion message */}
                    {message.metadata?.type === 'profile-suggestions' && message.metadata?.profiles && message.metadata.profiles.length > 0 && (
                      <div className="mt-2 ml-10 space-y-3 max-w-md">
                        {message.metadata.profiles.map((profile: any) => (
                          <Card 
                            key={profile.id} 
                            className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedProfile(profile)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={profile.profilePicture} />
                                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                                    {getInitials(profile.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm">{profile.name}</h4>
                                  <p className="text-xs text-gray-600">{profile.major} • {profile.year}</p>
                                  {profile.bio && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{profile.bio}</p>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent card click
                                      const reason = messageText || 'I think we could be a great connection!';
                                      requestSoftIntro(profile.id, reason);
                                    }}
                                    className="mt-2 w-full bg-[#2E7B91] hover:bg-[#25658A] text-xs"
                                  >
                                    <UserPlus className="w-3 h-3 mr-1" />
                                    Request Soft Intro
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-start pt-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessageText(suggestion);
                        setTimeout(() => sendAIMessage(), 100);
                      }}
                      className="px-3 py-1.5 bg-[#2E7B9115] text-[#2E7B91] rounded-full text-sm hover:bg-[#2E7B9120] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {aiLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#2E7B91] to-[#25658A] rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Message Input */}
        <div
          className="bg-white border-t px-4 flex-shrink-0"
          style={{
            paddingTop: '0.75rem',
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))'
          }}
        >
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !aiLoading && sendAIMessage()}
              placeholder="Ask Link to find someone..."
              className="flex-1"
              disabled={aiLoading}
            />
            <Button
              onClick={sendAIMessage}
              disabled={!messageText.trim() || aiLoading}
              className="bg-[#2E7B91] hover:bg-[#25658A]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check
  if (!selectedChat?.otherUser) {
    console.error('Invalid selected chat:', selectedChat);
    setSelectedChat(null);
    return null;
  }

  // Chat View
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => setSelectedChat(null)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={selectedChat.otherUser?.profilePicture} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
            {getInitials(selectedChat.otherUser?.name || 'User')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-medium">{selectedChat.otherUser?.name || 'Unknown'}</h2>
          <p className="text-xs text-gray-600">{selectedChat.otherUser?.major || ''}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Smile className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Say hi to {selectedChat.otherUser?.name}!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = message.senderId === userProfile.id;
            const showAvatar = index === messages.length - 1 || 
                             messages[index + 1]?.senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {showAvatar ? (
                  <Avatar className="w-8 h-8">
                    {isMe ? (
                      <>
                        <AvatarImage src={userProfile.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">
                          {getInitials(userProfile.name)}
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src={selectedChat.otherUser?.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">
                          {getInitials(selectedChat.otherUser?.name || 'U')}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                ) : (
                  <div className="w-8" />
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {isMe && readReceiptsEnabled && (
                      <div className="flex items-center">
                        {message.readBy && message.readBy.length > 0 && message.readBy.includes(selectedChat.otherUser?.id) ? (
                          <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 px-4 py-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={selectedChat.otherUser?.profilePicture} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">
                {getInitials(selectedChat.otherUser?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div
        className="bg-white border-t px-4 flex-shrink-0"
        style={{
          paddingTop: '0.75rem',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Message ${selectedChat.otherUser?.name}...`}
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!messageText.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
