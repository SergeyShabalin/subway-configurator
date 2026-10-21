import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,

  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  webpack: (config, { isServer }) => {
    if (isServer && process.env.VERCEL) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('ForceExit', () => {
            setTimeout(() => process.exit(0), 100)
          })
        },
      })
    }
    return config
  },
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl(nextConfig)
