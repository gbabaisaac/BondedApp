// Centralized API configuration
export const API_BASE_URL = `https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19`;

// Helper function to build API URLs
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

