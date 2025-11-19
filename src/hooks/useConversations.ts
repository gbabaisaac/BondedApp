import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../utils/api-client';
import { useAccessToken } from '../store/useAppStore';
import { Chat } from '../types/api';

export function useConversations() {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: ['conversations', accessToken],
    queryFn: async () => {
      if (!accessToken) throw new Error('No access token');
      const response = await getConversations(accessToken) as any;
      const data = response.chats || response || [];
      return {
        chats: data as Chat[],
        pagination: response.pagination,
      };
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time feel
  });
}

