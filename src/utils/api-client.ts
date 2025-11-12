/**
 * Enhanced API client with retry logic and offline handling
 */

import { fetchWithRetry } from './api-retry';
import { isOnline } from './offline';
import { projectId, supabaseUrl } from './supabase/config';
import { checkRateLimit } from './rate-limiter';
import { sanitizeProfile } from './sanitize';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiClientError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  retryOptions?: { maxRetries?: number }
): Promise<Response> {
  // Check if offline
  if (!isOnline()) {
    throw new ApiClientError('No internet connection', 0, 'OFFLINE');
  }

  // Check rate limit
  const rateLimitKey = `api:${endpoint.split('?')[0]}`;
  if (!checkRateLimit(rateLimitKey, 30, 60000)) { // 30 requests per minute
    throw new ApiClientError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
  }

  const url = `${supabaseUrl}/functions/v1/make-server-2516be19${endpoint}`;

  try {
    const response = await fetchWithRetry(url, options, retryOptions);

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiClientError(errorMessage, response.status);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiClientError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
}

export async function apiGet<T>(
  endpoint: string,
  accessToken?: string,
  retryOptions?: { maxRetries?: number }
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await apiRequest(endpoint, { method: 'GET', headers }, retryOptions);
  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  data?: any,
  accessToken?: string,
  retryOptions?: { maxRetries?: number }
): Promise<T> {
  // Sanitize profile data if it's a profile endpoint
  const sanitizedData = endpoint.includes('/profile') && data 
    ? sanitizeProfile(data) 
    : data;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await apiRequest(
    endpoint,
    {
      method: 'POST',
      headers,
      body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
    },
    retryOptions
  );

  return response.json();
}

export async function apiPut<T>(
  endpoint: string,
  data?: any,
  accessToken?: string,
  retryOptions?: { maxRetries?: number }
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await apiRequest(
    endpoint,
    {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    },
    retryOptions
  );

  return response.json();
}

export async function apiDelete<T>(
  endpoint: string,
  accessToken?: string,
  retryOptions?: { maxRetries?: number }
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await apiRequest(endpoint, { method: 'DELETE', headers }, retryOptions);
  return response.json();
}

