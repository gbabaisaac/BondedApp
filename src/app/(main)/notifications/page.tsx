'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { 
  UserPlus, Heart, MessageCircle, Check, 
  Bell, BellOff 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock notifications
const mockNotifications = Array.from({ length: 15 }, (_, i) => {
  const types = ['connection_request', 'connection_accepted', 'post_like', 'post_comment', 'message_received'];
  const type = types[i % types.length];
  
  return {
    id: `notif-${i}`,
    type,
    title: type === 'connection_request' ? 'New connection request'
      : type === 'connection_accepted' ? 'Connection accepted'
      : type === 'post_like' ? 'New like on your post'
      : type === 'post_comment' ? 'New comment on your post'
      : 'New message',
    body: type === 'connection_request' ? 'wants to connect with you'
      : type === 'connection_accepted' ? 'accepted your connection request'
      : type === 'post_like' ? 'liked your post'
      : type === 'post_comment' ? 'commented on your post'
      : 'sent you a message',
    related_user: {
      id: `user-${i}`,
      name: `User ${i + 1}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    },
    is_read: Math.random() > 0.5,
    created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
  };
});

const NotificationItem = ({ notification }: { notification: any }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="h-5 w-5" />;
      case 'post_like':
        return <Heart className="h-5 w-5" />;
      case 'post_comment':
      case 'message_received':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <Link href={notification.action_url || '#'}>
      <div className={cn(
        'flex items-start gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-light)] last:border-0',
        !notification.is_read && 'bg-[var(--primary)]/5'
      )}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            <Image
              src={notification.related_user.avatar_url}
              alt={notification.related_user.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
            {getIcon()}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)] mb-1">
            <span className="font-bold">{notification.related_user.name}</span>
            {' '}
            {notification.body}
          </p>
          <span className="text-xs text-[var(--text-secondary)]">
            {formatDistanceToNow(new Date(notification.created_at))}
          </span>
        </div>
        
        {/* Unread Indicator */}
        {!notification.is_read && (
          <div className="w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = mockNotifications.filter(n => !n.is_read).length;
  
  const filteredNotifications = filter === 'unread'
    ? mockNotifications.filter(n => !n.is_read)
    : mockNotifications;

  return (
    <>
      <TopBar 
        title="Notifications" 
        showBack={true}
        showSearch={false}
        showNotifications={false}
        rightAction={
          <Button variant="ghost" size="sm">
            Mark all read
          </Button>
        }
      />
      
      {/* Filter Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-[var(--border-light)]">
        <div className="container mx-auto px-4 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'flex-1 py-4 border-b-2 transition-colors font-semibold',
              filter === 'all'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-secondary)]'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'flex-1 py-4 border-b-2 transition-colors font-semibold flex items-center justify-center gap-2',
              filter === 'unread'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-secondary)]'
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[var(--primary)] text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <main className="container mx-auto">
        <Card className="mt-4 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="p-8 text-center">
              <BellOff className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No notifications
              </h3>
              <p className="text-[var(--text-secondary)]">
                You're all caught up!
              </p>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

