/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'tesseract.js', 'pdfjs-dist'],
    outputFileTracingIncludes: {
      '/api/cron/document-ocr': [
        './node_modules/@napi-rs/canvas/**/*',
        './node_modules/@napi-rs/canvas-linux-x64-gnu/**/*',
        './node_modules/@napi-rs/canvas-linux-x64-musl/**/*',
        './node_modules/tesseract.js/**/*',
        './node_modules/tesseract.js-core/**/*',
        './node_modules/pdfjs-dist/**/*',
      ],
    },
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals.push('@napi-rs/canvas')
    }
    return config
  },
}

export default nextConfig
