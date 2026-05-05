/**
 * Sentry Client Configuration
 * Handles error tracking on the frontend
 */

import * as Sentry from '@sentry/nextjs';

export function initializeSentryClient() {
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
      // Filter non-critical errors
      if (event.exception) {
        const error = hint.originalException;

        // Skip network errors
        if ((error as any)?.message?.includes('Network')) {
          return null;
        }

        // Skip user-cancelled requests
        if ((error as any)?.name === 'AbortError') {
          return null;
        }
      }

      return event;
    },
  });

  console.log('[SENTRY] Client-side error tracking initialized');
}

/**
 * Capture an error manually
 */
export function captureError(error: Error | string, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(category: string, message: string, level: 'fatal' | 'error' | 'warning' | 'info' = 'info') {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 */
export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
