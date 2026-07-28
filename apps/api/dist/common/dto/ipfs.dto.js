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
exports.IpfsHealthResponseDto = exports.IpfsPinStatusResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
class IpfsPinStatusResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { cid: { required: true, type: () => String }, pinned: { required: true, type: () => Boolean }, gatewayUrl: { required: true, type: () => String } };
    }
}
exports.IpfsPinStatusResponseDto = IpfsPinStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Content identifier that was checked.', example: EXAMPLE_CID }),
    __metadata("design:type", String)
], IpfsPinStatusResponseDto.prototype, "cid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the content is currently retrievable from the configured gateway.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], IpfsPinStatusResponseDto.prototype, "pinned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Public URL the content can be fetched from.',
        example: `https://gateway.pinata.cloud/ipfs/${EXAMPLE_CID}`,
    }),
    __metadata("design:type", String)
], IpfsPinStatusResponseDto.prototype, "gatewayUrl", void 0);
class IpfsHealthResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { provider: { required: true, type: () => String }, configured: { required: true, type: () => Boolean }, gateway: { required: true, type: () => String } };
    }
}
exports.IpfsHealthResponseDto = IpfsHealthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bound storage provider.', example: 'pinata' }),
    __metadata("design:type", String)
], IpfsHealthResponseDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether credentials are present. When false, pinning is skipped and CIDs are null.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], IpfsHealthResponseDto.prototype, "configured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Gateway used to build public URLs.',
        example: 'https://gateway.pinata.cloud/ipfs',
    }),
    __metadata("design:type", String)
], IpfsHealthResponseDto.prototype, "gateway", void 0);
//# sourceMappingURL=ipfs.dto.js.map