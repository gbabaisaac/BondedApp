'use client';

import React from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { MessageCircle, Search, Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';

// Mock conversations
const mockConversations = Array.from({ length: 10 }, (_, i) => ({
  id: `conv-${i}`,
  is_group: i % 4 === 0,
  group_name: i % 4 === 0 ? `Group Chat ${i + 1}` : null,
  participants: [
    {
      user: {
        id: `user-${i}`,
        name: `User ${i + 1}`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        is_online: Math.random() > 0.5,
      },
    },
  ],
  last_message: {
    content: 'Hey! How are you doing?',
    created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  },
  unread_count: Math.floor(Math.random() * 5),
}));

const ConversationItem = ({ conversation }: { conversation: any }) => {
  const otherUser = conversation.participants[0].user;
  const displayName = conversation.is_group 
    ? conversation.group_name 
    : otherUser.name;
  const displayAvatar = otherUser.avatar_url;
  
  return (
    <Link href={`/messages/${conversation.id}`}>
      <div className="flex items-center gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-light)] last:border-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            <Image
              src={displayAvatar}
              alt={displayName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          {!conversation.is_group && otherUser.is_online && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--success)] border-2 border-white rounded-full" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
              {displayName}
            </h3>
            <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">
              {formatDistanceToNow(new Date(conversation.last_message.created_at))}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] truncate">
            {conversation.last_message.content}
          </p>
        </div>
        
        {/* Unread Badge */}
        {conversation.unread_count > 0 && (
          <div className="w-6 h-6 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
            {conversation.unread_count}
          </div>
        )}
      </div>
    </Link>
  );
};

export default function MessagesPage() {
  return (
    <>
      <TopBar 
        title="Messages" 
        showSearch={false}
        showFilters={false}
        rightAction={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        }
      />
      
      <main className="container mx-auto">
        <Card className="mt-4 overflow-hidden">
          {mockConversations.length > 0 ? (
            mockConversations.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No messages yet
              </h3>
              <p className="text-[var(--text-secondary)]">
                Start a conversation with someone!
              </p>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

