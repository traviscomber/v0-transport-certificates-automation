/**
 * Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 * 
 * Usage:
 * import { rateLimit } from '@/lib/middleware/rate-limit'
 * 
 * await rateLimit(request, { maxRequests: 100, windowMs: 60000 })
 */

import { headers } from 'next/headers';

interface RateLimitOptions {
  maxRequests?: number; // Default: 100
  windowMs?: number; // Default: 60000ms (1 minute)
  keyPrefix?: string; // Default: 'rate-limit'
}

// In-memory store for rate limits
// In production, use Redis instead
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Get client IP address
 */
function getClientIp(headersList: any): string {
  // Try to get IP from x-forwarded-for (proxy)
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback to x-real-ip
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to cf-connecting-ip (Cloudflare)
  const cfIp = headersList.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  return 'unknown';
}

/**
 * Rate limit a request
 * @param request - Next.js Request object
 * @param options - Rate limit options
 * @returns Object with remaining requests and reset time
 * @throws Error if rate limit exceeded
 */
export async function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): Promise<{
  remaining: number;
  reset: number;
  limit: number;
}> {
  const {
    maxRequests = 100,
    windowMs = 60000, // 1 minute
    keyPrefix = 'rate-limit',
  } = options;

  const headersList = await headers();
  const clientIp = getClientIp(headersList);
  const key = `${keyPrefix}:${clientIp}`;
  const now = Date.now();

  // Initialize or get existing rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    // New window
    entry = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(key, entry);

    return {
      remaining: maxRequests - 1,
      reset: entry.resetTime,
      limit: maxRequests,
    };
  }

  // Increment count
  entry.count++;

  // Check if exceeded
  if (entry.count > maxRequests) {
    const secondsUntilReset = Math.ceil((entry.resetTime - now) / 1000);
    const error = new Error(
      `Rate limit exceeded. ${secondsUntilReset} seconds remaining.`
    );
    (error as any).status = 429;
    (error as any).retryAfter = secondsUntilReset;
    throw error;
  }

  return {
    remaining: maxRequests - entry.count,
    reset: entry.resetTime,
    limit: maxRequests,
  };
}

/**
 * Reset rate limit for a specific IP
 */
export function resetRateLimit(clientIp: string, keyPrefix = 'rate-limit'): void {
  const key = `${keyPrefix}:${clientIp}`;
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status for a specific IP
 */
export function getRateLimitStatus(
  clientIp: string,
  keyPrefix = 'rate-limit'
): { count: number; resetTime: number } | null {
  const key = `${keyPrefix}:${clientIp}`;
  return rateLimitStore.get(key) || null;
}

/**
 * Clean up expired rate limit entries (memory maintenance)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const cleaned = cleanupExpiredEntries();
  if (cleaned > 0) {
    console.log(`[RATE_LIMIT_CLEANUP] Removed ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);
