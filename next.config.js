/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Force cache invalidation - v0 dev server cache buster - build v3
console.log('[v0-config] Using clean next.config.js - v3 - all orphaned code removed');

module.exports = nextConfig;
