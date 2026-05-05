/**
 * CSRF Protection Middleware
 * Validates CSRF tokens on POST, PATCH, PUT, DELETE requests
 * 
 * Usage:
 * import { verifyCsrfToken } from '@/lib/middleware/csrf'
 * 
 * await verifyCsrfToken(request)
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__Host-csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token in secure cookie
 */
export async function setCsrfTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * Verify CSRF token from request
 * @param request - Next.js Request object
 * @throws Error if token is invalid or missing
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  // Get token from request headers
  const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME);

  if (!tokenFromHeader) {
    throw new Error('CSRF token missing from headers');
  }

  // Get token from cookies
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!tokenFromCookie) {
    throw new Error('CSRF token missing from cookies');
  }

  // Compare tokens using constant-time comparison
  const headerBuffer = Buffer.from(tokenFromHeader, 'hex');
  const cookieBuffer = Buffer.from(tokenFromCookie, 'hex');

  if (!crypto.timingSafeEqual(headerBuffer, cookieBuffer)) {
    throw new Error('CSRF token mismatch');
  }

  return true;
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 */
export async function csrfProtectionMiddleware(request: Request): Promise<void> {
  // Only validate on state-changing requests
  const method = request.method.toUpperCase();
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    return;
  }

  // Skip validation for specific endpoints
  const url = new URL(request.url);
  const skipPaths = ['/api/auth/login', '/api/auth/register'];
  if (skipPaths.some((path) => url.pathname.startsWith(path))) {
    return;
  }

  try {
    await verifyCsrfToken(request);
  } catch (error) {
    console.error('[CSRF_PROTECTION]', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
