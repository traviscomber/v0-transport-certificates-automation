/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'tesseract.js', 'pdfjs-dist'],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals.push('@napi-rs/canvas')
    }
    return config
  },
}

export default nextConfig
