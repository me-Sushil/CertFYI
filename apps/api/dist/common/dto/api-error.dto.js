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
exports.ValidationErrorDto = exports.ApiErrorDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ApiErrorDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { statusCode: { required: true, type: () => Number }, message: { required: true, type: () => String }, error: { required: false, type: () => String } };
    }
}
exports.ApiErrorDto = ApiErrorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 400, description: 'HTTP status code' }),
    __metadata("design:type", Number)
], ApiErrorDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Missing hash parameter',
        description: 'Human-readable error message',
    }),
    __metadata("design:type", String)
], ApiErrorDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bad Request', description: 'HTTP status text' }),
    __metadata("design:type", String)
], ApiErrorDto.prototype, "error", void 0);
class ValidationErrorDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { statusCode: { required: true, type: () => Number }, message: { required: true, type: () => [String] }, error: { required: true, type: () => String } };
    }
}
exports.ValidationErrorDto = ValidationErrorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 400 }),
    __metadata("design:type", Number)
], ValidationErrorDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: ['documentHash must match /^0x[a-fA-F0-9]{64}$/ regular expression'],
        description: 'One entry per failed constraint',
    }),
    __metadata("design:type", Array)
], ValidationErrorDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bad Request' }),
    __metadata("design:type", String)
], ValidationErrorDto.prototype, "error", void 0);
//# sourceMappingURL=api-error.dto.js.map