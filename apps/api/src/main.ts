import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import type { NextFunction, Request, Response } from 'express'
import { AppModule } from './app.module'
import { isSwaggerEnabled, setupSwagger } from './common/swagger/swagger.setup'
import { SWAGGER_PATH } from './common/swagger/swagger.constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Helmet's default CSP (`script-src 'self'`) blocks the inline bootstrap
  // script Swagger UI ships with, so the docs routes get a relaxed policy
  // while every API route keeps the strict defaults.
  const strictHelmet = helmet()
  const docsHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        connectSrc: [`'self'`],
      },
    },
  })
  app.use((req: Request, res: Response, next: NextFunction) => {
    const handler = req.path.startsWith(`/${SWAGGER_PATH}`) ? docsHelmet : strictHelmet
    return handler(req, res, next)
  })

  app.use(cookieParser())

  app.enableCors({
    origin: process.env.WEB_APP_URL || 'http://localhost:3000',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api')

  // Mounted at /docs, outside the global prefix. No-ops unless enabled for
  // this environment (see SWAGGER_ENABLED).
  setupSwagger(app)

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`API listening on http://localhost:${port}/api`)
  if (isSwaggerEnabled()) {
    logger.log(`API reference on http://localhost:${port}/${SWAGGER_PATH}`)
  }
}

bootstrap()
