/**
 * Supabase configuration from environment variables
 * Falls back to hardcoded values for development if env vars are not set
 */

// Get from environment variables or fallback to development values
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wmlklvlnxftedtylgxsc.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Extract project ID from URL
export const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// Public anon key (safe to expose in client)
export const publicAnonKey = supabaseAnonKey;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
}



