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
  CheckCheck
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { ChatListSkeleton, MessagesSkeleton } from './LoadingSkeletons';

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

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      checkTypingStatus();
      markMessagesAsRead(); // Mark messages as read when opening chat
      const messageInterval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      const typingInterval = setInterval(checkTypingStatus, 1000); // Check typing every second
      return () => {
        clearInterval(messageInterval);
        clearInterval(typingInterval);
      };
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
    } catch (error) {
      // Silently fail - not critical
    }
  };

  const checkTypingStatus = async () => {
    if (!selectedChat?.chatId) return;
    
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
        setIsTyping(data.typing || false);
      }
    } catch (error) {
      // Silently fail - typing indicator is not critical
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
    
    // Set timeout to stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/chat/${selectedChat.chatId}/typing/stop`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      ).catch(() => {}); // Silently fail
    }, 2000);
    
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

  // Chat List View
  if (!selectedChat) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="bg-white border-b px-4 py-4">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <ChatListSkeleton />
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <Card className="max-w-md w-full border-0 shadow-none">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p className="text-sm text-gray-600">
                    Accept connection requests to start chatting with people!
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => {
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
              })}
            </div>
          )}
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
