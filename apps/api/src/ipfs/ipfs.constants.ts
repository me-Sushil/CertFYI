/**
 * DI token for the bound IpfsProvider implementation.
 *
 * Lives here rather than in ipfs.module.ts so that IpfsService can inject it
 * without importing the module that declares IpfsService - that cycle leaves
 * the provider undefined at scan time and Nest reports it as a circular
 * dependency.
 */
export const IPFS_PROVIDER_TOKEN = 'IPFS_PROVIDER'
