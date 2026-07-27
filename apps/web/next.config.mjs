/** @type {import('next').NextConfig} */

// See lib/x402-stub.cjs - optional peers of @coinbase/cdp-sdk that are never
// reached at runtime but must still resolve for the bundler.
const x402Stub = './lib/x402-stub.cjs'
const x402Aliases = Object.fromEntries(
  [
    '@x402/core',
    '@x402/core/client',
    '@x402/core/server',
    '@x402/evm',
    '@x402/evm/batch-settlement/client',
    '@x402/evm/exact/client',
    '@x402/evm/exact/server',
    '@x402/evm/exact/v1/client',
    '@x402/evm/upto/client',
    '@x402/evm/upto/server',
    '@x402/express',
    '@x402/extensions',
    '@x402/extensions/bazaar',
    '@x402/fetch',
    '@x402/svm',
    '@x402/svm/exact/client',
    '@x402/svm/exact/server',
    '@x402/svm/exact/v1/client',
  ].map((specifier) => [specifier, x402Stub]),
)

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: x402Aliases,
  },
}

export default nextConfig
