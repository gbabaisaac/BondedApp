'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { 
  UserPlus, Heart, MessageCircle, Check, 
  Bell, BellOff, Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/utils/api-client';
import { useAccessToken } from '@/store/useAppStore';
import { toast } from 'sonner';

const NotificationItem = ({ notification }: { notification: any }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'friend_request':
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="h-5 w-5" />;
      case 'post_like':
        return <Heart className="h-5 w-5" />;
      case 'post_comment':
      case 'message':
      case 'message_received':
        return <MessageCircle className="h-5 w-5" />;
      case 'match':
        return <Heart className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Extract user info from notification data or use defaults
  const userInfo = notification.data?.user || {
    name: notification.data?.userName || 'Someone',
    avatar_url: notification.data?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.id}`,
  };
  
  return (
    <Link href={notification.data?.actionUrl || '#'}>
      <div className={cn(
        'flex items-start gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-light)] last:border-0 cursor-pointer',
        !notification.read && 'bg-[var(--primary)]/5'
      )}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            <Image
              src={userInfo.avatar_url}
              alt={userInfo.name}
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
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            {notification.title}
          </p>
          <p className="text-sm text-[var(--text-primary)] mb-1">
            {notification.message}
          </p>
          <span className="text-xs text-[var(--text-secondary)]">
            {formatDistanceToNow(new Date(notification.created_at))}
          </span>
        </div>
        
        {/* Unread Indicator */}
        {!notification.read && (
          <div className="w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
};

export default function NotificationsPage() {
  const accessToken = useAccessToken();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [accessToken, filter]);

  const loadNotifications = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications(accessToken, filter === 'unread');
      setNotifications(data.notifications || []);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.warn('Authentication error loading notifications');
        setNotifications([]);
      } else if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        console.warn('Network error loading notifications');
        setNotifications([]);
      } else {
        toast.error(error.message || 'Failed to load notifications');
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!accessToken || markingAllRead) return;

    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead(accessToken);
      await loadNotifications(); // Reload to update UI
      toast.success('All notifications marked as read');
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
      toast.error(error.message || 'Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read && accessToken) {
      try {
        await markNotificationAsRead(notification.id, accessToken);
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <TopBar 
        title="Notifications" 
        showBack={true}
        showSearch={false}
        showNotifications={false}
        rightAction={
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAllRead || unreadCount === 0}
          >
            {markingAllRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Mark all read'
            )}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} onClick={() => handleNotificationClick(notification)}>
                <NotificationItem notification={notification} />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <BellOff className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No notifications
              </h3>
              <p className="text-[var(--text-secondary)]">
                {filter === 'unread' ? "You're all caught up!" : "No notifications yet"}
              </p>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

