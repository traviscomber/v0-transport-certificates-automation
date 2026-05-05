# Sentry Error Monitoring Setup

**Last Updated:** 2026-05-05  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Monitoring](#monitoring)
6. [Best Practices](#best-practices)

---

## Overview

This guide covers the Sentry error monitoring setup for the Anomaly Dashboard system. Sentry tracks application errors, performance metrics, and provides real-time alerts.

### Benefits

- **Real-time Error Alerts** - Get notified immediately when errors occur
- **Error Grouping** - Similar errors grouped together
- **Performance Monitoring** - Track slow endpoints
- **Release Tracking** - Monitor errors per deployment
- **Session Replay** - Replay user sessions where errors occurred
- **Source Maps** - Original code in stack traces

### Pricing

- **Free Tier:** 5,000 events/month
- **Pro Tier:** $29/month (from 5M events)

---

## Getting Started

### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Click "Sign Up"
3. Create account with email or GitHub
4. Create new organization
5. Create new project (select Next.js)

### 2. Get DSN

After creating project, you'll receive a **Data Source Name (DSN)**:

```
https://<key>@<org>.ingest.sentry.io/<project_id>
```

### 3. Add to Environment Variables

In Vercel dashboard or `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project_id>
SENTRY_AUTH_TOKEN=<your_auth_token>
SENTRY_ORG=<your_org_slug>
SENTRY_PROJECT=<your_project_slug>
```

### 4. Deploy

```bash
git push origin main
# or
vercel deploy --prod
```

---

## Configuration

### Environment Variables

Required for production:

```env
# Sentry DSN (public)
NEXT_PUBLIC_SENTRY_DSN=https://key@org.ingest.sentry.io/id

# For source maps upload (optional but recommended)
SENTRY_AUTH_TOKEN=sntrys_token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

### next.config.js

Already configured with:

```javascript
const withSentryConfig = require('@sentry/nextjs').withSentryConfig;

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  autoInstrumentServerFunctions: true,
  hideSourceMaps: true,
});
```

### Server-Side Configuration

File: `lib/sentry.server.ts`

- Handles uncaught exceptions
- Handles unhandled promise rejections
- Enables HTTP integration for request tracking
- Filters out non-critical errors

### Client-Side Configuration

File: `lib/sentry.client.ts`

- Tracks frontend errors
- Enables session replay
- Monitors performance
- Captures breadcrumbs

---

## Usage

### Automatic Tracking

The following errors are automatically tracked:

**Server-Side:**
- Unhandled exceptions in API routes
- Database connection errors
- Authentication failures
- Validation errors

**Client-Side:**
- JavaScript errors
- Unhandled promise rejections
- Network requests
- Performance metrics

### Manual Error Capture

**Capture an Error:**

```typescript
import { captureError } from '@/lib/sentry.client';

try {
  // some operation
} catch (error) {
  captureError(error, {
    operation: 'data_import',
    itemCount: 100,
  });
}
```

**Capture a Message:**

```typescript
import { captureMessage } from '@/lib/sentry.client';

captureMessage('User completed onboarding', 'info');
```

**Add Breadcrumb:**

```typescript
import { addBreadcrumb } from '@/lib/sentry.client';

addBreadcrumb('button', 'User clicked submit', 'info');
```

### Track User

**Set User Context:**

```typescript
import { setUserContext } from '@/lib/sentry.client';

setUserContext(user.id, user.email, user.name);
```

**Clear User Context:**

```typescript
import { clearUserContext } from '@/lib/sentry.client';

clearUserContext(); // On logout
```

### In API Routes

```typescript
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    // Automatically captured by Sentry
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## Monitoring

### Error Dashboard

Access at: `https://sentry.io/organizations/<org>/issues/`

**View:**
- Error frequency
- Affected users
- Browser/OS information
- Stack traces
- Recent events

### Performance Monitoring

Track slow endpoints:

**View at:** Settings → Performance → Thresholds

**Set alerts for:**
- Page load time > 3s
- API response time > 500ms
- Database query time > 1s

### Alerts

**Create alerts for:**

1. **Error Rate Increases**
   - Alert if error rate > 5% of sessions
   - Alert if more than 10 errors per minute

2. **Performance Degradation**
   - Alert if transaction takes > 500ms
   - Alert if slowest 10% is > 1s

3. **New Errors**
   - Alert on every new error type
   - Group by: service

### Release Tracking

Deploy to Sentry:

```bash
# Create release
sentry-cli releases create -p <project> <version>

# Deploy
sentry-cli releases files <version> upload-sourcemaps ./out

# Finalize
sentry-cli releases finalize <version>
```

**Benefits:**
- Track errors per deployment
- Revert to previous version easily
- See which version introduced errors

---

## Best Practices

### 1. Environment Separation

```
Development: Sample 100% of errors
Staging: Sample 50% of errors
Production: Sample 10% of errors
```

### 2. Error Filtering

Don't report:
- 404 not found
- Client offline errors
- Expected validation errors
- User-cancelled requests

### 3. Sensitive Data

Never capture:
- Passwords
- API keys
- Credit card numbers
- Personal information

Configure **Data Scrubbing** in Sentry settings.

### 4. Breadcrumbs

Leave breadcrumbs for important events:

```typescript
addBreadcrumb('navigation', 'Navigated to /documents', 'info');
addBreadcrumb('user-action', 'Clicked approve button', 'info');
addBreadcrumb('api', 'Called /api/documents', 'info');
```

### 5. Performance Monitoring

Monitor critical paths:

```typescript
const transaction = Sentry.startTransaction({
  name: 'Import Documents',
  op: 'transaction',
});

// ... do work ...

transaction.end();
```

### 6. Source Maps

Always upload source maps:

```bash
# In CI/CD pipeline
sentry-cli releases files upload-sourcemaps ./out
```

**Why:**
- See original code in stack traces
- Not just minified code
- Helps debugging production issues

### 7. User Feedback

Collect user feedback on errors:

```typescript
if (error) {
  Sentry.showReportDialog();
}
```

---

## Common Issues

### DSN Not Set

**Symptom:** Errors not appearing in Sentry  
**Solution:** Check `NEXT_PUBLIC_SENTRY_DSN` is set in environment

### Source Maps Not Working

**Symptom:** Stack traces show minified code  
**Solution:** Upload source maps with `sentry-cli`

### Too Many Errors

**Symptom:** Quota exceeded  
**Solution:** Increase plan or adjust sample rate

### Sensitive Data Leaked

**Symptom:** Personal data in error messages  
**Solution:** Configure Data Scrubbing in settings

---

## Integration with Other Services

### Slack Integration

Send alerts to Slack:

1. Go to Settings → Integrations → Slack
2. Authorize Slack workspace
3. Select channel for alerts
4. Configure rules (e.g., only show Severity: Error)

### GitHub Integration

Link errors to GitHub issues:

1. Settings → Integrations → GitHub
2. Authorize GitHub
3. Create issue from error
4. Auto-link commits to errors

### PagerDuty Integration

On-call alerts:

1. Settings → Integrations → PagerDuty
2. Create incident on critical errors
3. Notify on-call engineer

---

## Troubleshooting

### Errors Not Appearing

Check:
1. DSN is correct
2. Environment is not filtered
3. Error not in ignore list
4. Network connectivity

Test:
```typescript
Sentry.captureMessage('Test error', 'error');
```

### Performance Metrics Missing

Check:
1. Tracing enabled (tracesSampleRate > 0)
2. Performance monitoring not filtered
3. Sample rate not too low

### Source Maps Issues

Run:
```bash
sentry-cli releases files list <version>
sentry-cli sourcemaps check
```

---

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

**Status:** Active  
**Last Updated:** 2026-05-05  
**Next Review:** 2026-06-05
