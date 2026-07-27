"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSwaggerEnabled = isSwaggerEnabled;
exports.setupSwagger = setupSwagger;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_constant_1 = require("../constants/roles.constant");
const swagger_constants_1 = require("./swagger.constants");
const DESCRIPTION = 'Document verification API. Authentication is Sign-In With Ethereum (SIWE): ' +
    'request a nonce, sign it, and exchange the signature for a session cookie.';
function isSwaggerEnabled() {
    const flag = process.env.SWAGGER_ENABLED;
    if (flag !== undefined)
        return flag.toLowerCase() === 'true';
    return process.env.NODE_ENV !== 'production';
}
function setupSwagger(app) {
    if (!isSwaggerEnabled())
        return;
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CertFyi API')
        .setDescription(DESCRIPTION)
        .setVersion(process.env.npm_package_version ?? '0.1.0')
        .addServer(process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`)
        .addCookieAuth(roles_constant_1.SESSION_COOKIE, {
        type: 'apiKey',
        in: 'cookie',
        name: roles_constant_1.SESSION_COOKIE,
        description: 'SIWE session JWT, set by POST /api/auth/verify (httpOnly).',
    }, swagger_constants_1.SESSION_COOKIE_AUTH)
        .addTag(swagger_constants_1.API_TAGS.HEALTH)
        .addTag(swagger_constants_1.API_TAGS.AUTH)
        .addTag(swagger_constants_1.API_TAGS.ISSUER)
        .addTag(swagger_constants_1.API_TAGS.ADMIN)
        .addTag(swagger_constants_1.API_TAGS.DOCUMENTS)
        .addTag(swagger_constants_1.API_TAGS.PDF)
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
    });
    const customOptions = {
        customSiteTitle: 'CertFyi API Reference',
        jsonDocumentUrl: `${swagger_constants_1.SWAGGER_PATH}/json`,
        yamlDocumentUrl: `${swagger_constants_1.SWAGGER_PATH}/yaml`,
        swaggerOptions: {
            withCredentials: true,
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            tryItOutEnabled: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    };
    swagger_1.SwaggerModule.setup(swagger_constants_1.SWAGGER_PATH, app, document, customOptions);
    common_1.Logger.log(`Swagger UI available at /${swagger_constants_1.SWAGGER_PATH}`, 'SwaggerModule');
}
//# sourceMappingURL=swagger.setup.js.map