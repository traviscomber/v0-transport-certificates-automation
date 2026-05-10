/** @type {import('next').NextConfig} */

// Only enable Sentry when properly configured with auth token (production builds).
// In dev or when Sentry env vars are missing, the wrapper injects webpack
// instrumentation that produces missing chunk errors (e.g. "Cannot find module './2862.js'").
const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN && !!process.env.SENTRY_ORG && !!process.env.SENTRY_PROJECT;
const withSentryConfig = sentryEnabled
  ? require('@sentry/nextjs').withSentryConfig
  : (config) => config;

const nextConfig = {
  // Build optimization
  reactStrictMode: true,
  swcMinify: true,
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          
          // Enable XSS protection in older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          
          // Referrer Policy - prevent sensitive info leakage
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://va.vercel-scripts.com https://sentry.io https://*.sentry.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          
          // HSTS - Force HTTPS for 1 year
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          
          // Permissions Policy (formerly Feature Policy)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
            ].join(', '),
          },
        ],
      },
      
      // API routes - stricter CSP
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Silent mode to suppress warnings
  silent: true,

  // Org slug for Sentry
  org: process.env.SENTRY_ORG,

  // Project name
  project: process.env.SENTRY_PROJECT,

  // Auth token for Sentry CLI
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Automatically tree-shake Sentry logger statements
  autoInstrumentServerFunctions: true,

  // Hide source maps from browser
  hideSourceMaps: true,

  // Ignore errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
  ],

  // Don't capture 404 errors
  skipGetStaticPropsInstrumentation: true,
});
