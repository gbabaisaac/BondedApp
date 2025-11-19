import { useEffect, useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { LoadingScreen } from './LoadingScreen';

export function AuthCallback() {
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL search params directly from window.location
    const params = new URLSearchParams(window.location.search);
    setCode(params.get('code'));
    setState(params.get('state'));
    setError(params.get('error'));
    setErrorDescription(params.get('error_description'));
  }, []);

  // Get provider from URL path (e.g., /auth/linkedin/callback)
  const pathParts = window.location.pathname.split('/');
  const provider = pathParts[pathParts.length - 2]; // linkedin, spotify, etc.

  useEffect(() => {
    // Only proceed if we have the necessary params
    if (!code && !error) return;

    const handleCallback = async () => {
      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        toast.error(`Failed to connect ${provider}: ${errorDescription || error}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      if (!code || !state) {
        toast.error('Missing authorization code');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      try {
        // Get access token from localStorage (set during connect)
        const accessToken = localStorage.getItem('supabase_auth_token');
        if (!accessToken) {
          toast.error('Session expired. Please try connecting again.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        // Send callback to backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/social/${provider}/callback`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ code, state }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          toast.success(`${provider === 'linkedin' ? 'LinkedIn' : provider} connected successfully!`);
          
          // Reload the page to refresh profile data
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          const errorData = await response.json();
          toast.error(`Failed to connect: ${errorData.error || 'Unknown error'}`);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        toast.error('Failed to complete connection');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    handleCallback();
  }, [code, state, error, errorDescription, provider]);

  return <LoadingScreen />;
}

