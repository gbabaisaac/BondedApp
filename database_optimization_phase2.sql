-- Phase 2: Performance Optimizations for Scalability
-- Run this AFTER database_optimization.sql

-- 1. Add JSONB GIN Index for querying inside JSONB values
-- This allows efficient queries like: WHERE value @> '{"school": "University of Illinois"}'
CREATE INDEX IF NOT EXISTS kv_store_2516be19_value_gin_idx 
ON public.kv_store_2516be19 USING gin (value);

-- 2. Add index for prefix searches (already have text_pattern_ops, but ensure it exists)
CREATE INDEX IF NOT EXISTS kv_store_2516be19_key_pattern_idx 
ON public.kv_store_2516be19 USING btree (key text_pattern_ops);

-- 3. Analyze table to update statistics (helps query planner)
ANALYZE public.kv_store_2516be19;

-- 4. Optional: Add partial indexes for common query patterns
-- Index for user profiles only
CREATE INDEX IF NOT EXISTS kv_store_2516be19_user_profiles_idx 
ON public.kv_store_2516be19 USING gin (value) 
WHERE key LIKE 'user:%';

-- Index for school indexes
CREATE INDEX IF NOT EXISTS kv_store_2516be19_school_idx 
ON public.kv_store_2516be19 (key) 
WHERE key LIKE 'school:%';

-- Verify indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'kv_store_2516be19'
ORDER BY
    indexname;

