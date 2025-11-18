/**
 * Unified API Client for Bonded App
 * Handles all backend communication with proper error handling
 */

import { projectId } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2516be19`;

interface ApiError {
  error: string;
  details?: string;
}

/**
 * Generic API call with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    // Handle network errors (TypeError: Failed to fetch)
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      const networkError = new Error('Failed to fetch - Network error. Please check your connection.');
      networkError.name = 'TypeError';
      console.error(`API Error [${endpoint}]: Network error`, networkError);
      throw networkError;
    }
    
    // Re-throw other errors as-is
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================
// PROFILE APIs
// ============================================================

export async function createProfile(profileData: any, accessToken: string) {
  return apiCall('/profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }, accessToken);
}

export async function getProfile(userId: string, accessToken: string) {
  return apiCall(`/profile/${userId}`, {
    method: 'GET',
  }, accessToken);
}

export async function updateProfile(userId: string, updates: any, accessToken: string) {
  return apiCall(`/profile/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }, accessToken);
}

export async function getUserInfo(accessToken: string) {
  return apiCall('/user-info', {
    method: 'GET',
  }, accessToken);
}

// ============================================================
// YEARBOOK / PROFILES APIs
// ============================================================

export async function getAllProfiles(accessToken: string, filters?: {
  school?: string;
  year?: string;
  major?: string;
  interests?: string[];
}) {
  const params = new URLSearchParams();
  
  // School is REQUIRED by the backend
  if (!filters?.school) {
    throw new Error('School parameter is required');
  }
  
  params.append('school', filters.school);
  if (filters?.year) params.append('year', filters.year);
  if (filters?.major) params.append('major', filters.major);
  if (filters?.interests) params.append('interests', filters.interests.join(','));
  
  const queryString = params.toString();
  const endpoint = `/profiles?${queryString}`;
  
  return apiCall(endpoint, {
    method: 'GET',
  }, accessToken);
}

export async function searchProfiles(query: string, accessToken: string) {
  // Use the new global search endpoint
  return apiCall(`/search?q=${encodeURIComponent(query)}&type=users`, {
    method: 'GET',
  }, accessToken);
}

// Global search - search users, posts, clubs, classes
export async function globalSearch(query: string, type: 'all' | 'users' | 'posts' | 'clubs' | 'classes' = 'all', accessToken: string) {
  return apiCall(`/search?q=${encodeURIComponent(query)}&type=${type}`, {
    method: 'GET',
  }, accessToken);
}

export async function getCompatibility(targetUserId: string, accessToken: string) {
  return apiCall(`/compatibility/${targetUserId}`, {
    method: 'GET',
  }, accessToken);
}

// ============================================================
// FRIENDS APIs
// ============================================================

export async function getFriends(accessToken: string) {
  return apiCall('/friendships?status=accepted', {
    method: 'GET',
  }, accessToken);
}

export async function getFriendRequests(accessToken: string) {
  return apiCall('/friendships?status=pending', {
    method: 'GET',
  }, accessToken);
}

export async function sendFriendRequest(targetUserId: string, accessToken: string) {
  return apiCall('/friendships/request', {
    method: 'POST',
    body: JSON.stringify({ friendId: targetUserId }),
  }, accessToken);
}

export async function acceptFriendRequest(requestId: string, accessToken: string) {
  return apiCall(`/friendships/${requestId}/accept`, {
    method: 'POST',
  }, accessToken);
}

export async function rejectFriendRequest(requestId: string, accessToken: string) {
  return apiCall(`/friendships/${requestId}/decline`, {
    method: 'POST',
  }, accessToken);
}

export async function removeFriend(friendId: string, accessToken: string) {
  return apiCall(`/friendships/${friendId}`, {
    method: 'DELETE',
  }, accessToken);
}

// ============================================================
// FORUM / POSTS APIs
// ============================================================

export async function getPosts(accessToken: string, filter?: string) {
  const endpoint = filter ? `/forum/posts?filter=${filter}` : '/forum/posts';
  return apiCall(endpoint, {
    method: 'GET',
  }, accessToken);
}

export async function createPost(postData: {
  content: string;
  isAnonymous: boolean;
  tags?: string[];
  mediaUrls?: string[];
}, accessToken: string) {
  return apiCall('/forum/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }, accessToken);
}

export async function likePost(postId: string, accessToken: string) {
  // This endpoint toggles the like - if already liked, it unlikes
  return apiCall(`/forum/posts/${postId}/like`, {
    method: 'POST',
  }, accessToken);
}

export async function commentOnPost(postId: string, content: string, accessToken: string) {
  return apiCall(`/forum/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }, accessToken);
}

export async function getPostComments(postId: string, accessToken: string) {
  return apiCall(`/forum/posts/${postId}/comments`, {
    method: 'GET',
  }, accessToken);
}

export async function reportPost(postId: string, reason: string, accessToken: string) {
  return apiCall(`/forum/posts/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }, accessToken);
}

// ============================================================
// MESSAGES / CHAT APIs
// ============================================================

export async function getConversations(accessToken: string) {
  // Backend uses /chats endpoint
  return apiCall('/chats', {
    method: 'GET',
  }, accessToken);
}

export async function getMessages(conversationId: string, accessToken: string) {
  // Backend uses /chat/:chatId/messages endpoint
  return apiCall(`/chat/${conversationId}/messages`, {
    method: 'GET',
  }, accessToken);
}

export async function sendMessage(data: {
  recipientId?: string;
  conversationId?: string;
  content: string;
}, accessToken: string) {
  return apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

export async function markMessagesAsRead(conversationId: string, accessToken: string) {
  return apiCall(`/messages/conversations/${conversationId}/read`, {
    method: 'POST',
  }, accessToken);
}

// ============================================================
// BOND PRINT APIs
// ============================================================

export async function startBondPrintQuiz(userProfile: any, accessToken: string) {
  return apiCall('/bond-print/start', {
    method: 'POST',
    body: JSON.stringify({ userProfile }),
  }, accessToken);
}

export async function submitBondPrintAnswer(data: {
  answer: string;
  questionText: string;
}, accessToken: string) {
  return apiCall('/bond-print/answer', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

export async function generateBondPrint(accessToken: string) {
  return apiCall('/bond-print/generate', {
    method: 'POST',
  }, accessToken);
}

export async function getBondPrint(userId: string, accessToken: string) {
  return apiCall(`/bond-print/${userId}`, {
    method: 'GET',
  }, accessToken);
}

// ============================================================
// SOFT INTRO APIs
// ============================================================

export async function sendSoftIntro(data: {
  targetUserId: string;
  message: string;
  method: 'chat' | 'instagram' | 'snapchat';
}, accessToken: string) {
  return apiCall('/soft-intro', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

// ============================================================
// UTILITY APIs
// ============================================================

export async function uploadMedia(file: File, accessToken: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Determine file type
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const type = isImage ? 'image' : isVideo ? 'video' : 'image';
  formData.append('type', type);

  const response = await fetch(`${BASE_URL}/forum/upload-media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to upload media' }));
    throw new Error(errorData.error || 'Failed to upload media');
  }

  return await response.json();
}

// ============================================================
// LEGACY EXPORT (for backwards compatibility)
// ============================================================

export async function apiGet(endpoint: string, accessToken?: string) {
  return apiCall(endpoint, { method: 'GET' }, accessToken);
}

export async function apiPost(endpoint: string, data: any, accessToken?: string) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

export async function apiPatch(endpoint: string, data: any, accessToken?: string) {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, accessToken);
}

export async function apiDelete(endpoint: string, accessToken?: string) {
  return apiCall(endpoint, { method: 'DELETE' }, accessToken);
}
