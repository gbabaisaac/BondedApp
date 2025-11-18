import { getSupabaseClient } from '@/utils/supabase/client';

class APIService {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  // Users
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        school:schools(*),
        photos:user_photos(*),
        interests:user_interests(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Yearbook
  async getYearbookUsers(filters?: any) {
    let query = this.supabase
      .from('users')
      .select(`
        *,
        school:schools(*),
        photos:user_photos(*)
      `)
      .eq('is_banned', false)
      .limit(30);

    if (filters?.year_level) {
      query = query.eq('year_level', filters.year_level);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Forum
  async getForumPosts(filters?: any) {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        author:users(*),
        reactions:post_reactions(*),
        comments:comments(count)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }

  async createPost(postData: any) {
    const { data, error } = await this.supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Connections
  async sendConnectionRequest(targetUserId: string) {
    const { data, error } = await this.supabase
      .from('connections')
      .insert({
        requester_id: (await this.supabase.auth.getUser()).data.user?.id,
        receiver_id: targetUserId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Messages
  async getConversations() {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user:users(*)
        ),
        last_message:messages(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async sendMessage(conversationId: string, content: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: (await this.supabase.auth.getUser()).data.user?.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Notifications
  async getNotifications() {
    const { data, error } = await this.supabase
      .from('notifications')
      .select(`
        *,
        related_user:users(*)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  async markNotificationRead(notificationId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
}

export const api = new APIService();

