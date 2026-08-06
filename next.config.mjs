/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'tesseract.js', 'pdfjs-dist'],
  },
  webpack(config, { isServer }) {
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
