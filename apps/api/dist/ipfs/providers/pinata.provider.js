"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PinataProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinataProvider = void 0;
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
const ipfs_constants_1 = require("../ipfs.constants");
const ipfs_utils_1 = require("../ipfs.utils");
let PinataProvider = PinataProvider_1 = class PinataProvider {
    constructor() {
        this.name = 'pinata';
        this.logger = new common_1.Logger(PinataProvider_1.name);
        this.jwt = process.env.PINATA_JWT ?? '';
        this.network = process.env.PINATA_NETWORK ?? ipfs_constants_1.DEFAULT_PINATA_NETWORK;
        this.gateway = process.env.IPFS_GATEWAY_URL ?? ipfs_constants_1.DEFAULT_IPFS_GATEWAY;
    }
    isConfigured() {
        return this.jwt.length > 0;
    }
    gatewayUrl(cid) {
        return (0, ipfs_utils_1.buildGatewayUrl)(this.gateway, cid);
    }
    async uploadFile(buffer, filename, contentType) {
        const name = (0, ipfs_utils_1.sanitizeFilename)(filename);
        const form = new FormData();
        form.append('file', new Blob([new Uint8Array(buffer)], { type: contentType }), name);
        form.append('network', this.network);
        form.append('name', name);
        const result = await this.post(form, `file ${name}`);
        return { cid: result.cid, size: result.size ?? buffer.length };
    }
    async uploadJson(data, name) {
        const json = JSON.stringify(data, null, 2);
        const bytes = Buffer.from(json, 'utf8');
        const filename = (0, ipfs_utils_1.sanitizeFilename)(name.endsWith('.json') ? name : `${name}.json`);
        const form = new FormData();
        form.append('file', new Blob([new Uint8Array(bytes)], { type: 'application/json' }), filename);
        form.append('network', this.network);
        form.append('name', filename);
        const result = await this.post(form, `json ${filename}`);
        return { cid: result.cid, size: result.size ?? bytes.length };
    }
    async fetchFile(cid) {
        const url = this.gatewayUrl(cid);
        const res = await fetch(url, { signal: AbortSignal.timeout(ipfs_constants_1.IPFS_REQUEST_TIMEOUT_MS) });
        if (!res.ok) {
            throw new ipfs_utils_1.PermanentIpfsError(`Gateway returned ${res.status} for ${cid}`, res.status);
        }
        if (!res.body) {
            throw new ipfs_utils_1.PermanentIpfsError(`Gateway returned an empty body for ${cid}`);
        }
        const contentLength = res.headers.get('content-length');
        return {
            stream: stream_1.Readable.fromWeb(res.body),
            contentType: res.headers.get('content-type') ?? 'application/octet-stream',
            contentLength: contentLength ? Number(contentLength) : undefined,
        };
    }
    async status(cid) {
        try {
            const res = await fetch(this.gatewayUrl(cid), {
                method: 'HEAD',
                signal: AbortSignal.timeout(ipfs_constants_1.IPFS_REQUEST_TIMEOUT_MS),
            });
            return { pinned: res.ok };
        }
        catch {
            return { pinned: false };
        }
    }
    async post(form, label) {
        if (!this.isConfigured()) {
            throw new ipfs_utils_1.PermanentIpfsError('PINATA_JWT is not configured');
        }
        return (0, ipfs_utils_1.withRetry)(async () => {
            const res = await fetch(ipfs_constants_1.PINATA_UPLOAD_URL, {
                method: 'POST',
                headers: { Authorization: `Bearer ${this.jwt}` },
                body: form,
                signal: AbortSignal.timeout(ipfs_constants_1.IPFS_REQUEST_TIMEOUT_MS),
            });
            if (!res.ok) {
                const detail = await res.text().catch(() => '');
                const message = `Pinata upload failed (${res.status}) for ${label}${detail ? `: ${detail.slice(0, 300)}` : ''}`;
                if (!(0, ipfs_utils_1.isRetryableStatus)(res.status)) {
                    throw new ipfs_utils_1.PermanentIpfsError(message, res.status);
                }
                throw new Error(message);
            }
            const body = (await res.json());
            const cid = body.data?.cid;
            if (!cid) {
                throw new ipfs_utils_1.PermanentIpfsError(`Pinata accepted ${label} but returned no CID: ${JSON.stringify(body).slice(0, 300)}`);
            }
            return { cid, size: body.data?.size };
        }, {
            onRetry: (attempt, error, delayMs) => this.logger.warn(`Pinata upload attempt ${attempt} failed for ${label}, retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`),
        });
    }
};
exports.PinataProvider = PinataProvider;
exports.PinataProvider = PinataProvider = PinataProvider_1 = __decorate([
    (0, common_1.Injectable)()
], PinataProvider);
//# sourceMappingURL=pinata.provider.js.map