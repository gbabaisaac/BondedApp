import { useQuery } from '@tanstack/react-query';
import { getAllProfiles } from '../utils/api-client';
import { useAccessToken } from '../store/useAppStore';
import { ProfileFilters } from '../types/api';

export function useProfiles(filters?: ProfileFilters) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: ['profiles', filters, accessToken],
    queryFn: async () => {
      if (!accessToken) throw new Error('No access token');
      const response = await getAllProfiles(accessToken, filters) as any;
      return {
        profiles: response.profiles || response || [],
        pagination: response.pagination,
      };
    },
    enabled: !!accessToken && !!filters?.school,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

