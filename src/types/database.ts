/**
 * Complete Database Types for Bonded
 * Based on the comprehensive schema
 */

export interface School {
  id: string;
  name: string;
  short_name: string;
  domain: string;
  logo_url: string | null;
  colors: SchoolColors;
  location: string | null;
  student_count: number | null;
  founded_year: number | null;
  is_active: boolean;
  waitlist_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolColors {
  primary: string;
  secondary: string;
  accent: string;
  bgGradientStart: string;
  bgGradientEnd: string;
}

export interface User {
  id: string;
  school_id: string;
  email: string;
  email_verified: boolean;
  name: string;
  avatar_url: string | null;
  cover_photo_url: string | null;
  bio: string | null;
  
  // Academic
  major: string | null;
  minor: string | null;
  graduation_year: number | null;
  year_level: YearLevel | null;
  gpa: number | null;
  
  // Personal
  age: number | null;
  birthday: string | null;
  gender: string | null;
  pronouns: string | null;
  location: string | null;
  hometown: string | null;
  
  // Social
  phone: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  personal_website: string | null;
  
  // Privacy
  profile_visibility: 'public' | 'connections' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_birthday: boolean;
  show_last_active: boolean;
  
  // Features
  bond_print_completed: boolean;
  scrapbook_active: boolean;
  forum_anonymous_by_default: boolean;
  
  // Status
  is_verified: boolean;
  is_banned: boolean;
  is_premium: boolean;
  last_active_at: string;
  
  created_at: string;
  updated_at: string;
}

export type YearLevel = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Grad' | 'Alumni';

export interface UserPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  order_index: number;
  is_profile_photo: boolean;
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest: string;
  emoji: string | null;
  category: InterestCategory;
  created_at: string;
}

export type InterestCategory = 'academic' | 'sports' | 'arts' | 'music' | 'tech' | 'food' | 'travel';

export interface UserLookingFor {
  id: string;
  user_id: string;
  looking_for: LookingForType;
  created_at: string;
}

export type LookingForType = 'friends' | 'study_partners' | 'roommates' | 'co_founders' | 'event_buddies';

// Connections
export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface ConnectionSuggestion {
  id: string;
  user_id: string;
  suggested_user_id: string;
  suggestion_reason: SuggestionReason;
  score: number;
  dismissed: boolean;
  created_at: string;
}

export type SuggestionReason = 'same_major' | 'mutual_friends' | 'similar_interests' | 'bond_print';

// Posts
export interface Post {
  id: string;
  user_id: string;
  school_id: string;
  content: string;
  media_urls: string[] | null;
  post_type: PostType;
  is_anonymous: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  is_flagged: boolean;
  is_removed: boolean;
  removed_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type PostType = 'text' | 'image' | 'video' | 'question' | 'poll';

export interface PostTag {
  id: string;
  post_id: string;
  tag: string;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_anonymous: boolean;
  like_count: number;
  is_flagged: boolean;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
}

// Messaging
export interface Conversation {
  id: string;
  is_group: boolean;
  group_name: string | null;
  group_avatar_url: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  nickname: string | null;
  is_admin: boolean;
  notifications_enabled: boolean;
  is_muted: boolean;
  joined_at: string;
  left_at: string | null;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: MediaType | null;
  message_type: MessageType;
  reply_to_message_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
}

export type MediaType = 'image' | 'video' | 'audio' | 'file';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';

// Bond Print
export interface BondPrint {
  id: string;
  user_id: string;
  
  // Big 5 Scores
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotional_stability: number;
  
  // Communication
  communication_style: CommunicationStyle;
  conflict_style: ConflictStyle;
  
  // Attachment
  attachment_style: AttachmentStyle;
  love_languages: string[];
  
  // Lifestyle
  activity_level: ActivityLevel;
  organization_level: OrganizationLevel;
  sleep_schedule: SleepSchedule;
  energy_level: EnergyLevel;
  
  // Values
  core_values: string[];
  dealbreakers: string[];
  
  // Archetype
  archetype: PersonalityArchetype;
  archetype_description: string | null;
  
  completed_at: string | null;
  quiz_version: string | null;
  created_at: string;
  updated_at: string;
}

export type CommunicationStyle = 'direct' | 'indirect' | 'analytical' | 'emotional';
export type ConflictStyle = 'avoidant' | 'accommodating' | 'competing' | 'collaborating' | 'compromising';
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'fearful-avoidant';
export type ActivityLevel = 'homebody' | 'balanced' | 'social_butterfly';
export type OrganizationLevel = 'messy' | 'organized' | 'flexible';
export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type EnergyLevel = 'low' | 'moderate' | 'high';
export type PersonalityArchetype = 'adventurer' | 'nurturer' | 'analyst' | 'creative' | 'social_butterfly';

export interface CompatibilityScore {
  id: string;
  user_1_id: string;
  user_2_id: string;
  overall_score: number;
  personality_score: number;
  lifestyle_score: number;
  values_score: number;
  communication_score: number;
  interests_score: number;
  breakdown: Record<string, any>;
  computed_at: string;
}

// Scrapbook
export interface ScrapbookProfile {
  id: string;
  user_id: string;
  looking_for: string;
  interested_in: string[];
  age_range_min: number | null;
  age_range_max: number | null;
  is_visible: boolean;
  blind_chat_default: boolean;
  slow_reveal_enabled: boolean;
  max_active_matches: number;
  is_active: boolean;
  paused_until: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttractionRating {
  id: string;
  rater_id: string;
  rated_id: string;
  rating: number; // 1-10
  rating_session_id: string | null;
  time_spent_viewing: number | null;
  profile_viewed: boolean;
  created_at: string;
}

export interface ScrapbookMatch {
  id: string;
  user_1_id: string;
  user_2_id: string;
  compatibility_score: number;
  compatibility_breakdown: Record<string, any> | null;
  mutual_rating_avg: number | null;
  current_stage: MatchStage;
  text_stage_started_at: string;
  voice_stage_started_at: string | null;
  reveal_requested_at: string | null;
  profile_revealed_at: string | null;
  user_1_ready_to_reveal: boolean;
  user_2_ready_to_reveal: boolean;
  total_messages: number;
  total_voice_messages: number;
  avg_response_time_minutes: number | null;
  conversation_sentiment: number | null;
  conversation_quality_score: number | null;
  safety_score: number;
  flagged_messages: number;
  moderation_notes: string | null;
  status: MatchStatus;
  ended_reason: string | null;
  ended_by_user_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MatchStage = 'text' | 'voice' | 'revealed' | 'expired';
export type MatchStatus = 'active' | 'paused' | 'ended' | 'blocked' | 'expired';

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_user_id: string | null;
  related_post_id: string | null;
  related_comment_id: string | null;
  related_message_id: string | null;
  related_match_id: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'message_received'
  | 'post_like'
  | 'post_comment'
  | 'comment_reply'
  | 'mention'
  | 'scrapbook_match'
  | 'scrapbook_message'
  | 'scrapbook_voice_unlocked'
  | 'scrapbook_reveal_ready'
  | 'scrapbook_profile_revealed';

// Reports & Moderation
export interface Report {
  id: string;
  reporter_id: string | null;
  reported_type: ReportedType;
  reported_user_id: string | null;
  reported_post_id: string | null;
  reported_comment_id: string | null;
  reported_message_id: string | null;
  reported_match_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewed_by_admin_id: string | null;
  review_notes: string | null;
  action_taken: ReportAction | null;
  created_at: string;
  reviewed_at: string | null;
}

export type ReportedType = 'user' | 'post' | 'comment' | 'message' | 'match';
export type ReportReason = 'harassment' | 'inappropriate' | 'spam' | 'fake' | 'dangerous';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportAction = 'warning' | 'content_removed' | 'user_banned' | 'no_action';

// Extended types with relations
export interface UserWithDetails extends User {
  school: School;
  photos: UserPhoto[];
  interests: UserInterest[];
  looking_for: UserLookingFor[];
  bond_print: BondPrint | null;
  connection_count: number;
  mutual_friends: User[];
  is_online: boolean;
  connection_status: ConnectionStatus | null;
}

export interface PostWithDetails extends Post {
  author: User;
  tags: PostTag[];
  reactions: PostReaction[];
  comments: Comment[];
  has_user_liked: boolean;
  has_user_reacted: boolean;
}

export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & { user: User })[];
  last_message: Message | null;
  unread_count: number;
}

