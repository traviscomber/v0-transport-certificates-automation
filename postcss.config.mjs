/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {
      // Only load essential plugins, block tw-animate-css
      corePlugins: {},
      plugins: [],
    },
  },
}

export default config
