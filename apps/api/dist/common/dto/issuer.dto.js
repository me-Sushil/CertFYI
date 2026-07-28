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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStatusResponseDto = exports.AccessRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const MIN_NAME_LENGTH = 2;
const MAX_DESCRIPTION_LENGTH = 1000;
const BlankToUndefined = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));
class AccessRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: false, type: () => String, minLength: MIN_NAME_LENGTH }, email: { required: false, type: () => String }, organization: { required: false, type: () => String }, website: { required: false, type: () => String }, description: { required: false, type: () => String, maxLength: MAX_DESCRIPTION_LENGTH } };
    }
}
exports.AccessRequestDto = AccessRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contact name of the applicant.',
        minLength: MIN_NAME_LENGTH,
        example: 'Ada Lovelace',
    }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(MIN_NAME_LENGTH),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'email', example: 'ada@university.edu' }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Example University' }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Organization website. Send an empty string to omit.',
        format: 'url',
        example: 'https://university.edu',
    }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'website must be a valid URL, for example https://example.com' }),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'What the organization intends to issue.',
        maxLength: MAX_DESCRIPTION_LENGTH,
        example: 'We issue degree certificates to graduating students.',
    }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(MAX_DESCRIPTION_LENGTH),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "description", void 0);
class RequestStatusResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { requestStatus: { required: true, type: () => String } };
    }
}
exports.RequestStatusResponseDto = RequestStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the caller’s own access request. `NONE` means never applied.',
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    }),
    __metadata("design:type", String)
], RequestStatusResponseDto.prototype, "requestStatus", void 0);
//# sourceMappingURL=issuer.dto.js.map