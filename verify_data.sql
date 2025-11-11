-- Run this in Supabase SQL Editor to verify your data is intact
-- Go to: https://supabase.com/dashboard/project/wmlklvlnxftedtylgxsc/sql

-- Count total user accounts
SELECT COUNT(*) as total_users 
FROM kv_store_2516be19 
WHERE key LIKE 'user:%';

-- Show sample user accounts (first 10)
SELECT key, value->>'name' as name, value->>'email' as email, value->>'school' as school
FROM kv_store_2516be19 
WHERE key LIKE 'user:%'
LIMIT 10;

-- Count total records in kv_store
SELECT COUNT(*) as total_records 
FROM kv_store_2516be19;

-- Check for school indexes
SELECT key, jsonb_array_length(value::jsonb) as user_count
FROM kv_store_2516be19 
WHERE key LIKE 'school:%:users';

