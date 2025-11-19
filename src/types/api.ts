/**
 * API Type Definitions
 * Centralized type definitions for API requests and responses
 */

// ============================================================
// USER & PROFILE TYPES
// ============================================================

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  school: string;
  major?: string;
  year?: string;
  year_level?: string;
  age?: number;
  bio?: string;
  interests?: string[];
  lookingFor?: string[];
  looking_for?: string[];
  profilePicture?: string;
  profile_picture?: string;
  photos?: string[];
  mutualFriends?: number;
  mutual_friends_count?: number;
  is_verified?: boolean;
  bondPrint?: BondPrint;
  goals?: UserGoals;
  socialConnections?: SocialConnections;
  settings?: UserSettings;
  blockedUsers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserGoals {
  academic?: string[];
  leisure?: string[];
  career?: string;
  personal?: string;
}

export interface SocialConnections {
  linkedin?: boolean;
  instagram?: string;
  twitter?: string;
  spotify?: string;
}

export interface UserSettings {
  readReceipts?: boolean;
  profileVisible?: boolean;
  showOnlineStatus?: boolean;
  allowMessages?: boolean;
  notifications?: boolean;
}

export interface BondPrint {
  traits?: Record<string, number>;
  personality?: Personality;
  communication?: Communication;
  social?: Social;
  values?: string[];
  livingPreferences?: LivingPreferences;
  summary?: string;
  createdAt?: string;
  quizVersion?: string;
  professionalInsights?: ProfessionalInsights;
}

export interface Personality {
  primaryType?: string;
  secondaryTraits?: string[];
  description?: string;
}

export interface Communication {
  style?: string;
  preferences?: string[];
}

export interface Social {
  idealSetting?: string;
  rechargeMethod?: string;
  friendshipStyle?: string;
}

export interface LivingPreferences {
  cleanliness?: number;
  noiseLevel?: number;
  socialSpace?: number;
  schedule?: string;
}

export interface ProfessionalInsights {
  skills?: string[];
  careerOrientation?: string;
}

// ============================================================
// FORUM TYPES
// ============================================================

export interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  share_count?: number;
  tags?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  userLiked?: boolean;
  canDelete?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface PostPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostsResponse {
  posts: ForumPost[];
  pagination: PostPagination;
}

// ============================================================
// MESSAGING TYPES
// ============================================================

export interface Chat {
  id: string;
  chatId?: string;
  name: string;
  avatar_url: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  unreadCount?: number;
  isOnline: boolean;
  otherUser?: UserProfile;
  lastMessageTimestamp?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy?: string[];
  readAt?: string;
  type?: 'text' | 'system' | 'ai';
}

export interface ChatPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChatsResponse {
  chats: Chat[];
  pagination: ChatPagination;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: ChatPagination;
}

// ============================================================
// NOTIFICATIONS TYPES
// ============================================================

export type NotificationType = 
  | 'friend_request' 
  | 'message' 
  | 'match' 
  | 'post_like' 
  | 'post_comment' 
  | 'forum_mention' 
  | 'club_invite' 
  | 'study_group_invite';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  created_at: string;
}

export interface NotificationData {
  userId?: string;
  userName?: string;
  avatarUrl?: string;
  actionUrl?: string;
  postId?: string;
  commentId?: string;
  user?: UserProfile;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

// ============================================================
// SEARCH TYPES
// ============================================================

export type SearchType = 'all' | 'users' | 'posts' | 'clubs' | 'classes';

export interface SearchResult {
  users: SearchUser[];
  posts: SearchPost[];
  clubs: SearchClub[];
  classes: SearchClass[];
}

export interface SearchUser {
  id: string;
  name: string;
  major?: string;
  year?: string;
  profilePicture?: string;
  bio?: string;
  school?: string;
}

export interface SearchPost {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface SearchClub {
  id: string;
  name: string;
  description?: string;
  category?: string;
  memberCount: number;
  logoUrl?: string;
}

export interface SearchClass {
  id: string;
  code: string;
  name: string;
  professor?: string;
  semester?: string;
  year?: number;
}

export interface SearchResponse {
  query: string;
  type: SearchType;
  results: SearchResult;
  totalResults: number;
}

// ============================================================
// FRIENDSHIP TYPES
// ============================================================

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface FriendshipsResponse {
  friendships: Friendship[];
}

export interface Connection {
  id: string;
  name: string;
  year?: string;
  major?: string;
  mutual?: number;
  mutualFriends?: number;
  emoji?: string;
  profilePicture?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiError {
  error: string;
  details?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface ProfileFilters {
  school?: string;
  year?: string;
  major?: string;
  interests?: string[];
  lookingFor?: string[];
}

export interface PostFilters {
  filter?: 'all' | 'trending' | 'photos' | 'videos' | 'thoughts' | 'questions' | 'events' | 'anonymous';
}

