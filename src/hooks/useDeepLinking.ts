import { useEffect } from 'react';
import { parseDeepLink } from '../utils/deep-linking';

interface DeepLinkHandler {
  onProfileOpen?: (userId: string) => void;
  onChatOpen?: (chatId: string) => void;
}

/**
 * Hook to handle deep linking in the app
 */
export function useDeepLinking(handlers: DeepLinkHandler) {
  useEffect(() => {
    // Handle initial URL
    const handleInitialUrl = () => {
      const link = parseDeepLink(window.location.href);
      if (link.type === 'profile' && link.id && handlers.onProfileOpen) {
        handlers.onProfileOpen(link.id);
      } else if (link.type === 'chat' && link.id && handlers.onChatOpen) {
        handlers.onChatOpen(link.id);
      }
    };

    handleInitialUrl();

    // Handle URL changes (for SPA navigation)
    const handlePopState = () => {
      handleInitialUrl();
    };

    window.addEventListener('popstate', handlePopState);

    // Handle app URL open (for Capacitor)
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const { App } = require('@capacitor/app');
      
      App.addListener('appUrlOpen', (data: { url: string }) => {
        const link = parseDeepLink(data.url);
        if (link.type === 'profile' && link.id && handlers.onProfileOpen) {
          handlers.onProfileOpen(link.id);
        } else if (link.type === 'chat' && link.id && handlers.onChatOpen) {
          handlers.onChatOpen(link.id);
        }
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handlers.onProfileOpen, handlers.onChatOpen]);
}


