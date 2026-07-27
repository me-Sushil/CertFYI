import { Logger, type INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule, type SwaggerCustomOptions } from '@nestjs/swagger'
import { SESSION_COOKIE } from '../constants/roles.constant'
import { API_TAGS, SESSION_COOKIE_AUTH, SWAGGER_PATH } from './swagger.constants'

const DESCRIPTION =
  'Document verification API. Authentication is Sign-In With Ethereum (SIWE): ' +
  'request a nonce, sign it, and exchange the signature for a session cookie.'

/**
 * Docs are opt-in per environment: on by default outside production, and
 * enabled in production only when `SWAGGER_ENABLED=true` is set explicitly.
 */
export function isSwaggerEnabled(): boolean {
  const flag = process.env.SWAGGER_ENABLED
  if (flag !== undefined) return flag.toLowerCase() === 'true'
  return process.env.NODE_ENV !== 'production'
}

/**
 * Builds the OpenAPI document and mounts Swagger UI at `/docs`, with the raw
 * spec at `/docs/json` and `/docs/yaml` for client-codegen pipelines.
 *
 * No-ops when {@link isSwaggerEnabled} is false, so calling it unconditionally
 * from `main.ts` is safe.
 */
export function setupSwagger(app: INestApplication): void {
  if (!isSwaggerEnabled()) return

  const config = new DocumentBuilder()
    .setTitle('CertFyi API')
    .setDescription(DESCRIPTION)
    .setVersion(process.env.npm_package_version ?? '0.1.0')
    .addServer(process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`)
    .addCookieAuth(
      SESSION_COOKIE,
      {
        type: 'apiKey',
        in: 'cookie',
        name: SESSION_COOKIE,
        description: 'SIWE session JWT, set by POST /api/auth/verify (httpOnly).',
      },
      SESSION_COOKIE_AUTH,
    )
    .addTag(API_TAGS.HEALTH)
    .addTag(API_TAGS.AUTH)
    .addTag(API_TAGS.ISSUER)
    .addTag(API_TAGS.ADMIN)
    .addTag(API_TAGS.DOCUMENTS)
    .addTag(API_TAGS.PDF)
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  })

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'CertFyi API Reference',
    jsonDocumentUrl: `${SWAGGER_PATH}/json`,
    yamlDocumentUrl: `${SWAGGER_PATH}/yaml`,
    swaggerOptions: {
      // Session auth is an httpOnly cookie - the browser must be allowed to
      // attach it to "Try it out" requests.
      withCredentials: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  }

  SwaggerModule.setup(SWAGGER_PATH, app, document, customOptions)

  Logger.log(`Swagger UI available at /${SWAGGER_PATH}`, 'SwaggerModule')
}
