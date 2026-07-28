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
var IpfsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
const ipfs_constants_1 = require("./ipfs.constants");
const ipfs_utils_1 = require("./ipfs.utils");
let IpfsService = IpfsService_1 = class IpfsService {
    constructor(provider) {
        this.provider = provider;
        this.logger = new common_1.Logger(IpfsService_1.name);
    }
    onModuleInit() {
        if (this.provider.isConfigured()) {
            this.logger.log(`IPFS provider ready: ${this.provider.name}`);
        }
        else {
            this.logger.warn(`IPFS provider "${this.provider.name}" is not configured - pinning is disabled. ` +
                'Set PINATA_JWT to enable it.');
        }
    }
    isConfigured() {
        return this.provider.isConfigured();
    }
    get providerName() {
        return this.provider.name;
    }
    gatewayUrl(cid) {
        return this.provider.gatewayUrl(cid);
    }
    async pinFile(buffer, filename, contentType) {
        if (!this.provider.isConfigured()) {
            return this.degraded('IPFS is not configured');
        }
        try {
            const { cid, size } = await this.provider.uploadFile(buffer, filename, contentType);
            this.logger.log(`Pinned ${filename} (${(0, ipfs_utils_1.formatBytes)(size)}) -> ${cid}`);
            return { pinned: true, cid, size, gatewayUrl: this.provider.gatewayUrl(cid) };
        }
        catch (error) {
            return this.degraded(this.describe(error), `pin file ${filename}`);
        }
    }
    async pinJson(data, name) {
        if (!this.provider.isConfigured()) {
            return this.degraded('IPFS is not configured');
        }
        try {
            const { cid, size } = await this.provider.uploadJson(data, name);
            this.logger.log(`Pinned ${name} metadata -> ${cid}`);
            return { pinned: true, cid, size, gatewayUrl: this.provider.gatewayUrl(cid) };
        }
        catch (error) {
            return this.degraded(this.describe(error), `pin json ${name}`);
        }
    }
    async fetchFile(cid) {
        this.assertCid(cid);
        return this.provider.fetchFile(cid);
    }
    async status(cid) {
        if (!(0, ipfs_utils_1.isValidCid)(cid))
            return { pinned: false };
        return this.provider.status(cid);
    }
    assertCid(cid) {
        if (!(0, ipfs_utils_1.isValidCid)(cid)) {
            throw new Error(`Malformed CID: ${cid}`);
        }
    }
    degraded(reason, context) {
        if (context) {
            this.logger.error(`IPFS degraded - could not ${context}: ${reason}`);
        }
        return { pinned: false, cid: null, size: null, gatewayUrl: null, error: reason };
    }
    describe(error) {
        return error instanceof Error ? error.message : String(error);
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = IpfsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ipfs_constants_1.IPFS_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map