/**
 * Sentry Configuration for Error Tracking
 *
 * Setup Instructions:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project for "React"
 * 3. Copy your DSN and add to .env as VITE_SENTRY_DSN
 * 4. Deploy and errors will automatically be tracked
 */

import * as Sentry from '@sentry/react';

const isDevelopment = import.meta.env.DEV;

export function initSentry() {
  // Only initialize Sentry if DSN is provided and not in development
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    if (!isDevelopment) {
      console.warn('Sentry DSN not configured. Error tracking is disabled.');
    }
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_ENV || 'production',

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust in production based on traffic
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,

    // Set profilesSampleRate to 1.0 to profile every transaction.
    // Adjust in production based on needs
    profilesSampleRate: isDevelopment ? 1.0 : 0.1,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Privacy: mask all text content
        blockAllMedia: true, // Privacy: block all media
      }),
    ],

    // Filter out errors that are not actionable
    beforeSend(event, hint) {
      // Filter out browser extension errors
      if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
        return null;
      }

      // Filter out network errors that might be user connectivity issues
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }

      return event;
    },

    // Set user context automatically if available
    initialScope: {
      tags: {
        app_version: '0.1.0',
      },
    },
  });
}

// Helper to set user context
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

// Helper to clear user context on logout
export function clearSentryUser() {
  Sentry.setUser(null);
}

// Helper to add breadcrumb for debugging
export function addSentryBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

// Export Sentry for direct access if needed
export { Sentry };
