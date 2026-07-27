"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const swagger_setup_1 = require("./common/swagger/swagger.setup");
const swagger_constants_1 = require("./common/swagger/swagger.constants");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const strictHelmet = (0, helmet_1.default)();
    const docsHelmet = (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [`'self'`],
                scriptSrc: [`'self'`, `'unsafe-inline'`],
                styleSrc: [`'self'`, `'unsafe-inline'`],
                imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
                connectSrc: [`'self'`],
            },
        },
    });
    app.use((req, res, next) => {
        const handler = req.path.startsWith(`/${swagger_constants_1.SWAGGER_PATH}`) ? docsHelmet : strictHelmet;
        return handler(req, res, next);
    });
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: process.env.WEB_APP_URL || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    (0, swagger_setup_1.setupSwagger)(app);
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`API listening on http://localhost:${port}/api`);
    if ((0, swagger_setup_1.isSwaggerEnabled)()) {
        logger.log(`API reference on http://localhost:${port}/${swagger_constants_1.SWAGGER_PATH}`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map