-- Database Optimization Script for Bonded App
-- This script fixes the duplicate index issue and optimizes the schema

-- ============================================
-- ISSUE 1: Remove Duplicate Indexes
-- ============================================
-- You have 19 identical indexes on the same column, which is wasteful.
-- The primary key already provides an index, and you only need ONE additional
-- index for pattern matching (if using LIKE queries).

-- Drop all the duplicate indexes
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx1;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx2;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx3;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx4;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx5;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx6;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx7;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx8;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx9;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx10;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx11;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx12;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx13;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx14;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx15;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx16;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx17;
DROP INDEX IF EXISTS public.kv_store_2516be19_key_idx18;

-- ============================================
-- OPTIMIZATION: Create Single Pattern Index
-- ============================================
-- Only create ONE index for pattern matching (used by getByPrefix function)
-- The primary key already provides an index for exact lookups
CREATE INDEX IF NOT EXISTS kv_store_2516be19_key_pattern_idx 
ON public.kv_store_2516be19 
USING btree (key text_pattern_ops) 
TABLESPACE pg_default;

-- ============================================
-- OPTIONAL: Add JSONB Index for Value Queries
-- ============================================
-- If you need to query within the JSONB value field, consider adding a GIN index
-- This is optional and only needed if you query JSONB fields frequently
-- CREATE INDEX IF NOT EXISTS kv_store_2516be19_value_gin_idx 
-- ON public.kv_store_2516be19 
-- USING gin (value) 
-- TABLESPACE pg_default;

-- ============================================
-- VERIFICATION: Check Current Indexes
-- ============================================
-- Run this to verify the cleanup worked:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'kv_store_2516be19';

