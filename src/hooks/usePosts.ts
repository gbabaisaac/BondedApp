import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, likePost } from '../utils/api-client';
import { useAccessToken } from '../store/useAppStore';
import { ForumPost } from '../types/api';
import { toast } from 'sonner';

export function usePosts(filter?: string) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: ['posts', filter, accessToken],
    queryFn: async () => {
      if (!accessToken) throw new Error('No access token');
      const data = await getPosts(accessToken, filter) as any;
      return {
        posts: data.posts || (Array.isArray(data) ? data : []),
        pagination: data.pagination,
      };
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreatePost() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: {
      content: string;
      isAnonymous: boolean;
      mediaUrls?: string[];
    }) => {
      if (!accessToken) throw new Error('No access token');
      return createPost(postData, accessToken);
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
}

export function useLikePost() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!accessToken) throw new Error('No access token');
      return likePost(postId, accessToken);
    },
    onSuccess: () => {
      // Invalidate posts to refetch with updated like status
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to like post');
    },
  });
}

