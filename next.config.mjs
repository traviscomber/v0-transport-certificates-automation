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
  webpack: (config, { isServer }) => {
    // Optimize webpack caching to avoid serialization warnings
    if (config.cache) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        cacheDirectory: require('path').join(process.cwd(), '.next/cache/webpack'),
      }
    }
    
    // Suppress PackFileCacheStrategy warnings for large strings
    if (config.plugins) {
      config.plugins = config.plugins.map(plugin => {
        if (plugin.constructor.name === 'WebpackError') {
          return null
        }
        return plugin
      }).filter(Boolean)
    }

    return config
  },
}

export default nextConfig
