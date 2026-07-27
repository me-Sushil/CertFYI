// Stub for the optional `@x402/*` peer dependencies of @coinbase/cdp-sdk,
// which reaches us transitively via @rainbow-me/rainbowkit -> @wagmi/connectors
// -> @base-org/account. next.config.mjs aliases those specifiers here.
//
// The x402 micropayment code paths are never entered by this app, but the SDK
// imports them statically, so the bundler must be able to resolve both the
// module and whatever named bindings each import site asks for.
//
// This is deliberately CommonJS: Turbopack treats CJS exports as dynamic, so
// `import { toClientEvmSigner } from '@x402/evm'` type-checks against the
// Proxy at runtime instead of failing the static named-export check that an
// ESM stub would trigger. Any binding resolves to a function that throws if
// actually invoked, which surfaces a clear error rather than `undefined is not
// a function` should a future feature genuinely need x402.
const stub = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === '__esModule') return true
      if (prop === 'default') return stub
      if (typeof prop === 'symbol') return undefined
      return function x402NotInstalled() {
        throw new Error(
          `@x402/* is not installed: '${String(prop)}' was called. These are ` +
            `optional peers of @coinbase/cdp-sdk stubbed in apps/web/lib/x402-stub.cjs. ` +
            `Install the real @x402 packages and drop the aliases in next.config.mjs ` +
            `if this app now needs x402 payments.`,
        )
      }
    },
  },
)

module.exports = stub
