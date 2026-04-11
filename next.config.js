/** @type {import('next').NextConfig} */

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
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
