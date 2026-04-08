/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Disable webpack cache to prevent serialization warnings
    config.cache = false
    return config
  }
};

module.exports = nextConfig;
module.exports = nextConfig;


