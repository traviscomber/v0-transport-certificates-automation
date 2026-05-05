# Security Hardening Guide

**Last Updated:** 2026-05-05  
**Status:** Production Implementation

---

## Overview

This guide documents all security hardening measures implemented in the Anomaly Dashboard system. These protections guard against common web application vulnerabilities including CSRF attacks, XSS, clickjacking, and unauthorized API access.

---

## Security Headers

### Implemented Headers

All requests receive the following security headers:

#### 1. **X-Content-Type-Options: nosniff**
- **Protection:** MIME type sniffing
- **What it does:** Prevents browser from guessing file types
- **Impact:** Stops attackers from uploading files that execute as scripts

#### 2. **X-Frame-Options: DENY**
- **Protection:** Clickjacking attacks
- **What it does:** Prevents page from being embedded in iframes
- **Impact:** Can't trick users into clicking hidden buttons in iframes

#### 3. **X-XSS-Protection: 1; mode=block**
- **Protection:** Cross-site scripting (XSS)
- **What it does:** Enables XSS filter in older browsers
- **Impact:** Stops simple XSS attacks in legacy browsers

#### 4. **Strict-Transport-Security (HSTS)**
- **Value:** `max-age=31536000; includeSubDomains; preload`
- **Protection:** Man-in-the-middle (MITM) attacks
- **What it does:** Forces HTTPS for 1 year
- **Impact:** Can't intercept unencrypted connections

#### 5. **Content-Security-Policy (CSP)**
- **Protection:** Cross-site scripting (XSS) and injection attacks
- **Policy:**
  ```
  default-src 'self'
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com ...
  style-src 'self' 'unsafe-inline'
  img-src 'self' data: https:
  font-src 'self' data:
  connect-src 'self' https: wss:
  frame-ancestors 'none'
  base-uri 'self'
  form-action 'self'
  ```
- **What it does:** Controls what resources can be loaded
- **Impact:** Blocks malicious scripts from running

#### 6. **Referrer-Policy: strict-origin-when-cross-origin**
- **Protection:** Information leakage
- **What it does:** Only sends referrer URL when navigating within same domain
- **Impact:** Prevents sensitive information in referrer headers

#### 7. **Permissions-Policy**
- **Protection:** Unwanted feature access
- **Disabled:** camera, microphone, geolocation, payment, USB, magnetometer, gyroscope, accelerometer
- **What it does:** Blocks access to sensitive device features
- **Impact:** Malicious scripts can't access webcam, microphone, etc.

---

## CSRF Protection

### How It Works

1. **Server generates token** when user loads page
2. **Token stored in secure HTTP-only cookie**
3. **User includes token in request headers** on state changes
4. **Server validates token** matches cookie

### Implementation

**File:** `lib/middleware/csrf.ts`

**Key Functions:**
- `generateCsrfToken()` - Generate cryptographically secure token
- `setCsrfTokenCookie()` - Store token in secure cookie
- `verifyCsrfToken()` - Validate token on requests
- `csrfProtectionMiddleware()` - Middleware for automatic validation

### Usage in API Routes

```typescript
// In API route (POST, PATCH, PUT, DELETE)
import { verifyCsrfToken } from '@/lib/middleware/csrf';

export async function POST(request: Request) {
  try {
    await verifyCsrfToken(request);
    // Process request
  } catch (error) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
}
```

### Usage in Frontend

```typescript
// Get token from meta tag or cookie
async function makeRequest(endpoint: string, data: any) {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
}
```

### Protected Requests

CSRF protection applied to:
- **POST** - Create operations
- **PATCH** - Update operations
- **PUT** - Replace operations
- **DELETE** - Delete operations

### Excluded Endpoints

Some endpoints skip CSRF validation:
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/forgot-password`

---

## Rate Limiting

### Configuration

**File:** `lib/middleware/rate-limit.ts`

**Default Limits:**
- **100 requests per minute** per IP address
- **Window:** 60 seconds (rolling)
- **Algorithm:** Token bucket

### Implementation

Token bucket algorithm maintains a bucket of tokens:
- Bucket capacity: 100 tokens
- Refills at: ~1.67 tokens per second
- Each request consumes 1 token
- When empty: request rejected with 429 status

### Usage in API Routes

```typescript
import { rateLimit } from '@/lib/middleware/rate-limit';

export async function POST(request: Request) {
  try {
    const limit = await rateLimit(request, {
      maxRequests: 100,
      windowMs: 60000,
    });
    
    // Log rate limit info
    console.log(`Remaining: ${limit.remaining}, Reset: ${limit.reset}`);
    
    // Process request
  } catch (error: any) {
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter } }
      );
    }
  }
}
```

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1651234567890
```

### Clients Should Respect

1. **X-RateLimit-Remaining** - Stop requests when near limit
2. **Retry-After** - Wait before retrying 429 responses
3. **Exponential backoff** - Double wait time on consecutive failures

---

## API Security Best Practices

### 1. Input Validation

All API endpoints validate input:

```typescript
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'viewer']),
});

const validated = createSchema.parse(req.body);
```

### 2. Authentication

Every protected endpoint requires:

```typescript
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Process authenticated request
}
```

### 3. Authorization

Check user permissions:

```typescript
if (user.role !== 'admin' && resource.ownerId !== user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 4. SQL Injection Prevention

Use parameterized queries (Supabase handles this):

```typescript
// Safe - Supabase client uses parameterized queries
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);
```

### 5. Error Handling

Never expose sensitive information:

```typescript
// Bad - exposes database schema
return NextResponse.json({ error: error.message }, { status: 500 });

// Good - generic error
return NextResponse.json(
  { error: 'An error occurred' },
  { status: 500 }
);
```

---

## CORS Configuration

Cross-Origin Resource Sharing (CORS) configured to:

1. **Allow same-origin requests** - Full access
2. **Restrict cross-origin requests** - Only necessary endpoints
3. **Validate origin headers** - Check request source
4. **Handle preflight requests** - Respond to OPTIONS

### Allowed Origins

- Production: `https://your-domain.com`
- API requests from: Same origin only
- Third-party integrations: Whitelist specific origins

---

## Secure Cookies

All sensitive cookies are:

- **HttpOnly:** JavaScript can't access
- **Secure:** HTTPS only
- **SameSite=Lax:** CSRF protection
- **Path=/:** Limited to root path

---

## HTTPS Enforcement

- **Always enforced:** All traffic redirected to HTTPS
- **HSTS enabled:** Browsers remember for 1 year
- **HSTS preload:** Browser includes in preload list

---

## Monitoring & Logging

### Security Events Logged

- Failed CSRF validation
- Rate limit violations
- Failed authentication attempts
- Unusual access patterns

### Log Format

```
[SECURITY_EVENT] type=csrf_violation ip=192.168.1.1 endpoint=/api/data
[SECURITY_EVENT] type=rate_limit_exceeded ip=192.168.1.2 remaining=0
[SECURITY_EVENT] type=auth_failed email=user@example.com
```

---

## Regular Security Checks

### Weekly
- Review security headers are set
- Check for rate limiting violations
- Monitor failed auth attempts

### Monthly
- Review access logs
- Check for unusual patterns
- Update security policies

### Quarterly
- Security audit
- Penetration testing
- Dependency scanning
- OWASP Top 10 review

---

## Security Tools Used

- **CSRF Protection:** Custom token implementation
- **Rate Limiting:** In-memory token bucket
- **Authentication:** Supabase Auth
- **Encryption:** TLS 1.3 (HTTPS)
- **Hashing:** bcrypt (passwords)

---

## Dependencies & Updates

### Security-Critical Packages

- `next`: Latest stable
- `@supabase/supabase-js`: Latest stable
- `zod`: Latest stable

### Update Policy

- Security patches: ASAP
- Feature updates: Monthly
- Major updates: Quarterly

---

## Incident Response

If security issue detected:

1. **Isolate:** Stop affected service if needed
2. **Assess:** Determine impact scope
3. **Notify:** Alert security team
4. **Fix:** Implement patch
5. **Deploy:** Roll out fix
6. **Review:** Post-incident analysis

---

## Compliance

- **OWASP Top 10:** Covered
- **GDPR:** Data protection implemented
- **SOC 2:** Audit-ready logging

---

## References

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated:** 2026-05-05  
**Next Review:** 2026-06-05  
**Status:** Active
