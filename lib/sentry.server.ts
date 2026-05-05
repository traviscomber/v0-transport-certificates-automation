/**
 * Sentry Server Configuration
 * Handles error tracking on the backend
 */

import * as Sentry from '@sentry/nextjs';

export function initializeSentryServer() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('[SENTRY] DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    enabled: process.env.NODE_ENV === 'production',
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException;

        // Skip 404 errors
        if ((error as any)?.status === 404) {
          return null;
        }

        // Skip authentication errors (expected)
        if ((error as any)?.name === 'AuthenticationError') {
          return null;
        }
      }

      return event;
    },
  });

  console.log('[SENTRY] Server-side error tracking initialized');
}
