/** Strict, lowercase-normalized comparison against the .env-bootstrapped admin wallet. */
export function isAdminWallet(address: string): boolean {
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS
  if (!adminWallet) return false
  return address.toLowerCase() === adminWallet.toLowerCase()
}
