-- Migration: Seed Test Profiles for Development
-- Created: 2025-01-03
-- Description: Creates 50+ test profiles with realistic data for testing the Yearbook grid

-- First, ensure we have a test university
INSERT INTO universities (id, name, domain, slug, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test University', 'test.edu', 'test', true)
ON CONFLICT (slug) DO NOTHING;

-- Get the university ID
DO $$
DECLARE
  test_university_id UUID;
  test_user_id UUID;
  first_names TEXT[] := ARRAY[
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Sam', 'Cameron', 'Dakota', 'Blake', 'Sage', 'River', 'Phoenix', 'Skylar',
    'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper',
    'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia',
    'Liam', 'Noah', 'Oliver', 'William', 'Elijah', 'James', 'Benjamin', 'Lucas',
    'Mason', 'Ethan', 'Alexander', 'Henry', 'Jacob', 'Michael', 'Daniel', 'Logan'
  ];
  last_names TEXT[] := ARRAY[
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
    'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
    'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
  ];
  majors TEXT[] := ARRAY[
    'Computer Science', 'Business Administration', 'Psychology', 'Biology', 'Engineering',
    'Communications', 'Economics', 'Political Science', 'English', 'Mathematics',
    'Marketing', 'Finance', 'Nursing', 'Education', 'Art', 'Music', 'History',
    'Chemistry', 'Physics', 'Sociology', 'Philosophy', 'Journalism', 'Architecture',
    'Environmental Science', 'Public Health', 'Data Science', 'Graphic Design', 'Theater'
  ];
  class_years TEXT[] := ARRAY['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'];
  looking_for_options TEXT[] := ARRAY[
    'study-partner', 'roommate', 'gym-buddy', 'hiking-buddy', 'gaming-buddy',
    'music-partner', 'co-founder', 'mentor', 'mentee', 'travel-buddy'
  ];
  interests_list TEXT[] := ARRAY[
    'Music', 'Gaming', 'Hiking', 'Reading', 'Cooking', 'Photography', 'Art',
    'Sports', 'Travel', 'Movies', 'Fitness', 'Yoga', 'Dancing', 'Writing',
    'Technology', 'Entrepreneurship', 'Volunteering', 'Fashion', 'Food'
  ];
  personality_tags_list TEXT[] := ARRAY[
    'Creative', 'Outgoing', 'Introverted', 'Analytical', 'Adventurous',
    'Thoughtful', 'Energetic', 'Calm', 'Ambitious', 'Easygoing', 'Focused',
    'Spontaneous', 'Organized', 'Flexible', 'Passionate', 'Supportive'
  ];
  pronouns_list TEXT[] := ARRAY['he/him', 'she/her', 'they/them'];
  i INTEGER;
  profile_name TEXT;
  profile_email TEXT;
  profile_major TEXT;
  profile_year TEXT;
  profile_age INTEGER;
  profile_pronouns TEXT;
  profile_bio TEXT;
  profile_looking_for JSONB;
  profile_interests JSONB;
  profile_personality JSONB;
  profile_photo_url TEXT;
  photo_number INTEGER;
BEGIN
  -- Get test university ID
  SELECT id INTO test_university_id FROM universities WHERE slug = 'test' LIMIT 1;
  
  IF test_university_id IS NULL THEN
    RAISE EXCEPTION 'Test university not found';
  END IF;

  -- Create 50 test profiles
  FOR i IN 1..50 LOOP
    -- Generate random profile data
    profile_name := first_names[1 + floor(random() * array_length(first_names, 1))::int] || ' ' || 
                    last_names[1 + floor(random() * array_length(last_names, 1))::int];
    profile_email := 'test' || i || '@test.edu';
    profile_major := majors[1 + floor(random() * array_length(majors, 1))::int];
    profile_year := class_years[1 + floor(random() * array_length(class_years, 1))::int];
    profile_age := 18 + floor(random() * 7)::int; -- Ages 18-24
    profile_pronouns := pronouns_list[1 + floor(random() * array_length(pronouns_list, 1))::int];
    
    -- Generate bio
    profile_bio := 'Hey! I''m a ' || profile_year || ' studying ' || profile_major || 
                   '. Love meeting new people and exploring campus!';
    
    -- Generate random looking_for (2-4 items)
    profile_looking_for := (
      SELECT jsonb_agg(looking_for_options[1 + floor(random() * array_length(looking_for_options, 1))::int])
      FROM generate_series(1, 2 + floor(random() * 3)::int)
    );
    
    -- Generate random interests (3-6 items)
    profile_interests := (
      SELECT jsonb_agg(DISTINCT interests_list[1 + floor(random() * array_length(interests_list, 1))::int])
      FROM generate_series(1, 3 + floor(random() * 4)::int)
      LIMIT 5
    );
    
    -- Generate random personality tags (2-4 items)
    profile_personality := (
      SELECT jsonb_agg(DISTINCT personality_tags_list[1 + floor(random() * array_length(personality_tags_list, 1))::int])
      FROM generate_series(1, 2 + floor(random() * 3)::int)
      LIMIT 4
    );
    
    -- Use Unsplash for profile photos (different photos for variety)
    photo_number := (i % 20) + 1; -- Cycle through 20 different photos
    profile_photo_url := 'https://images.unsplash.com/photo-' || 
      CASE photo_number
        WHEN 1 THEN '1494790108377-be9c29b29330?w=800&q=80'
        WHEN 2 THEN '1507003211169-0a1dd7228f2d?w=800&q=80'
        WHEN 3 THEN '1500648767791-00dcc994a43e?w=800&q=80'
        WHEN 4 THEN '1506794778202-cad84cf45f1d?w=800&q=80'
        WHEN 5 THEN '1517841905240-472988babdf9?w=800&q=80'
        WHEN 6 THEN '1534528741775-53994a69daeb?w=800&q=80'
        WHEN 7 THEN '1508214751196-bcfd4ca60f91?w=800&q=80'
        WHEN 8 THEN '1506794778202-cad84cf45f1d?w=800&q=80'
        WHEN 9 THEN '1517841905240-472988babdf9?w=800&q=80'
        WHEN 10 THEN '1534528741775-53994a69daeb?w=800&q=80'
        WHEN 11 THEN '1507003211169-0a1dd7228f2d?w=800&q=80'
        WHEN 12 THEN '1500648767791-00dcc994a43e?w=800&q=80'
        WHEN 13 THEN '1494790108377-be9c29b29330?w=800&q=80'
        WHEN 14 THEN '1508214751196-bcfd4ca60f91?w=800&q=80'
        WHEN 15 THEN '1506794778202-cad84cf45f1d?w=800&q=80'
        WHEN 16 THEN '1517841905240-472988babdf9?w=800&q=80'
        WHEN 17 THEN '1534528741775-53994a69daeb?w=800&q=80'
        WHEN 18 THEN '1507003211169-0a1dd7228f2d?w=800&q=80'
        WHEN 19 THEN '1500648767791-00dcc994a43e?w=800&q=80'
        WHEN 20 THEN '1494790108377-be9c29b29330?w=800&q=80'
      END;
    
    -- Generate a UUID for the profile (we'll use a deterministic approach for test data)
    test_user_id := gen_random_uuid();
    
    -- Insert profile
    INSERT INTO profiles (
      id,
      university_id,
      email,
      first_name,
      last_name,
      display_name,
      name,
      pronouns,
      bio,
      graduation_year,
      major,
      class_year,
      age,
      avatar_url,
      photos,
      yearbook_visible,
      personality_tags,
      interests,
      looking_for,
      personality,
      school,
      friend_mode_enabled,
      has_completed_bond_print,
      created_at,
      updated_at,
      last_active
    ) VALUES (
      test_user_id,
      test_university_id,
      profile_email,
      split_part(profile_name, ' ', 1),
      split_part(profile_name, ' ', 2),
      profile_name,
      profile_name,
      profile_pronouns,
      profile_bio,
      2024 + (CASE profile_year 
        WHEN 'Freshman' THEN 4
        WHEN 'Sophomore' THEN 3
        WHEN 'Junior' THEN 2
        WHEN 'Senior' THEN 1
        ELSE 0
      END),
      profile_major,
      profile_year,
      profile_age,
      profile_photo_url,
      jsonb_build_array(profile_photo_url),
      true,
      profile_personality,
      profile_interests,
      profile_looking_for,
      profile_personality,
      'Test University',
      true,
      true,
      NOW() - (random() * interval '30 days'),
      NOW() - (random() * interval '7 days'),
      NOW() - (random() * interval '1 day')
    )
    ON CONFLICT (id) DO NOTHING;
    
  END LOOP;
  
  RAISE NOTICE 'Created 50 test profiles';
END $$;

