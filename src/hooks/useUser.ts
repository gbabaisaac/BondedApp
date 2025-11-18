import { useAuthStore } from '@/stores/useAuthStore';

export const useUser = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
  };
};

