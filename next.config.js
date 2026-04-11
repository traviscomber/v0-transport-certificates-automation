/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    // Disable webpack cache strategy to avoid serialization warnings
    if (config.cache) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
