"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const pdf_service_1 = require("./pdf.service");
const pdf_dto_1 = require("../common/dto/pdf.dto");
const api_error_dto_1 = require("../common/dto/api-error.dto");
const swagger_constants_1 = require("../common/swagger/swagger.constants");
let PdfController = class PdfController {
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    upload(file) {
        return this.pdfService.upload(file);
    }
    hash(body) {
        return this.pdfService.hash(body.pdfContent, body.filename);
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a PDF and get its hash',
        description: 'Validates the file is a PDF under 50 MB and returns its SHA-256 hash. The resulting ' +
            '`documentHash` is what you pass to `POST /documents/anchor`.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: pdf_dto_1.PdfUploadDto, description: 'PDF file in the `file` field.' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'File accepted and hashed.', type: pdf_dto_1.PdfUploadResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'No file supplied, wrong MIME type, or over the 50 MB limit.',
        type: api_error_dto_1.ApiErrorDto,
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PdfController.prototype, "upload", null);
__decorate([
    (0, common_1.Patch)('upload'),
    (0, swagger_1.ApiOperation)({
        summary: 'Hash a base64 PDF',
        description: 'Same hash as `POST /pdf/upload`, for callers that already hold the bytes and prefer JSON ' +
            'over multipart.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Hash computed.', type: pdf_dto_1.PdfHashResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation failed.', type: api_error_dto_1.ValidationErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pdf_dto_1.PdfHashDto]),
    __metadata("design:returntype", void 0)
], PdfController.prototype, "hash", null);
exports.PdfController = PdfController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.PDF),
    (0, common_1.Controller)('pdf'),
    __metadata("design:paramtypes", [pdf_service_1.PdfService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map