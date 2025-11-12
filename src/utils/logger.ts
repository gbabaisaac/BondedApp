/**
 * Centralized logging utility
 * In production, logs are suppressed or sent to error tracking service (Sentry)
 */

import { Sentry, addSentryBreadcrumb } from '../config/sentry';

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
    // Add breadcrumb for debugging in Sentry
    addSentryBreadcrumb(args.join(' '), 'log', 'info');
  },

  error: (...args: any[]) => {
    // Always log errors
    if (isDevelopment) {
      console.error(...args);
    }

    // Send to Sentry in all environments
    const errorMessage = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    // If the first argument is an Error object, capture it properly
    if (args[0] instanceof Error) {
      Sentry.captureException(args[0], {
        extra: {
          additionalInfo: args.slice(1),
        },
      });
    } else {
      Sentry.captureMessage(errorMessage, 'error');
    }

    addSentryBreadcrumb(errorMessage, 'error', 'error');
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }

    // Send warnings to Sentry as well
    const warningMessage = args.join(' ');
    Sentry.captureMessage(warningMessage, 'warning');
    addSentryBreadcrumb(warningMessage, 'warning', 'warning');
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
    addSentryBreadcrumb(args.join(' '), 'info', 'info');
  },
};


