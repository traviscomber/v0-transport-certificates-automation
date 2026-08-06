/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas'],
  },
  webpack(config, { isServer }) {
    // The production OCR path uses OpenAI Vision and must never bundle native
    // canvas binaries. Alias the package to false for every Webpack target so
    // stale imports or optional dependency probes cannot pull a .node file into
    // browser, edge, or Fox/v0 builds.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@napi-rs/canvas': false,
      '@napi-rs/canvas-linux-x64-musl': false,
      '@napi-rs/canvas-linux-x64-gnu': false,
      '@napi-rs/canvas-linux-arm64-musl': false,
      '@napi-rs/canvas-linux-arm64-gnu': false,
      '@napi-rs/canvas-darwin-x64': false,
      '@napi-rs/canvas-darwin-arm64': false,
      '@napi-rs/canvas-win32-x64-msvc': false,
      '@napi-rs/canvas-win32-arm64-msvc': false,
    }

    if (isServer) {
      config.externals.push(({ request }, callback) => {
        if (
          request === '@napi-rs/canvas' ||
          request?.startsWith('@napi-rs/canvas-')
        ) {
          return callback(null, `commonjs ${request}`)
        }

        return callback()
      })
    }

    return config
  },
}

export default nextConfig
