/**
 * Centralized type definitions
 * Standardized interfaces across the application
 */

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age?: number;
  school: string;
  major?: string;
  year?: string;
  bio?: string;
  interests?: string[];
  personality?: string[];
  lookingFor?: string[];
  photos?: string[];
  profilePicture?: string;
  bondPrint?: BondPrint;
  hasCompletedBondPrint?: boolean;
  goals?: {
    academic?: string[];
    leisure?: string[];
    career?: string;
    personal?: string;
  };
  additionalInfo?: string;
  settings?: UserSettings;
  blockedUsers?: string[];
  [key: string]: any; // Allow additional fields
}

export interface BondPrint {
  summary?: string;
  traits?: string[];
  values?: string[];
  communicationStyle?: string;
  socialPreferences?: string[];
  collaborationStyle?: string;
  [key: string]: any;
}

export interface UserSettings {
  readReceipts?: boolean;
  profileVisible?: boolean;
  allowMessages?: boolean;
  showOnlineStatus?: boolean;
  notifications?: boolean;
}

// Profile Display Types
export interface Profile {
  id: string;
  name: string;
  age: number;
  school: string;
  major?: string;
  year?: string;
  bio?: string;
  interests?: string[];
  lookingFor?: string[];
  imageUrl?: string;
  profilePicture?: string;
  photos?: string[];
  personality?: string[];
  goals?: {
    academic?: string[];
    leisure?: string[];
  };
  [key: string]: any;
}

// Chat Types
export interface Chat {
  chatId: string;
  otherUser?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'system';
  read?: boolean;
  readAt?: string;
}

// Connection Types
export interface SoftIntro {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  reason?: string;
  analysis?: {
    highlights?: string[];
    recommendation?: string;
    compatibility?: number;
  };
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  status?: number;
  timestamp?: string;
}







