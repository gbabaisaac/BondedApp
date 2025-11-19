import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/api-client';
import { useAccessToken } from '../store/useAppStore';
import { Notification } from '../types/api';
import { toast } from 'sonner';

export function useNotifications(unreadOnly: boolean = false) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: ['notifications', unreadOnly, accessToken],
    queryFn: async () => {
      if (!accessToken) throw new Error('No access token');
      const data = await getNotifications(accessToken, unreadOnly);
      return (data as { notifications: Notification[] }).notifications || [];
    },
    enabled: !!accessToken,
    staleTime: 1000 * 30, // 30 seconds (notifications should be fresh)
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useMarkNotificationRead() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!accessToken) throw new Error('No access token');
      return markNotificationAsRead(notificationId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('No access token');
      return markAllNotificationsAsRead(accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all as read');
    },
  });
}

