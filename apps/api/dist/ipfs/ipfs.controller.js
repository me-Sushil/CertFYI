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
exports.IpfsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ipfs_service_1 = require("./ipfs.service");
const ipfs_utils_1 = require("./ipfs.utils");
const api_error_dto_1 = require("../common/dto/api-error.dto");
const ipfs_dto_1 = require("../common/dto/ipfs.dto");
const swagger_constants_1 = require("../common/swagger/swagger.constants");
const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
let IpfsController = class IpfsController {
    constructor(ipfs) {
        this.ipfs = ipfs;
    }
    health() {
        return {
            provider: this.ipfs.providerName,
            configured: this.ipfs.isConfigured(),
            gateway: this.ipfs.gatewayUrl('').replace(/\/$/, ''),
        };
    }
    async status(cid) {
        this.assertCid(cid);
        const { pinned } = await this.ipfs.status(cid);
        return { cid, pinned, gatewayUrl: this.ipfs.gatewayUrl(cid) };
    }
    async fetch(cid, res) {
        this.assertCid(cid);
        let result;
        try {
            result = await this.ipfs.fetchFile(cid);
        }
        catch (error) {
            throw new common_1.NotFoundException({
                error: 'Content not retrievable from the IPFS gateway',
                cid,
                detail: error instanceof Error ? error.message : String(error),
            });
        }
        res.set({
            'Content-Type': result.contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
        });
        if (result.contentLength !== undefined) {
            res.set({ 'Content-Length': String(result.contentLength) });
        }
        return new common_1.StreamableFile(result.stream);
    }
    assertCid(cid) {
        if (!(0, ipfs_utils_1.isValidCid)(cid)) {
            throw new common_1.NotFoundException({ error: 'Malformed CID', cid });
        }
    }
};
exports.IpfsController = IpfsController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Report IPFS configuration',
        description: 'Shows which storage provider is bound and whether credentials are present. Useful for ' +
            'confirming a deployment can pin before any document is issued.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Current IPFS configuration.', type: ipfs_dto_1.IpfsHealthResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("../common/dto/ipfs.dto").IpfsHealthResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", ipfs_dto_1.IpfsHealthResponseDto)
], IpfsController.prototype, "health", null);
__decorate([
    (0, common_1.Get)(':cid/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check whether a CID is retrievable',
        description: 'Answers the question that matters to a verifier - can this content actually be fetched ' +
            'right now - by probing the configured gateway rather than the pinning API.',
    }),
    (0, swagger_1.ApiParam)({ name: 'cid', description: 'IPFS content identifier.', example: EXAMPLE_CID }),
    (0, swagger_1.ApiOkResponse)({ description: 'Pin status resolved.', type: ipfs_dto_1.IpfsPinStatusResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Malformed CID.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200, type: require("../common/dto/ipfs.dto").IpfsPinStatusResponseDto }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IpfsController.prototype, "status", null);
__decorate([
    (0, common_1.Get)(':cid'),
    (0, swagger_1.ApiOperation)({
        summary: 'Stream content by CID',
        description: 'Proxies the configured gateway so the frontend never needs to know which provider is in ' +
            'use. Responses are cached indefinitely - IPFS content is immutable, so a CID can never ' +
            'point at different bytes.',
    }),
    (0, swagger_1.ApiParam)({ name: 'cid', description: 'IPFS content identifier.', example: EXAMPLE_CID }),
    (0, swagger_1.ApiProduces)('application/octet-stream'),
    (0, swagger_1.ApiOkResponse)({ description: 'Content streamed from the gateway.' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Malformed CID.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Gateway could not resolve the CID.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('cid')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IpfsController.prototype, "fetch", null);
exports.IpfsController = IpfsController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.IPFS),
    (0, common_1.Controller)('ipfs'),
    __metadata("design:paramtypes", [ipfs_service_1.IpfsService])
], IpfsController);
//# sourceMappingURL=ipfs.controller.js.map