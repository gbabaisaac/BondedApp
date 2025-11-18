import { useState } from 'react';
import { MessageCircle, Search, Send, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUserProfile } from '../store/useAppStore';

interface Chat {
  id: string;
  name: string;
  avatar_url: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

// Mock data
const mockChats: Chat[] = Array.from({ length: 10 }, (_, i) => ({
  id: `chat-${i}`,
  name: `Friend ${i + 1}`,
  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=chat${i}`,
  lastMessage: 'Hey! How are you doing?',
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  unread: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
  isOnline: Math.random() > 0.6,
}));

interface MessagesModernProps {
  onNavigateToProfile?: () => void;
}

export function MessagesModern({ onNavigateToProfile }: MessagesModernProps = {}) {
  const userProfile = useUserProfile();
  const [chats] = useState<Chat[]>(mockChats);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen"
      style={{ background: 'var(--gradient-background)' }}
    >
      {/* Header - Matching Design */}
      <div 
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b"
        style={{ 
          borderColor: '#E8E8F0',
          padding: '16px 20px',
        }}
      >
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-bold"
            style={{ 
              fontFamily: "'Outfit', sans-serif",
              fontSize: '28px',
              fontWeight: 700,
              color: '#2D2D2D',
            }}
          >
            Messages
          </h1>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-pink-500 hover:scale-105"
            style={{ 
              background: 'white',
              borderColor: '#E8E8F0',
            }}
          >
            <MoreVertical className="w-5 h-5" style={{ color: '#2D2D2D' }} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div 
        className="bg-white border-b"
        style={{ 
          borderColor: '#E8E8F0',
          padding: '12px 20px',
        }}
      >
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: '#9B9B9B' }}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
            style={{ 
              background: '#F3F4FF',
              borderColor: 'transparent',
              color: '#2D2D2D',
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FF6B6B';
              e.target.style.background = 'white';
              e.target.style.boxShadow = '0 0 0 4px rgba(255, 107, 107, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.background = '#F3F4FF';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ 
          height: 'calc(100vh - 72px - 61px - 80px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* AI Assistant Banner */}
        <div 
          className="mx-5 mt-4 mb-4 p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ 
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(78, 205, 196, 0.1))',
            border: '2px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '16px',
          }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #4ECDC4)',
              borderRadius: '12px',
            }}
          >
            ✨
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="text-sm font-bold mb-0.5"
              style={{
                color: '#2D2D2D',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              Link - AI Assistant
            </h3>
            <p 
              className="text-xs"
              style={{
                color: '#6B6B6B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
              }}
            >
              Find study partners, roommates & more
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(255, 107, 107, 0.1)' }}
            >
              <MessageCircle className="w-10 h-10" style={{ color: '#FF6B6B' }} />
            </div>
            <h3 
              className="text-lg font-bold mb-2"
              style={{ 
                color: '#2D2D2D',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              No messages found
            </h3>
            <p 
              className="text-sm"
              style={{ 
                color: '#6B6B6B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
              }}
            >
              Try searching for something else
            </p>
          </div>
        ) : (
          <div>
            {/* Recent Section */}
            <div 
              className="px-5 py-4 pb-2 text-xs font-bold uppercase tracking-wider"
              style={{
                color: '#9B9B9B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                padding: '16px 20px 8px',
              }}
            >
              Recent
            </div>
            {filteredChats.filter(chat => chat.unread > 0).map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-center gap-3 transition-all hover:bg-pink-50 border-b"
                style={{ 
                  borderColor: '#F3F4FF',
                  background: chat.unread > 0 ? 'rgba(255, 107, 107, 0.03)' : 'transparent',
                  padding: '12px 20px',
                }}
              >
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '14px',
                      width: '56px',
                      height: '56px',
                    }}
                  >
                    {chat.avatar_url ? (
                      <img
                        src={chat.avatar_url}
                        alt={chat.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  {chat.isOnline && (
                    <div 
                      className="absolute bottom-0.5 right-0.5 rounded-full border-2 border-white"
                      style={{ 
                        background: '#6EE7B7',
                        width: '14px',
                        height: '14px',
                        bottom: '2px',
                        right: '2px',
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 
                      className="text-sm font-bold truncate"
                      style={{ 
                        color: '#2D2D2D',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      {chat.name}
                    </h3>
                    <span 
                      className="text-xs flex-shrink-0 ml-2"
                      style={{ 
                        color: '#9B9B9B',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                      }}
                    >
                      {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true }).replace('about ', '').replace(' ago', '')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p 
                      className="text-sm truncate"
                      style={{ 
                        color: chat.unread > 0 ? '#2D2D2D' : '#6B6B6B',
                        fontWeight: chat.unread > 0 ? 600 : 400,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                      }}
                    >
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span 
                        className="flex-shrink-0 ml-2 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        style={{ 
                          background: '#FF6B6B',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '11px',
                          fontWeight: 700,
                          width: '24px',
                          height: '24px',
                        }}
                      >
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Earlier Section */}
            <div 
              className="px-5 py-4 pb-2 text-xs font-bold uppercase tracking-wider"
              style={{
                color: '#9B9B9B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                padding: '16px 20px 8px',
              }}
            >
              Earlier
            </div>
            {filteredChats.filter(chat => chat.unread === 0).map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-center gap-3 transition-all hover:bg-pink-50 border-b"
                style={{ 
                  borderColor: '#F3F4FF',
                  padding: '12px 20px',
                }}
              >
                <div className="relative flex-shrink-0">
                  <div 
                    className="rounded-2xl flex items-center justify-center text-2xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '14px',
                      width: '56px',
                      height: '56px',
                    }}
                  >
                    {chat.avatar_url ? (
                      <img
                        src={chat.avatar_url}
                        alt={chat.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  {chat.isOnline && (
                    <div 
                      className="absolute rounded-full border-2 border-white"
                      style={{ 
                        background: '#6EE7B7',
                        width: '14px',
                        height: '14px',
                        bottom: '2px',
                        right: '2px',
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 
                      className="text-sm font-bold truncate"
                      style={{ 
                        color: '#2D2D2D',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      {chat.name}
                    </h3>
                    <span 
                      className="text-xs flex-shrink-0 ml-2"
                      style={{ 
                        color: '#9B9B9B',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                      }}
                    >
                      {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true }).replace('about ', '').replace(' ago', '')}
                    </span>
                  </div>
                  <p 
                    className="text-sm truncate"
                    style={{ 
                      color: '#6B6B6B',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed right-5 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-50"
        style={{ 
          bottom: '100px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
          boxShadow: '0 8px 20px rgba(255, 107, 107, 0.4)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2"/>
        </svg>
      </button>
    </div>
  );
}

