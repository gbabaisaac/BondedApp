/**
 * Supabase Project Info
 * Uses environment variables with fallback to development values
 * 
 * IMPORTANT: In production, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * in your environment variables. Never commit actual keys to git.
 */

// Get from environment variables or fallback to development values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wmlklvlnxftedtylgxsc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGtsdmxueGZ0ZWR0eWxneHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDE0MTMsImV4cCI6MjA3ODExNzQxM30.HVA2dsB9HerH4qNYTSiIsPzYMbeSLcWjnj82ErRQ0z4';

// Extract project ID from URL
export const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// Public anon key (safe to expose in client)
export const publicAnonKey = supabaseAnonKey;

// Validate configuration
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('⚠️ Supabase configuration missing. Using fallback values. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file for production.');
}