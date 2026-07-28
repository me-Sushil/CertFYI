/**
 * Shared Swagger/OpenAPI identifiers.
 *
 * Kept free of `@nestjs/swagger` imports so controllers and DTOs can reference
 * tag/security names without pulling in the documentation bootstrap.
 */

/** Route the Swagger UI is mounted on (outside the `api` global prefix). */
export const SWAGGER_PATH = 'docs'

/**
 * Security scheme name for the SIWE session cookie. Referenced by
 * `@ApiCookieAuth(SESSION_COOKIE_AUTH)` on protected routes.
 */
export const SESSION_COOKIE_AUTH = 'session-cookie'

/** Canonical tag names - keeps controller tags and DocumentBuilder in sync. */
export const API_TAGS = {
  HEALTH: 'Health',
  AUTH: 'Authentication',
  ISSUER: 'Issuer',
  ADMIN: 'Admin',
  DOCUMENTS: 'Documents',
  PDF: 'PDF',
  IPFS: 'IPFS',
} as const
