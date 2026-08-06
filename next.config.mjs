import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const emptyNativeModule = path.join(__dirname, 'lib/empty-native-module.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // OCR runs exclusively through OpenAI Vision. Native canvas packages may
    // remain as transitive dependencies of UI/PDF libraries, but they must
    // never be resolved or parsed by any Next.js, Vercel, Fox or v0 build.
    const aliases = {
      '@napi-rs/canvas': emptyNativeModule,
      '@napi-rs/canvas-linux-x64-musl': emptyNativeModule,
      '@napi-rs/canvas-linux-x64-gnu': emptyNativeModule,
      '@napi-rs/canvas-linux-arm64-musl': emptyNativeModule,
      '@napi-rs/canvas-linux-arm64-gnu': emptyNativeModule,
      '@napi-rs/canvas-darwin-x64': emptyNativeModule,
      '@napi-rs/canvas-darwin-arm64': emptyNativeModule,
      '@napi-rs/canvas-win32-x64-msvc': emptyNativeModule,
      '@napi-rs/canvas-win32-arm64-msvc': emptyNativeModule,
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...aliases,
    }

    // Do not externalize canvas. Externalization allows Node/Webpack to resolve
    // the native .node package again and bypasses the aliases above.
    return config
  },
}

export default nextConfig
