/**
 * Deep linking utilities for sharing profiles and chats
 */

export function generateProfileShareUrl(userId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/profile/${userId}`;
}

export function generateChatShareUrl(chatId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/chat/${chatId}`;
}

export function parseDeepLink(url: string): { type: 'profile' | 'chat' | null; id: string | null } {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Match /profile/:userId
    const profileMatch = path.match(/^\/profile\/([^\/]+)$/);
    if (profileMatch) {
      return { type: 'profile', id: profileMatch[1] };
    }

    // Match /chat/:chatId
    const chatMatch = path.match(/^\/chat\/([^\/]+)$/);
    if (chatMatch) {
      return { type: 'chat', id: chatMatch[1] };
    }

    return { type: null, id: null };
  } catch {
    return { type: null, id: null };
  }
}

export function shareProfile(userId: string, userName: string): void {
  const url = generateProfileShareUrl(userId);
  const text = `Check out ${userName}'s profile on Bonded!`;

  if (navigator.share) {
    navigator.share({
      title: `${userName} on Bonded`,
      text,
      url,
    }).catch(() => {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
    });
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(url);
  }
}

export function shareChat(chatId: string, chatName: string): void {
  const url = generateChatShareUrl(chatId);
  const text = `Join the conversation with ${chatName} on Bonded!`;

  if (navigator.share) {
    navigator.share({
      title: `Chat with ${chatName}`,
      text,
      url,
    }).catch(() => {
      navigator.clipboard.writeText(url);
    });
  } else {
    navigator.clipboard.writeText(url);
  }
}


