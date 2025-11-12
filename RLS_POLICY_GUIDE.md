# Row Level Security (RLS) Policy Guide

## Overview
This guide outlines the recommended RLS policies for the Bonded application's Supabase database.

## Current Status
The application currently uses a key-value store pattern with Edge Functions for data access. RLS policies should be implemented if migrating to standard PostgreSQL tables.

## Recommended Policies

### 1. User Profiles Table (if migrated from KV store)

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view profiles from same school (if profileVisible = true)
CREATE POLICY "Users can view visible profiles from same school"
  ON user_profiles
  FOR SELECT
  USING (
    settings->>'profileVisible' = 'true' AND
    school = (SELECT school FROM user_profiles WHERE id = auth.uid())
  );

-- Blocked users cannot view each other
CREATE POLICY "Blocked users cannot view each other"
  ON user_profiles
  FOR SELECT
  USING (
    id NOT IN (
      SELECT unnest(blocked_users::text[]) 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );
```

### 2. Messages Table

```sql
-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in chats they're part of
CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  USING (
    sender_id = auth.uid() OR
    chat_id IN (
      SELECT chat_id FROM chats 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Users can send messages in chats they're part of
CREATE POLICY "Users can send messages in own chats"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    chat_id IN (
      SELECT chat_id FROM chats 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );
```

### 3. Soft Intros Table

```sql
-- Enable RLS
ALTER TABLE soft_intros ENABLE ROW LEVEL SECURITY;

-- Users can view intros they sent or received
CREATE POLICY "Users can view own intros"
  ON soft_intros
  FOR SELECT
  USING (
    from_user_id = auth.uid() OR
    to_user_id = auth.uid()
  );

-- Users can create intros
CREATE POLICY "Users can create intros"
  ON soft_intros
  FOR INSERT
  WITH CHECK (from_user_id = auth.uid());
```

## Implementation Steps

1. **Review Current Architecture**: The app uses KV store, so RLS may not be immediately applicable
2. **Migration Plan**: If migrating to standard tables, implement policies gradually
3. **Testing**: Test each policy with different user scenarios
4. **Monitoring**: Monitor for policy violations in Supabase logs

## Notes

- RLS policies are enforced at the database level
- Edge Functions bypass RLS (use service role key)
- Consider adding policies for admin access if needed
- Test thoroughly before enabling in production


